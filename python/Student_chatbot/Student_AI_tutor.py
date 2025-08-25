import sys
import os
import logging
import base64
import asyncio
from io import BytesIO
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Union, AsyncGenerator, TypedDict, Annotated, Any
from dataclasses import field, dataclass
import concurrent.futures
import inspect
from functools import wraps
import tempfile
import shutil

from PIL import Image
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain.tools import tool, Tool
import time
from langchain_google_genai import ChatGoogleGenerativeAI
import langchain
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Add error handling for Qdrant imports
try:
    from langchain_qdrant import QdrantVectorStore
    from qdrant_client import QdrantClient, models
    from qdrant_client.models import Distance, VectorParams, PointStruct
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    logging.warning("Qdrant packages not found. Vector storage features will be disabled.")

from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Add error handling for retriever imports
try:
    from langchain_community.retrievers import BM25Retriever
    from langchain.retrievers import EnsembleRetriever
    RETRIEVER_AVAILABLE = True
except ImportError:
    RETRIEVER_AVAILABLE = False
    logging.warning("BM25Retriever or EnsembleRetriever not available. Hybrid search will be disabled.")

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from langsmith import traceable

from langchain_community.document_loaders import (
    PDFPlumberLoader, Docx2txtLoader, BSHTMLLoader, TextLoader, UnstructuredURLLoader, JSONLoader
)

# Import the web search tool
from websearch_code import PerplexityWebSearchTool

import json
import re
from enum import Enum
from typing import Literal
from langgraph.prebuilt.tool_node import ToolNode
from media_toolkit.image_generation_model import ImageGenerator

# Add import for LangGraph streaming
from langgraph.config import get_stream_writer

# Define the orchestrator state
class OrchestratorState(TypedDict):
    """State for the orchestrator agent."""
    messages: Annotated[list, add_messages]
    action: Optional[str]
    image_generation_params: Optional[dict]
    student_details: Optional[dict]
    history: Optional[list] # MODIFICATION: Added to track conversation history

# Define the action types
class ActionType(str, Enum):
    USE_LLM_WITH_TOOLS = "use_llm_with_tools"
    GENERATE_IMAGE = "generate_image"

# Image generation tool function
@tool
async def image_generation_tool(schema: dict) -> str:
    """
    Generate educational images, charts, diagrams based on the provided schema.
    
    Args:
        schema (dict): A dictionary containing the following keys:
            - topic (str): The main subject of the image.
            - grade_level (str): The educational level (e.g., "elementary", "middle school", "high school").
            - preferred_visual_type (str): The type of visual (e.g., "diagram", "chart", "infographic").
            - subject (str): The academic subject (e.g., "biology", "mathematics").
            - language (str): The language for any text in the image.
            - instructions (str): Specific details for the image.
            - difficulty_flag (str, optional): "true" for more detailed images, "false" for simpler ones.
    
    Returns:
        str: A base64 encoded image string that can be displayed directly.
    """
    try:
        generator = ImageGenerator()
        image_base64 = generator.generate_image_from_schema(schema)
        if image_base64:
            return f"![Generated Image](data:image/png;base64,{image_base64})"
        else:
            return "Failed to generate image. Please check your parameters and try again."
    except Exception as e:
        logging.error(f"Error generating image: {e}")
        return f"Error generating image: {str(e)}"


load_dotenv()

# LangSmith configuration
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT="Vamshi-test"

QDRANT_VECTOR_PARAMS = VectorParams(size=1536, distance=Distance.COSINE)
CONTENT_PAYLOAD_KEY = "page_content"
METADATA_PAYLOAD_KEY = "metadata"

