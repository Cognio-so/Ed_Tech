import os
import logging
import time
import asyncio  # ASYNC: Imported asyncio
from typing import Annotated, TypedDict, List, Dict, Any, Optional, Literal
from dotenv import load_dotenv

# LangChain imports
from langchain_core.messages import BaseMessage
from langchain_core.tools import StructuredTool
from langchain_tavily import TavilySearch
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

# LangGraph imports
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class WebSearchState(TypedDict):
    """State for the web search graph."""
    messages: Annotated[List[BaseMessage], add_messages]
    search_results: Optional[List[Dict[str, Any]]]

class TavilyWebSearchTool:
    """Reusable Tavily web search tool for LangGraph."""
    
    def __init__(
        self, 
        max_results: int = 5,
        api_key: Optional[str] = None,
        search_depth: Literal['basic', 'advanced'] | None = 'advanced',
        topic: Literal['general', 'news', 'finance'] | None = 'general',
        include_raw_content: bool | Literal['markdown', 'text'] | None = None,
        time_range: Optional[str] = None,
        include_favicon: bool | None = True,
        include_images: bool | None = True
    ):
        """
        Initialize the Tavily web search tool.
        
        Args:
            max_results: Maximum number of search results to return
            api_key: Tavily API key (defaults to TAVILY_API_KEY env variable)
            search_depth: Depth of search ("basic" or "advanced")
            topic: Category of search ("general", "news", or "finance")
            include_raw_content: Include cleaned HTML content
            time_range: Time range for results ("day", "week", "month", "year")
        """
        self.max_results = max_results
        self.api_key = api_key
        
        # Set API key in environment if provided
        if api_key:
            os.environ["TAVILY_API_KEY"] = api_key
        elif not os.getenv("TAVILY_API_KEY"):
            raise ValueError("Tavily API key is required. Set the TAVILY_API_KEY environment variable.")
        
        try:
            # Initialize the search tool with optimized parameters
            self.search_tool = TavilySearch(
                max_results=max_results,
                topic=topic,
                include_raw_content=include_raw_content,
                search_depth=search_depth,
                time_range=time_range,
                include_favicon=include_favicon,
                include_images=include_images,
                # The tool name is 'tavily_search_results_json' by default
            )
            logger.info(f"TavilyWebSearchTool initialized with max_results={max_results}, search_depth={search_depth}, include_favicon={include_favicon}, include_images={include_images}")
        except Exception as e:
            logger.error(f"Failed to initialize TavilySearch: {str(e)}")
            raise
    
    # ASYNC: Converted the 'search' method to be asynchronous
    async def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Execute a web search using Tavily asynchronously.
        
        Args:
            query: The search query
            
        Returns:
            List of search result objects. Returns an empty list on error.
        """
        try:
            # Log and time the search
            logger.info(f"Executing async web search for query: {query}")
            start_time = time.time()
            
            # ASYNC: Using 'ainvoke' for non-blocking I/O
            search_results = await self.search_tool.ainvoke({"query": query})
            
            elapsed = time.time() - start_time
            logger.info(f"Search completed in {elapsed:.2f}s for: {query}")
            
            return search_results
        except Exception as e:
            logger.error(f"Error executing web search: {str(e)}")
            return []
    
    def get_tool(self) -> StructuredTool:
        """
        Get the underlying LangChain StructuredTool.
        
        Returns:
            StructuredTool instance for use in chains
        """
        return self.search_tool
    
    def create_tool_node(self) -> ToolNode:
        """
        Create a LangGraph ToolNode for the search tool.
        
        Returns:
            ToolNode instance for use in LangGraph
        """
        return ToolNode(tools=[self.search_tool])
    
    def bind_to_llm(self, llm):
        """
        Bind the tool to an LLM.
        
        Args:
            llm: Language model instance
            
        Returns:
            LLM with tools binding
        """
        return llm.bind_tools([self.search_tool])

def get_llm(model_name: str = "gpt-4o-mini", temperature: float = 0.5):
    """
    Get an LLM instance. Tries to initialize Google's models first
    and falls back to OpenAI's gpt-4o-mini on any error.
    
    Args:
        model_name: Name of the LLM to use (e.g., a Google model).
        temperature: Temperature setting for the LLM.
        
    Returns:
        LLM instance.
    """
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OpenAI API key is required for the fallback LLM.")
                
        logger.info("Initializing OpenAI LLM: gpt-4o-mini")
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            openai_api_key=openai_api_key
            )
    except Exception as e:
        logger.warning(f"Could not initialize OpenAI LLM ({e}). Falling back to gemini-2.5-flash-lite")
        try:
            google_api_key = os.getenv("GOOGLE_API_KEY")
            if not google_api_key:
                raise ValueError("GOOGLE_API_KEY environment variable not found.")

            logger.info(f"Initializing Google fallback LLM: gemini-2.5-flash-lite")
            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash-lite",
                temperature=temperature,
                google_api_key=google_api_key,
            )
        except Exception as e_google:
            logger.error(f"Fatal: Could not initialize fallback Google LLM. Error: {e_google}")
            raise

def get_search_components(llm):
    """
    Get components needed for web search without creating graph nodes.
    
    Args:
        llm: Language model instance
        
    Returns:
        Dictionary with search tool and LLM with tools bound
    """
    # This now uses the class that has the async search method
    search_tool_instance = TavilyWebSearchTool(max_results=5, search_depth='advanced', include_favicon=True, include_images=True)
    llm_with_tools = search_tool_instance.bind_to_llm(llm)
    
    return {
        "search_tool": search_tool_instance.get_tool(),
        "llm_with_tools": llm_with_tools
    }