import os
import logging
import asyncio
from dotenv import load_dotenv

# LangChain components
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI  # MODIFIED: Import ChatOpenAI directly

# Import from your websearch module
from websearch_code import TavilyWebSearchTool # MODIFIED: Removed get_llm from this import

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

#langsmith
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT="Vamshi-test"


# Load environment variables from .env file
load_dotenv()

# --- Prompt Engineering ---
PROMPT_TEMPLATE = """
You are an expert AI instructional designer and a world-class {subject} teacher. Your task is to generate high-quality, detailed, and ready-to-use teaching content based on the user's precise specifications.

**Content Goal:** Generate a "{content_type}".

**Content Configuration:**
- **Subject:** {subject}
- **Lesson Topic:** {lesson_topic}
- **Grade Level:** {grade}
- **Learning Objective:** {learning_objective}

**Key Instructions:**
- **Estimated Duration:** Based on the generated content, you MUST determine and specify an appropriate duration (e.g., 45 minutes, 1 hour).

**Advanced Settings:**
- **Instructional Depth:** Adapt the content to a "{instructional_depth}" level. This defines the complexity and detail required.
- **Content Version:** The output should be a "{content_version}" version. (A 'low' version is a concise summary, 'standard' is a complete resource, and 'high' is an enriched, in-depth resource with extra details and activities).
- **Emotional Considerations:** Tailor the tone, language, and examples to be mindful of students who may be experiencing: **{emotional_consideration}**. The content must be supportive, inclusive, and encouraging.

**Web Search Context:**
{web_context}

**Your Task:**
Please generate the requested "{content_type}" now. You MUST strictly adhere to all configurations above. The generated content should be detailed, comprehensive, and directly usable by a teacher.

- If the content type is a "lesson plan", it must include sections for: Title, Estimated Duration, Learning Objectives, Materials, Step-by-Step Procedure (with timings), Assessment/Check for Understanding, and Differentiation.
- If the content type is a "presentation", it must be structured as a series of detailed slides, each with a clear title and content points and if web search context is provided, include a bibliography slide at the end with proper citations.
- If the content type is a "worksheet" or "quiz", it must include clear instructions, a variety of question types, and an answer key at the end.

When web search context is available, you must prioritize and synthesize information from the provided search results to create factually accurate and up-to-date content.
"""

def _get_choice_from_user(options: list[str], prompt_text: str, default: str | None = None) -> str:
    """
    A robust helper function to get a choice from a list of options from the user.
    It allows for selection by number, exact name, or unique prefix.
    """
    while True:
        default_info = f" (default: {default})" if default else ""
        choice_str = input(f"   {prompt_text}{default_info}: ").lower().strip()

        if not choice_str and default:
            return default

        # 1. Check for numeric choice
        if choice_str.isdigit() and 1 <= int(choice_str) <= len(options):
            return options[int(choice_str) - 1]

        # 2. Check for exact match
        if choice_str in options:
            return choice_str

        # 3. Check for unique prefix match
        matches = [opt for opt in options if opt.startswith(choice_str)]
        if len(matches) == 1:
            print(f"   --> Interpreted '{choice_str}' as '{matches[0]}'.")
            return matches[0]

        # 4. If no valid choice, print error and loop
        print("   Invalid choice. Please enter the full name, a unique starting part of the name, or the corresponding number.")


