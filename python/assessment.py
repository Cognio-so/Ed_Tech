import os
import asyncio  # ASYNC: Imported asyncio
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
You are an expert AI assistant specialized in creating educational materials. Your task is to generate a set of test questions based on the user-provided schema.

Please adhere to the following specifications:
- **Role:** Act as an experienced teacher designing a test for your students.
- **Tone:** The tone should be professional, clear, and appropriate for the specified grade level.
- **Accuracy:** All questions must be factually accurate and directly relevant to the provided topic.

**Test Generation Schema:**
- **Test Title:** {test_title}
- **Grade Level:** {grade_level}
- **Subject:** {subject}
- **Topic:** {topic}
- **Assessment Type:** {assessment_type}
- **Question Types:** {question_types}
- **Question Distribution:** {question_distribution}
- **Test Duration:** {test_duration}
- **Number of Questions:** {number_of_questions}
- **Difficulty Level:** {difficulty_level}
- **Learning Objectives:** {learning_objectives}
- **Anxiety Considerations:** {anxiety_triggers}
- **User-Specific Instructions:** {user_prompt}

**CRITICAL REQUIREMENTS:**
- **EXACT NUMBER REQUIREMENT:** You MUST generate EXACTLY {number_of_questions} questions - NO MORE, NO LESS. This is a strict requirement.
- **Question Type Distribution:** When multiple question types are specified, generate questions according to the EXACT distribution provided. For example, if the distribution is {{"mcq": 6, "true_false": 2, "short_answer": 2}}, generate EXACTLY 6 MCQ questions, 2 True/False questions, and 2 Short Answer questions.
- **Mixed Format Handling:** When generating mixed question types, clearly indicate the question type for each question in parentheses before the question number.
- **Separate Questions and Answers:** The entire output must be structured into two distinct parts: the questions first, followed by a clearly marked answer key.

**Output Formatting Rules:**
1.  **Generate Questions:**
    - Generate the EXACT number and types of questions as specified in the distribution.
    - For mixed assessments, prefix each question with its type: "(MCQ) 1.", "(T/F) 2.", "(SA) 3.", etc.
    - For 'MCQ' type, provide four options labeled A, B, C, and D.
    - For 'True or False' type, provide a clear statement that can be definitively true or false.
    - For 'Short Answer' type, ask a clear, specific question that can be answered in 1-3 sentences.
    - **Do not** provide the answer immediately after a question.

2.  **Generate the Answer Key:**
    - After listing all the questions, add a separator and a heading for the answers, formatted exactly like this:
---
**Solutions**
    - Below this heading, list each question number and its corresponding correct answer.
    - Example for 'MCQ': `1. C`
    - Example for 'True or False': `2. True`
    - Example for 'Short Answer': `3. The Treaty of Paris ended the Revolutionary War in 1783.`

**Anxiety Considerations:**
- If anxiety triggers are mentioned, adjust question wording to be clear and straightforward.
- Avoid unnecessarily complex sentence structures or ambiguous phrasing.
- Use encouraging, neutral language that doesn't add pressure.