default_qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
default_qdrant_api_key = os.getenv("QDRANT_API_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# @tool
# def general_conversation_tool(query: str) -> str:
#     """
#     Use this tool ONLY for simple, non-substantive conversational turns like 'hello', 'thanks', or 'how are you?'.
#     You MUST NOT use this tool for any question that seeks information, facts, definitions, or explanations (e.g., 'what is X?', 'explain Y').
#     For informational queries, you MUST use another tool or answer from your own knowledge. This tool's purpose is strictly for handling conversational pleasantries.
#     """
#     return "give relevant response to the user query and encourage user to ask questions and learn {chat_history}."


def async_error_handler(func):
    """
    Decorator for enhanced async error handling that works with both
    coroutines and async generators.
    """
    if inspect.isasyncgenfunction(func):
        # Wrapper for async generators
        @wraps(func)
        async def generator_wrapper(*args, **kwargs):
            try:
                async for item in func(*args, **kwargs):
                    yield item
            except Exception as e:
                logging.error(f"Error in async generator {func.__name__}: {e}")
                raise
        return generator_wrapper
    else:
        # Wrapper for regular async functions (coroutines)
        @wraps(func)
        async def coroutine_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logging.error(f"Error in coroutine {func.__name__}: {e}")
                raise
        return coroutine_wrapper

class VectorStoreManager:
    """Manages the Qdrant vector store operations."""
    def __init__(self, config):
        self.config = config
        self.qdrant_client = None
        self.vector_store = None
        self.embeddings = OpenAIEmbeddings(
            model=self.config.embedding_model,
            openai_api_key=self.config.openai_api_key
        )
        if QDRANT_AVAILABLE:
            self.qdrant_client = QdrantClient(
                url=self.config.qdrant_url, 
                api_key=self.config.qdrant_api_key,
                timeout=20.0
            )

    async def initialize_collection(self):
        """Initializes the Qdrant collection, creating it if it doesn't exist."""
        if not self.qdrant_client:
            logging.error("Qdrant client not available.")
            return

        target_collection = self.config.qdrant_collection_name
        if not target_collection:
            logging.error("Qdrant collection name is not set.")
            raise ValueError("Cannot initialize collection without a name.")
            
        try:
            collections = await asyncio.to_thread(self.qdrant_client.get_collections)
            collection_names = [col.name for col in collections.collections]

            if target_collection not in collection_names:
                logging.info(f"Creating Qdrant collection: {target_collection}")
                await asyncio.to_thread(
                    self.qdrant_client.create_collection,
                    collection_name=target_collection,
                    vectors_config=QDRANT_VECTOR_PARAMS
                )
            
            self.vector_store = QdrantVectorStore(
                client=self.qdrant_client,
                collection_name=target_collection,
                embedding=self.embeddings,
                content_payload_key=CONTENT_PAYLOAD_KEY,
                metadata_payload_key=METADATA_PAYLOAD_KEY
            )
            logging.info(f"Vector store initialized for collection: {target_collection}")

        except Exception as e:
            logging.error(f"Failed to initialize Qdrant collection: {e}")
            raise
            
    def get_retriever(self, k: int):
        """Gets a retriever from the initialized vector store."""
        if not self.vector_store:
            raise RuntimeError("Vector store is not initialized. Call initialize_collection first.")
        return self.vector_store.as_retriever(search_kwargs={"k": k})
        
    async def aadd_documents(self, documents: List[Document]):
        """Asynchronously adds documents to the vector store."""
        if not self.vector_store:
            raise RuntimeError("Vector store is not initialized. Call initialize_collection first.")
        await self.vector_store.aadd_documents(documents)
    

    @async_error_handler
    async def clear_collection_async(self):
        """
        Deletes and immediately recreates the collection to wipe all its data.
        """
        if not self.qdrant_client:
            logging.error("Qdrant client not available. Cannot clear collection.")
            return

        target_collection = self.config.qdrant_collection_name
        logging.warning(f"Clearing all documents from Qdrant collection: {target_collection}")
        
        try:
            await asyncio.to_thread(
                self.qdrant_client.delete_collection,
                collection_name=target_collection
            )
            logging.info(f"Successfully deleted collection: {target_collection}")
            
            await self.initialize_collection()
            logging.info(f"Successfully re-initialized collection: {target_collection}")

        except Exception as e:
            logging.error(f"Error during collection clearing for {target_collection}, attempting to re-initialize. Error: {e}")
            await self.initialize_collection()

class TutorState(TypedDict):
    """State for the AI tutor agent."""
    messages: Annotated[list, add_messages]

@dataclass
class RAGTutorConfig:
    """Configuration class for the AI Tutor."""
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    google_api_key: str = os.getenv("GOOGLE_API_KEY")
    llm_model: str = "gpt-4o"  # Default to OpenAI's GPT-4o-mini
    streaming: bool = True
    temperature: float = 0.2
    max_tokens: int = 2000
    embedding_model: str = "text-embedding-3-small"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_k: int = 5
    image_extensions: Tuple[str, ...] = field(default_factory=lambda: (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"))
    max_workers: int = 2
    qdrant_url: str = field(default_factory=lambda: default_qdrant_url)
    qdrant_api_key: Optional[str] = field(default_factory=lambda: default_qdrant_api_key)
    qdrant_collection_name: Optional[str] = None
    web_search_enabled: bool = False
    
    # MODIFICATION: Split the system prompt into initial and follow-up versions.
    initial_system_prompt: str = """You are an expert AI Learning Coach. Your mission is to be a friendly and encouraging guide for students, helping them understand their assignments and learn effectively.

**Student Details:**
{student_details_schema}

**Your Coaching Persona & Philosophy:**
- **Be Friendly & Encouraging**: Use a positive and supportive tone. Act as their personal coach.
- **Understand the Goal**: Your primary goal is to help the student *learn*, not just to give them answers.
- **Guide, Don't Solve**: Never provide direct answers to assignments. Instead, guide them with step-by-step explanations, ask probing questions to check their understanding, and help them break down complex problems.
- **Personalize Your Help**: Use the student's details to tailor your conversation. Acknowledge their subjects and the specific tasks they've listed.
- **Build Connections**: Relate homework topics to real-world applications to make learning more engaging.

**How to Interact:**
1.  **First Message Only**: Greet the student by their name and acknowledge their tasks. For example: "Hi [Student Name]! I see you're working on [Subject] and [another Subject]. I'm here to help you tackle those assignments. Which one would you like to start with?"
2.  **Homework Analysis**: When homework documents are uploaded, identify key learning objectives. Connect them back to the student's pending tasks.
3.  **Answering Questions**:
    - **Concept Explanation**: Break down complex topics into simple, digestible parts.
    - **Problem-Solving Methodology**: Teach the "how" and "why" behind solutions. Ask them to try a step first.
    - **Highlight Common Mistakes**: Gently point out typical errors students make in the subject.
4.  **Interactive Learning**:
    - Ask clarifying questions about what they find difficult.
    - Provide hints before full explanations.
    - Encourage students to attempt solutions on their own first.
    - Offer additional practice suggestions.

**Tool Usage:**
- **Web Search (`websearch_tool`)**: Use this to find current, real-world information or examples related to their assignments. Always cite your sources with favicons, titles, and URLs.
- **Knowledge Base (`knowledge_base_retriever`)**: Prioritize this tool when the student asks about documents they have uploaded.
- **Conversation**: Use for simple greetings or praise after your main coaching response and encourage student to ask questions and learn.
- **Synthesize Information**: If both knowledge base and web search are enabled, combine information from both to give comprehensive guidance.

Your ultimate goal is to empower the student to learn and grow. Be the best coach you can be!

**🕒 Current Time**: {current_time}
"""

    follow_up_system_prompt: str = """You are an expert AI Learning Coach. Your mission is to be a friendly and encouraging guide for students, helping them understand their assignments and learn effectively.

**Student Details:**
{student_details_schema}

**Your Coaching Persona & Philosophy:**
- **Be Friendly & Encouraging**: Use a positive and supportive tone. Act as their personal coach.
- **Understand the Goal**: Your primary goal is to help the student *learn*, not just to give them answers.
- **Guide, Don't Solve**: Never provide direct answers to assignments. Instead, guide them with step-by-step explanations, ask probing questions to check their understanding, and help them break down complex problems.
- **Personalize Your Help**: Use the student's details to tailor your conversation. Acknowledge their subjects and the specific tasks they've listed.
- **Build Connections**: Relate homework topics to real-world applications to make learning more engaging.

**How to Interact:**
1.  **Get Straight to the Point**: Do NOT greet the student by name. Get straight to the point of their question or request in a helpful and encouraging manner.
2.  **Homework Analysis**: When homework documents are uploaded, identify key learning objectives. Connect them back to the student's pending tasks.
3.  **Answering Questions**:
    - **Concept Explanation**: Break down complex topics into simple, digestible parts.
    - **Problem-Solving Methodology**: Teach the "how" and "why" behind solutions. Ask them to try a step first.
    - **Highlight Common Mistakes**: Gently point out typical errors students make in the subject.
4.  **Interactive Learning**:
    - Ask clarifying questions about what they find difficult.
    - Provide hints before full explanations.
    - Encourage students to attempt solutions on their own first.
    - Offer additional practice suggestions.

**Tool Usage:**
- **Web Search (`websearch_tool`)**: Use this to find current, real-world information or examples related to their assignments. Always cite your sources with favicons, titles, and URLs.
- **Knowledge Base (`knowledge_base_retriever`)**: Prioritize this tool when the student asks about documents they have uploaded.
- **Conversation**: Use for simple greetings or praise after your main coaching response and encourage student to ask questions and learn.
- **Synthesize Information**: If both knowledge base and web search are enabled, combine information from both to give comprehensive guidance.

Your ultimate goal is to empower the student to learn and grow. Be the best coach you can be!

**🕒 Current Time**: {current_time}
"""

    @classmethod
    def from_env(cls) -> 'RAGTutorConfig':
        """Create configuration from environment variables."""
        return cls()

class AsyncRAGTutor:
    def __init__(self, storage_manager: Any, config: Optional[RAGTutorConfig] = None):
        self.config = config or RAGTutorConfig()
        
        unique_id = datetime.now().strftime("%Y%m%d%H%M%S%f")
        self.config.qdrant_collection_name = f"rag_session_{unique_id}"
        logging.info(f"Initialized new tutor instance with collection: {self.config.qdrant_collection_name}")

        try:
            logging.info("Initializing response through OpenAI's API model ( GPT-4o).")
            self.llm = ChatOpenAI(
                model=self.config.llm_model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                streaming=self.config.streaming,
                openai_api_key=self.config.openai_api_key,
            )
        except Exception as e:
            logging.error(f"Error initializing ChatOpenAI: {e}")
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash-latest",
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                google_api_key=self.config.google_api_key,
                streaming=self.config.streaming
            )
        
        self.storage_manager = storage_manager

        self.retriever_tool = Tool(
            name="knowledge_base_retriever",
            func=self.knowledge_base_retrieval_tool,
            coroutine=self.knowledge_base_retrieval_tool,
            description=(
                "Use this tool to answer questions about any uploaded documents, including text, PDFs, and images. "
                "This is your primary tool for retrieving information. If the user's query mentions a specific filename "
                "(e.g., 'homework.pdf', 'diagram.png'), you MUST use this tool. It is the only way to access the "
                "content of the files the user has provided."
            )
        )
        
        self.tools = [self.retriever_tool]
        
        if self.config.web_search_enabled:
            if os.getenv("PPLX_API_KEY"):
                logging.info("Web search is enabled and PPLX_API_KEY is set.")
                # Updated to use Perplexity 
                websearch_tool = PerplexityWebSearchTool(
                    max_results=5, 
                    model="sonar", 
                    include_links=True
                ).get_tool()
                self.tools.append(websearch_tool)
            else:
                logging.warning("Web search is enabled in config, but PPLX_API_KEY is not set. Web search will be disabled.")
                
        self.tool_map = {tool.name: tool for tool in self.tools}
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        
        # Create an image generation tool node (will be used in the LangGraph)
        self.image_generation_tool = ToolNode(
            name="image_generator",
            tools=[image_generation_tool]
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap
        )
        
        self.vectorstore_manager = VectorStoreManager(self.config) if QDRANT_AVAILABLE else None
        self.ensemble_retriever = None
        self.graph = None
        self.short_responses = ["ok", "okay", "thanks", "thank you", "great", "good", "cool","hello", "hi", "hey", "greetings", "yo", "sup", "good morning", "good afternoon", "good evening"]
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=self.config.max_workers)

        self.rephrase_prompt = PromptTemplate.from_template(
            """Given a chat history and a follow-up question, rephrase the follow-up question into a clear, standalone instruction.

**Instructions:**
1.  **Handle Conversational Fillers First:** If the `Follow-up Question` is a simple, common conversational phrase (e.g., "okay", "great", "thanks"), your most important task is to return it **UNCHANGED**. This rule overrides all others.

2.  **Handle Visual Follow-ups:** If the `Follow-up Question` is a request for a visual representation (e.g., "explain with a diagram," "can you draw that?," "show me a chart"), you MUST combine it with the main topic from the `Chat History` to create a complete, actionable command for an image generator.
    - **Example 1:**
        - Chat History: User: "What is the water cycle?"
        - Follow-up Question: "Can you explain it with a diagram?"
        - Standalone Question: "Generate a diagram that explains the water cycle."
    - **Example 2:**
        - Chat History: User: "structure of a plant cell."
        - Follow-up Question: "explain with a diagram"
        - Standalone Question: "Generate a diagram showing the structure of a plant cell."

3.  **Handle Uploaded Files:** If the question is NOT a filler or a visual follow-up AND the `Chat History` contains a `System Note` listing uploaded files, you MUST rewrite the `Follow-up Question` to be specifically about those files, including the filename(s).
    - **Example for documents:**
        - System Note: The user has just uploaded 'homework_chapter_3.pdf'.
        - Follow-up Question: can you explain this?
        - Standalone Question: Can you explain the content of the document 'homework_chapter_3.pdf'?

4.  **General Rephrasing:** If the question is not covered by the rules above, use the chat history to create a clear, standalone question. If the original question is already perfectly standalone, return it as is.

 Chat History:
 {chat_history}
 
 Follow-up Question: {question}
 
 Standalone Question:"""
        )
        self.rephrase_chain = self.rephrase_prompt | self.llm | StrOutputParser()
        
        # Router prompt for the orchestrator
        self.router_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an intelligent router that determines which action to take based on user input.
            
ONLY respond with one of the following options:
1. "use_llm_with_tools" - Use this when the user is asking a question that can be answered with standard tools like knowledge base retrieval, web search, or conversation.
2. "generate_image" - Use this ONLY when the user explicitly asks to generate or create an image, diagram, chart, or visual representation.

For image generation requests, you MUST extract and return the following parameters:
- topic: The main subject of the image
- grade_level: Educational level (e.g., "elementary", "middle school", "high school") 
- preferred_visual_type: Type of visual (e.g., "diagram", "chart", "infographic")
- subject: Academic subject (e.g., "biology", "physics")
- language: Language for text (default to "English" if not specified)
- instructions: Specific requirements for the image
- difficulty_flag: Set to "true" for advanced visuals, "false" for simpler ones (default to "false")

IMPORTANT: For image generation requests, return your decision as a valid JSON object with two keys:
1. "action": "generate_image"
2. "parameters": {{ all the extracted parameters as described above }}

For regular queries that don't need image generation, simply respond with "use_llm_with_tools"."""),
            ("human", "{input}")
        ])
        
        self.router_chain = self.router_prompt | self.llm | StrOutputParser()

    @async_error_handler
    async def clear_knowledge_base_async(self):
        """Public method to clear the knowledge base and reset the retriever."""
        logging.info("Clearing knowledge base and resetting retriever.")
        if self.vectorstore_manager:
            await self.vectorstore_manager.clear_collection_async()
        self.ensemble_retriever = None

    async def knowledge_base_retrieval_tool(self, query: str) -> str:
        """Use this tool to answer questions by retrieving relevant information from the knowledge base."""
        if not self.ensemble_retriever:
            return "No knowledge base has been configured. Please upload documents to create one."
        logging.info(f"Activating knowledge base tool for query: {query}")
        retrieved_docs = await self.ensemble_retriever.ainvoke(query)
        if not retrieved_docs:
            return "No relevant information was found in the knowledge base for this query. You can try rephrasing the question."
        return self.format_docs(retrieved_docs)

    def update_web_search_status(self, web_search_enabled: bool):
        """Dynamically enables or disables the web search tool without re-initializing."""
        self.config.web_search_enabled = web_search_enabled
        logging.info(f"Updating web search status to: {self.config.web_search_enabled}")

        # Check if the web search tool is currently in our list of tools
        websearch_tool_present = any(tool.name == 'perplexity_search' for tool in self.tools)

        if self.config.web_search_enabled and not websearch_tool_present:
            if os.getenv("PPLX_API_KEY"):
                logging.info("Enabling and adding web search tool.")
                # We instantiate the tool using the class from websearch_code.py
                websearch_tool = PerplexityWebSearchTool(
                    max_results=5, 
                    model="sonar", 
                    include_links=True
                ).get_tool()
                self.tools.append(websearch_tool)
            else:
                logging.warning("Cannot enable web search: PPLX_API_KEY is not set.")
                self.config.web_search_enabled = False # Ensure config reflects reality

        elif not self.config.web_search_enabled and websearch_tool_present:
            logging.info("Disabling and removing web search tool.")
            self.tools = [tool for tool in self.tools if tool.name != 'perplexity_search']

        # CRITICAL: Re-create the tool map and re-bind the tools to the LLM
        self.tool_map = {tool.name: tool for tool in self.tools}
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        logging.info(f"Tools updated. Current tools: {[tool.name for tool in self.tools]}")

    def _is_greeting_or_short_response(self, query: str) -> bool:
        """Checks if the query is a simple greeting or a short, common response."""
        normalized_query = query.strip().lower()
        return normalized_query in self.short_responses

    @staticmethod
    async def encode_image_async(image_path: str) -> str:
        """Convert image to base64 string asynchronously."""
        loop = asyncio.get_event_loop()
        def _encode_image():
            with Image.open(image_path) as img:
                buffer = BytesIO()
                img_format = img.format if img.format in ['JPEG', 'PNG'] else 'JPEG'
                img.save(buffer, format=img_format)
                return base64.b64encode(buffer.getvalue()).decode('utf-8')
        return await loop.run_in_executor(None, _encode_image)

    def format_docs(self, docs: List[Document]) -> str:
        """Format documents for the prompt."""
        if not docs:
            return "No relevant documents found in the knowledge base."
        return "\n\n".join(f"Source: {doc.metadata.get('source', 'N/A')}\nContent: {doc.page_content}" for doc in docs)

    @traceable(name="initialize_vectorstore")
    async def initialize_vectorstore_async(self, documents: List[Document]):
        """Initialize the vector store with documents."""
        try:
            if not documents:
                logging.info("No documents to initialize vector store with.")
                return False

            if not QDRANT_AVAILABLE:
                logging.warning("Qdrant is not available. Vector store will not be initialized.")
                return False

            if self.vectorstore_manager is None:
                if self.config.qdrant_collection_name is None:
                    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
                    self.config.qdrant_collection_name = f"rag_session_{timestamp}"
                
                config = {
                    'url': self.config.qdrant_url,
                    'api_key': self.config.qdrant_api_key,
                    'collection_name': self.config.qdrant_collection_name
                }
                self.vectorstore_manager = VectorStoreManager(config)
                await self.vectorstore_manager.initialize_collection()
                logging.info(f"Vector store initialized for collection: {self.config.qdrant_collection_name}")
            
            await self.vectorstore_manager.aadd_documents(documents)
            
            self.retriever = self.vectorstore_manager.get_retriever(k=self.config.retrieval_k)
            
            if RETRIEVER_AVAILABLE:
                try:
                    bm25_retriever = BM25Retriever.from_documents(
                        documents, preprocess_func=lambda text: text.split()
                    )
                    bm25_retriever.k = self.config.retrieval_k
                    
                    self.ensemble_retriever = EnsembleRetriever(
                        retrievers=[self.retriever, bm25_retriever],
                        weights=[0.7, 0.3]
                    )
                    logging.info("Ensemble retriever configured with vector + BM25")
                except Exception as e:
                    logging.error(f"Error setting up hybrid retriever: {e}. Falling back to vector retriever.")
                    self.ensemble_retriever = self.retriever
            else:
                self.ensemble_retriever = self.retriever
            
            return True
        except Exception as e:
            logging.error(f"Error initializing vector store: {e}")
            return False

    @async_error_handler
    async def ingest_async(self, storage_keys: List[str]) -> bool:
        """Concurrently ingests documents from storage keys, now with image support."""
        if not storage_keys:
            logging.warning("No storage keys provided for ingestion.")
            return False

        logging.info(f"Starting concurrent ingestion for {len(storage_keys)} storage keys.")

        async def _process_single_key(key: str) -> List[Document]:
            """Fetches a file from storage and processes it as a document or image."""
            try:
                file_content = await self.storage_manager.get_file_content_bytes_async(key)
                if not file_content:
                    logging.error(f"Failed to get content for key: {key}")
                    return []

                filename = os.path.basename(key)
                
                if filename.lower().endswith(self.config.image_extensions):
                    logging.info(f"🖼️ Detected image file: {filename}. Analyzing with vision model.")
                    image_description = await self._process_image_from_bytes_async(file_content, filename)
                    if image_description:
                        return [Document(page_content=image_description, metadata={'source': filename, 'type': 'image'})]
                else:
                    return await self._process_document_from_bytes_async(file_content, filename)
            except Exception as e:
                logging.error(f"Exception while processing file for key {key}: {e}", exc_info=True)
            return []

        tasks = [_process_single_key(key) for key in storage_keys]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_processed_docs = []
        for res in results:
            if isinstance(res, list):
                all_processed_docs.extend(res)
            elif isinstance(res, Exception):
                logging.error(f"Error during concurrent ingestion task: {res}")

        if all_processed_docs:
            logging.info(f"Ingesting {len(all_processed_docs)} processed documents into vector store.")
            return await self.initialize_vectorstore_async(all_processed_docs)
        else:
            logging.warning("No documents were successfully processed for ingestion.")
            return False

    async def _process_image_from_bytes_async(self, image_bytes: bytes, filename: str) -> Optional[str]:
        """
        Processes an image from bytes, generating a description using a vision model.
        It first tries to use Google's Generative AI model and falls back to OpenAI's model on failure.
        """
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            prompt_text = "Describe this image for a search index. Be detailed about any objects, text, people, and the overall scene or context. This description will be used to find this image in a knowledge base."
            image_url = f"data:image/jpeg;base64,{base64_image}"

            try:
                logging.info(f"Attempting to generate description for '{filename}' with OpenAI's model.")
                vision_model_openai = ChatOpenAI(
                    model=self.config.llm_model,
                    max_tokens=1024,
                    openai_api_key=self.config.openai_api_key
                    )
                response = await vision_model_openai.ainvoke([
                    HumanMessage(content=[
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ])
                ])
                description = f"Image Content (from file: {filename}):\n{response.content}"
                logging.info(f"Successfully generated description for '{filename}' using OpenAI's model.")
                return description

            except Exception as e_openai:
                logging.error(f"Error using OpenAI's model for '{filename}': {e_openai}. Falling back to OpenAI's model.")

                # Fallback to OpenAI's model
                try:
                    logging.info(f"Attempting to generate description for '{filename}' with Google's model.")
                    vision_model = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash-latest",
                    max_tokens=self.config.max_tokens,
                    google_api_key=self.config.google_api_key,
                )
                    response = await vision_model.ainvoke([
                    HumanMessage(content=[
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ])
                ])
                    description = f"Image Content (from file: {filename}):\n{response.content}"
                    logging.info(f"Successfully generated description for '{filename}' using Google's model.")
                    return description

                except Exception as e_google:
                    logging.error(f"Error processing image '{filename}' with fallback Google model: {e_google}", exc_info=True)
                    return None

        except Exception as e_initial:
            # This catches errors in the initial setup (e.g., base64 encoding)
            logging.error(f"An initial error occurred while processing '{filename}': {e_initial}", exc_info=True)
            return None
            
    async def _process_document_from_bytes_async(self, file_bytes: bytes, filename: str) -> List[Document]:
        """Processes a standard document from bytes by writing to a temp file for loading."""
        temp_file_path = None
        try:
            file_extension = os.path.splitext(filename)[1].lower()
            with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
                temp_file.write(file_bytes)
                temp_file_path = temp_file.name
            
            loader = None
            if file_extension == '.pdf': loader = PDFPlumberLoader(temp_file_path)
            elif file_extension == '.docx': loader = Docx2txtLoader(temp_file_path)
            elif file_extension == '.json': loader = JSONLoader(temp_file_path, jq_schema='.[*]', text_content=False)
            elif file_extension in ['.html', '.htm', '.xhtml']: loader = BSHTMLLoader(temp_file_path)
            elif file_extension in ['.txt', '.md']: loader = TextLoader(temp_file_path, autodetect_encoding=True)
            
            if loader:
                logging.info(f"📄 Loading document: {filename}")
                docs = await asyncio.to_thread(loader.load)
                for doc in docs:
                    doc.metadata['source'] = filename 
                return docs
            else:
                logging.warning(f"No loader available for file extension {file_extension} of file {filename}")

        except Exception as e:
            logging.error(f"Error processing document {filename}: {e}", exc_info=True)
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        return []

    @async_error_handler
    # MODIFICATION: Added 'history' parameter to the method signature
    async def _agent_executor_stream_async(self, query: str, formatted_time: str, image_path: Optional[str] = None, is_knowledge_base_ready: bool = False, student_details: Optional[Dict[str, Any]] = None, history: Optional[List[Dict[str, Any]]] = None) -> AsyncGenerator[str, None]:
        """Private method to invoke the tool-enabled LLM with a finalized query."""
        student_details_str = "No student details provided. Please ask the student for their name, class, and subjects."
        if student_details:
            try:
                # Pretty-print the JSON for better readability in the prompt
                student_details_str = json.dumps(student_details, indent=2)
            except TypeError:
                student_details_str = str(student_details)

        # MODIFICATION: Logic to select the correct prompt based on conversation history
        if history: # If history is not empty, it's a follow-up message
            system_prompt_template = self.config.follow_up_system_prompt
            logging.info("Using follow-up system prompt.")
        else: # If history is empty, it's the first message
            system_prompt_template = self.config.initial_system_prompt
            logging.info("Using initial system prompt.")

        system_prompt_text = system_prompt_template.format(
            current_time=formatted_time,
            student_details_schema=student_details_str
        )
        
        prompt_notes = []
        if is_knowledge_base_ready:
            prompt_notes.append("- **Knowledge Base**: AVAILABLE. Prioritize the 'knowledge_base_retriever' tool for questions about uploaded documents.")
        else:
            prompt_notes.append("- **Knowledge Base**: NOT AVAILABLE. Do not use the 'knowledge_base_retriever' tool.")

        if self.config.web_search_enabled:
            prompt_notes.append("- **Web Search**: ENABLED. You can use the 'websearch_tool' tool for web searches.")
        else:
            prompt_notes.append("- **Web Search**: DISABLED.")
        
        if prompt_notes:
            system_prompt_text += "\n\n**Current Session Status:**\n" + "\n".join(prompt_notes)

        message_content = [{"type": "text", "text": query}]
        if image_path:
            logging.info(f"Encoding image {image_path} for direct agent analysis.")
            base64_image = await self.encode_image_async(image_path)
            message_content.append(
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            )

        messages = [SystemMessage(content=system_prompt_text), HumanMessage(content=message_content)]
        ai_response_with_tool = await self.llm_with_tools.ainvoke(messages)
        

        # **FIXED LOGIC STARTS HERE**
        if not ai_response_with_tool.tool_calls:
            # Scenario 1: The LLM decided to answer directly.
            # To ensure a consistent streaming experience, we will re-invoke the LLM
            # in streaming mode to deliver the final answer.
            logging.info("LLM provided a direct answer without tool usage. Invoking a new stream for the response.")
            final_chain = self.llm | StrOutputParser()
            # `messages` already contains the System and Human messages that led to this decision.
            async for chunk in final_chain.astream(messages):
                yield chunk
            return

        messages.append(ai_response_with_tool)
        # Scenario 2: The LLM decided to call one or more tools.
        for tool_call in ai_response_with_tool.tool_calls:
            tool_name = tool_call["name"]
            logging.info(f"LLM decided to call tool: {tool_name} with args {tool_call['args']}")
            if tool_name in self.tool_map:
                selected_tool = self.tool_map[tool_name]
                tool_output = await selected_tool.ainvoke(tool_call["args"])
            else:
                tool_output = f"Error: Tool '{tool_name}' not found."
            messages.append(ToolMessage(content=str(tool_output), tool_call_id=tool_call["id"]))

        # Now, invoke the model again with the tool results to get the final answer.
        final_chain = self.llm | StrOutputParser()
        async for chunk in final_chain.astream(messages):
            yield chunk

    # Add this new method to create and parse the routing decision
    async def _route_query(self, query: str) -> dict:
        """Determine which action to take based on the user query."""
        try:
            router_response = await self.router_chain.ainvoke({"input": query})
            logging.info(f"Router response: {router_response}")
            
            # Check if the response is a JSON object
            if router_response.strip().startswith("{") and router_response.strip().endswith("}"):
                try:
                    parsed_response = json.loads(router_response)
                    if parsed_response.get("action") == "generate_image" and "parameters" in parsed_response:
                        return {
                            "action": ActionType.GENERATE_IMAGE,
                            "parameters": parsed_response["parameters"]
                        }
                except json.JSONDecodeError:
                    logging.warning(f"Failed to parse JSON from router: {router_response}")
            
            # If the response contains "generate_image" but isn't proper JSON, try to extract parameters
            if "generate_image" in router_response.lower():
                # Simple regex-based extraction of parameters
                parameters = {}
                
                # Extract key parameters using regex patterns
                topic_match = re.search(r'topic["\s:]+([^",\n]+)', router_response)
                if topic_match:
                    parameters["topic"] = topic_match.group(1).strip()
                
                grade_match = re.search(r'grade_level["\s:]+([^",\n]+)', router_response)
                if grade_match:
                    parameters["grade_level"] = grade_match.group(1).strip()
                
                visual_match = re.search(r'preferred_visual_type["\s:]+([^",\n]+)', router_response)
                if visual_match:
                    parameters["preferred_visual_type"] = visual_match.group(1).strip()
                
                subject_match = re.search(r'subject["\s:]+([^",\n]+)', router_response)
                if subject_match:
                    parameters["subject"] = subject_match.group(1).strip()
                
                language_match = re.search(r'language["\s:]+([^",\n]+)', router_response)
                if language_match:
                    parameters["language"] = language_match.group(1).strip()
                else:
                    parameters["language"] = "English"  # Default
                
                instructions_match = re.search(r'instructions["\s:]+([^",\n]+)', router_response)
                if instructions_match:
                    parameters["instructions"] = instructions_match.group(1).strip()
                else:
                    parameters["instructions"] = query  # Default to the query itself
                
                difficulty_match = re.search(r'difficulty_flag["\s:]+([^",\n]+)', router_response)
                if difficulty_match:
                    parameters["difficulty_flag"] = difficulty_match.group(1).strip()
                else:
                    parameters["difficulty_flag"] = "false"  # Default
                
                # Check if we extracted enough parameters
                required_params = ["topic", "grade_level", "preferred_visual_type", "subject", "instructions"]
                if all(param in parameters for param in required_params):
                    return {
                        "action": ActionType.GENERATE_IMAGE,
                        "parameters": parameters
                    }
            
            # Default action
            return {"action": ActionType.USE_LLM_WITH_TOOLS}
        
        except Exception as e:
            logging.error(f"Error in route_query: {e}")
            return {"action": ActionType.USE_LLM_WITH_TOOLS}  # Default to standard LLM response

    # Update the setup_langgraph_async method to implement the orchestrator
    async def setup_langgraph_async(self):
        """Set up the LangGraph orchestrator workflow asynchronously."""
        
        # Router node function to decide which path to take
        async def router_node(state: OrchestratorState) -> dict:
            """Determine which action to take based on the user query."""
            last_message = state["messages"][-1]
            routing_decision = await self._route_query(last_message.content)
            
            if routing_decision["action"] == ActionType.GENERATE_IMAGE:
                return {"action": ActionType.GENERATE_IMAGE, "image_generation_params": routing_decision["parameters"]}
            else:
                return {"action": ActionType.USE_LLM_WITH_TOOLS}
        
        # LLM with tools node function
        async def llm_with_tools_node(state: OrchestratorState):
            """Process the query with the standard LLM and tools using streaming."""
            from langgraph.config import get_stream_writer
            
            last_message = state["messages"][-1]
            # MODIFICATION: Get history from the state
            history = state.get("history", [])
            student_details = state.get("student_details")
            
            formatted_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Get the stream writer to send custom data
            writer = get_stream_writer()
            
            # Stream each chunk as it comes in directly to the output stream
            # MODIFICATION: Pass history to the agent executor
            async for chunk in self._agent_executor_stream_async(
                query=last_message.content,
                formatted_time=formatted_time,
                is_knowledge_base_ready=(self.ensemble_retriever is not None),
                student_details=student_details,
                history=history
            ):
                # Stream each chunk directly using the writer
                writer(chunk)
            
            # Return an empty AI message - the content has already been streamed
            return {"messages": [AIMessage(content="")]}
        
        # Define the conditional edge function
        def route_by_action(state: OrchestratorState):
            """Route to the next node based on the action determined by the router."""
            action = state.get("action")
            if action == ActionType.GENERATE_IMAGE:
                return "image_generator"
            else:
                return "llm_with_tools"
        
        # Define the LangGraph workflow
        workflow = StateGraph(OrchestratorState)
        
        # Add the nodes
        workflow.add_node("router", router_node)
        workflow.add_node("llm_with_tools", llm_with_tools_node)
        workflow.add_node("image_generator", image_generator_node)
        
        # Add edges
        workflow.add_edge(START, "router")
        workflow.add_conditional_edges("router", route_by_action)
        # workflow.add_edge("llm_with_tools", END)
        workflow.add_edge("image_generator", END)
        workflow.add_edge("llm_with_tools", END)
        
        self.graph = workflow.compile()
        logging.info("LangGraph orchestrator workflow created successfully.")
        return self.graph
    
    # Update run_agent_async to use astream instead of ainvoke
    @async_error_handler
    async def run_agent_async(self, query: str, history: List[Dict[str, Any]], image_storage_key: Optional[str] = None, is_knowledge_base_ready: bool = False, uploaded_files: Optional[List[str]] = None, student_details: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
        """Run the agent with a query and history, using the orchestrator graph with streaming."""
        formatted_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        rephrased_query = await self._rephrase_query_with_history_async(query, history, uploaded_files)
        temp_image_path = None
        
        if image_storage_key:
            try:
                image_bytes = await self.storage_manager.get_file_content_bytes_async(image_storage_key)
                if image_bytes:
                    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(image_storage_key)[1], delete=False) as temp_file:
                        temp_file.write(image_bytes)
                        temp_image_path = temp_file.name
                    logging.info(f"Loaded image from storage key '{image_storage_key}' for processing.")
                else:
                    logging.error(f"Failed to load image from storage key: {image_storage_key}")
            except Exception as e:
                logging.error(f"Error handling image storage key {image_storage_key}: {e}")

        try:
            # Initialize the graph if it hasn't been created yet
            if self.graph is None:
                await self.setup_langgraph_async()
                
            # Process the query using the orchestrator graph
            logging.info(f"Processing query via orchestrator graph: {rephrased_query}")
            
            # Invoke the graph with both system and user messages
            messages = [
                SystemMessage(content="You are a helpful AI assistant."),
                HumanMessage(content=rephrased_query)
            ]
            
            # MODIFICATION: Pass the conversation history into the initial state
            initial_state = {
                "messages": messages,
                "student_details": student_details,
                "history": history
            }

            # Use astream with custom stream mode for streaming response
            is_image_response = False
            
            # Use custom stream mode to get the streamed chunks
            async for chunk in self.graph.astream(
                initial_state,
                stream_mode="custom"
            ):
                # Handle different chunk formats
                if isinstance(chunk, dict) and "content" in chunk and "exclude_from_history" in chunk:
                    is_image_response = True
                    yield f"__IMAGE_RESPONSE__{chunk['content']}"
                elif isinstance(chunk, dict) and "content" in chunk:
                    yield chunk["content"]
                elif isinstance(chunk, str):
                    yield chunk
                else:
                    # Try to convert to string for other types
                    yield str(chunk)
                
        finally:
            # Clean up temporary files
            if temp_image_path and os.path.exists(temp_image_path):
                try:
                    os.unlink(temp_image_path)
                    logging.info(f"Cleaned up temporary image file: {temp_image_path}")
                except Exception as e:
                    logging.error(f"Error cleaning up temporary image file: {e}")

    @async_error_handler
    async def _rephrase_query_with_history_async(self, query: str, history: List[Dict[str, Any]], uploaded_files: Optional[List[str]] = None) -> str:
        """Rephrase the query using chat history to make it standalone."""
        try:
            chat_history_str = ""
            if uploaded_files:
                files_str = "', '".join(uploaded_files)
                chat_history_str += f"System Note: The user has just uploaded the following file(s): '{files_str}'. The follow-up question likely refers to these files.\n\n"
            
            # Only use the last user message from history
            for msg in reversed(history):
                if msg.get("role", "") == "user":
                    content = msg.get("content", "")
                    if content and content != query:  # Avoid adding the current query
                        chat_history_str += f"User: {content}\n"
                        break  # Only get the most recent user query
            
            rephrased = await self.rephrase_chain.ainvoke({
                "chat_history": chat_history_str,
                "question": query
            })
            logging.info(f"Query rephrased from '{query}' to '{rephrased}'")
            return rephrased
        except Exception as e:
            logging.error(f"Error rephrasing query: {e}")
            return query

    def __del__(self):
        """Clean up the executor on deletion."""
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)