def get_user_input() -> dict:
    """
    Interactively collects content generation parameters from the user in the terminal.
    """
    print("--- Teaching Content Generation Model ---")

    # --- Content Type ---
    content_types = ["lesson plan", "worksheet", "presentation", "quiz"]
    print("\n1. Choose Content Type:")
    for i, ct in enumerate(content_types, 1):
        print(f"   {i}. {ct.title()}")
    content_type = _get_choice_from_user(content_types, f"Enter name or number (1-{len(content_types)})")

    # --- Content Configuration ---
    print("\n2. Configure Content:")
    subject = input("   - Subject (e.g., Physics, History): ")
    lesson_topic = input("   - Lesson Topic (e.g., Newton's Laws of Motion): ")
    grade = input("   - Grade Level (e.g., 10th Grade): ")
    learning_objective = input("   - Learning Objective (optional, press Enter to skip): ") or "Not specified"

    # --- Advanced Settings ---
    print("\n3. Advanced Settings:")
    emotional_consideration = input("   - Emotional Considerations (comma-separated, e.g., anxiety, low confidence, Enter to skip): ") or "None"

    depths = ["Basic", "Standard", "Advanced"]
    print("   - Instructional Depth:")
    for i, d in enumerate(depths, 1):
        print(f"     {i}. {d.title()}")
    instructional_depth = _get_choice_from_user(depths, f"Enter name or number (1-{len(depths)})", default="standard")

    versions = ["Simplified", "Standard", "Enriched"]
    print("   - Content Version:")
    for i, v in enumerate(versions, 1):
        print(f"     {i}. {v.title()}")
    content_version = _get_choice_from_user(versions, f"Enter name or number (1-{len(versions)})", default="standard")

    # --- Web Search Toggle ---
    print("\n4. Web Search:")
    web_search_choice = input("   - Enable web search for latest content? (yes/no, default: no): ").lower().strip()
    web_search_enabled = web_search_choice.startswith('y')

    return {
        "content_type": content_type,
        "subject": subject,
        "lesson_topic": lesson_topic,
        "grade": grade,
        "duration": "To be determined by AI", # Duration is now automated
        "learning_objective": learning_objective,
        "emotional_consideration": emotional_consideration,
        "instructional_depth": instructional_depth,
        "content_version": content_version,
        "web_search_enabled": web_search_enabled
    }

async def run_generation_pipeline_async(config: dict):
    """
    Constructs and runs the LCEL pipeline for content generation asynchronously.
    Returns the generated content instead of just printing it.
    """
    logger.info("Initializing Model and Tools for content generation")

    # --- MODIFIED: LLM Initialization Block ---
    # Initialize the gpt-4o-mini model directly in this script.
    try:
        logger.info("Initializing local OpenAI LLM: gpt-4o-mini")
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.5,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
    except Exception as e:
        logger.error(f"Fatal: Could not initialize the OpenAI LLM. Error: {e}")
        raise Exception(f"Failed to initialize OpenAI LLM: {e}")
    # --- End of Modification ---

    web_context = "No web search was performed for this generation."

    if config.get("web_search_enabled", False):
        logger.info("Web search is enabled. Fetching latest content...")
        try:
            search_tool = TavilyWebSearchTool(max_results=5, search_depth='advanced')
            search_query = (
                f"Teaching resources and ideas for a {config['grade']} {config['subject']} "
                f"{config['content_type']} on '{config['lesson_topic']}'"
            )
            if config.get('learning_objective', '') != 'Not specified':
                search_query += f" with the learning objective: '{config['learning_objective']}'"

            results = await search_tool.search(query=search_query)

            if results:
                web_context = "Web search has been performed. Use the following latest information to enrich your content:\n\n"
                for i, res in enumerate(results, 1):
                    if isinstance(res, dict):
                        web_context += f"Result {i}:\n"
                        web_context += f"  Title: {res.get('title', 'N/A')}\n"
                        web_context += f"  URL: {res.get('url', 'N/A')}\n"
                        web_context += f"  Content Snippet: {res.get('content', 'N/A')}\n\n"
                logger.info("Web search completed and context created with results.")
            else:
                web_context = "Web search was enabled but returned no relevant results. Proceed with general knowledge."
                logger.warning(f"Web search for query '{search_query}' returned no results.")
        except Exception as e:
            logger.error(f"An error occurred during the web search process: {e}")
            web_context = f"Web search was enabled but failed with an error: {e}."

    config['web_context'] = web_context

    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    output_parser = StrOutputParser()
    
    # This is the LangChain Expression Language (LCEL) chain
    chain = prompt | llm | output_parser

    logger.info("Generating content with AI...")

    try:
        response = await chain.ainvoke(config)
        logger.info("Content generated successfully.")
        # Return the response instead of printing it
        return response
    except Exception as e:
        logger.error(f"Error during content generation: {e}", exc_info=True)
        # Re-raise the exception to be handled by the main API endpoint
        raise

if __name__ == "__main__":
    if not os.getenv("OPENAI_API_KEY") or not os.getenv("TAVILY_API_KEY"):
        print("FATAL ERROR: Make sure you have created a .env file with your OPENAI_API_KEY and TAVILY_API_KEY.")
    else:
        user_config = get_user_input()
        asyncio.run(run_generation_pipeline_async(user_config))