**Final Output:** The final output should contain *only* the generated questions and the separate answer key section. Do not include any other text, introductory phrases, or explanations outside of the questions themselves. Remember: EXACTLY {number_of_questions} questions must be generated.
"""

def create_question_generation_chain(openai_api_key: str, model_name: str = "gpt-4o-mini"):
    """
    Creates the LangChain model using LangChain Expression Language (LCEL).
    This function remains synchronous as it's for setup, not I/O.
    """
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY is not provided. Please provide a valid key.")
    prompt_template = ChatPromptTemplate.from_template(SYSTEM_PROMPT)
    model = ChatOpenAI(model=model_name, temperature=0.7, openai_api_key=openai_api_key)
    output_parser = StrOutputParser()
    chain = prompt_template | model | output_parser
    return chain

# ASYNC: Converted the generation function to be asynchronous
async def generate_test_questions_async(chain, schema: dict):
    """
    Invokes the provided chain asynchronously to generate test questions.

    Args:
        chain: The LangChain runnable sequence.
        schema (dict): A dictionary containing the test specifications.

    Returns:
        The generated text content.
    """
    # Prepare the schema with proper formatting
    formatted_schema = prepare_schema_for_prompt(schema)
    
    # ASYNC: Using 'ainvoke' for a non-blocking API call
    return await chain.ainvoke(formatted_schema)

def prepare_schema_for_prompt(schema: dict):
    """
    Prepare the schema with proper formatting for the prompt.
    """
    formatted_schema = schema.copy()
    
    # Format question types and distribution
    if 'question_types' in schema and 'question_distribution' in schema:
        question_types = schema.get('question_types', [])
        question_distribution = schema.get('question_distribution', {})
        
        # Format question types as a readable string
        type_names = {
            'mcq': 'Multiple Choice Questions (MCQ)',
            'true_false': 'True/False Questions (T/F)',
            'short_answer': 'Short Answer Questions (SA)'
        }
        
        formatted_types = [type_names.get(qtype, qtype) for qtype in question_types]
        formatted_schema['question_types'] = ', '.join(formatted_types)
        
        # Format distribution as a readable string
        distribution_str = ', '.join([f"{type_names.get(qtype, qtype)}: {count}" for qtype, count in question_distribution.items()])
        formatted_schema['question_distribution'] = distribution_str
    else:
        # Fallback for single question type - USE EXACT USER INPUT
        formatted_schema['question_types'] = schema.get('assessment_type', 'MCQ')
        formatted_schema['question_distribution'] = f"All {schema.get('number_of_questions')} questions"
    
    # Ensure all required fields have default values
    required_defaults = {
        'learning_objectives': 'Not specified',
        'anxiety_triggers': 'None',
        'user_prompt': 'None.'
    }
    
    for key, default_value in required_defaults.items():
        if key not in formatted_schema or not formatted_schema[key]:
            formatted_schema[key] = default_value
    
    return formatted_schema

def get_user_input_from_terminal():
    """
    Prompts the user to enter the test specifications in the terminal.
    This remains synchronous as input() is a blocking operation.
    """
    print("--- Create Your Custom Test (CLI Mode) ---")
    schema = {
        "test_title": input("Enter the title of the test: "),
        "grade_level": input("Enter the grade or class (e.g., '10th Grade'): "),
        "subject": input("Enter the subject (e.g., 'History'): "),
        "topic": input("Enter the specific topic (e.g., 'The Indian Revolution'): "),
        "assessment_type": input("Enter assessment type (MCQ, True or False, Short Answer): "),
        "test_duration": input("Enter the test duration (e.g., '45 minutes'): "),
        "number_of_questions": int(input("Enter the number of questions: ")),
        "difficulty_level": input("Enter the difficulty level (Easy, Medium, Hard): "),
        "user_prompt": input("Enter optional instructions (or press Enter to skip): ")
    }
    if not schema["user_prompt"]:
        schema["user_prompt"] = "None."
    return schema

# ASYNC: Converted the main CLI function to be asynchronous
async def main_cli_async():
    """
    Main async function to run the question generation model from the command line.
    """
    load_dotenv()
    try:
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set. Please set it in a .env file.")

        question_chain = create_question_generation_chain(openai_api_key) 
        user_schema = get_user_input_from_terminal()
        
        print("\n" + "="*50)
        print("Generating questions based on your specifications. Please wait...")
        print("="*50 + "\n")
        
        # ASYNC: Awaiting the asynchronous generation function
        generated_content = await generate_test_questions_async(question_chain, user_schema)
        
        print("--- Generated Test Questions ---")
        print(generated_content)
        print("--- End of Test ---")
        
    except ValueError as ve:
        print(f"Error: {ve}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# ASYNC: Main execution block to run the async CLI
if __name__ == "__main__":
    # ASYNC: Using asyncio.run to start the main async function
    asyncio.run(main_cli_async())