# Update the image_generation_tool node in setup_langgraph_async method
async def image_generator_node(state: OrchestratorState):
    """Generate an image based on the parameters."""
    writer = get_stream_writer()
    try:
        params = state.get("image_generation_params", {})
        if not params:
            writer("Error: Missing image generation parameters.")
            return {"messages": [AIMessage(content="Error: Missing image generation parameters.")]}
            
        # Stream status update
        writer("Generating image based on your specifications...")
            
        image_generator = ImageGenerator()
        image_base64 = image_generator.generate_image_from_schema(params)
        
        if image_base64:
            # Create a markdown image that can be rendered in the chat
            image_md = f"![Generated Image](data:image/png;base64,{image_base64})"
            # Stream the image
            writer({"content": image_md, "exclude_from_history": True})
            # Add a flag to indicate this is an image response that shouldn't be stored in history
            return {"messages": [AIMessage(content=image_md)], "exclude_from_history": True}
        else:
            writer("Failed to generate image. Please check parameters and try again.")
            return {"messages": [AIMessage(content="Failed to generate image. Please check parameters and try again.")]}
    except Exception as e:
        logging.error(f"Error in image_generator_node: {e}")
        writer(f"Error generating image: {str(e)}")
        return {"messages": [AIMessage(content=f"Error generating image: {str(e)}")]}