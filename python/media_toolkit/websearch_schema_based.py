import os
import json
from langchain_perplexity import ChatPerplexity
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
pplx_api_key = os.getenv("PPLX_API_KEY")

# Check if the API key was loaded successfully
if not pplx_api_key:
    raise ValueError("PPLX_API_KEY not found in environment variables. Please check your .env file.")

# Instantiate the ChatPerplexity model
# Note: Common models include 'pplx-7b-online', 'pplx-70b-online', 
# 'llama-3-sonar-small-32k-online', and 'llama-3-sonar-large-32k-online'.
# You may need to adjust the model name based on available options.
chat = ChatPerplexity(
    temperature=0.7,
    model="sonar", # Updated to a current model name, adjust if needed
    pplx_api_key=pplx_api_key
)

def get_query_from_user_input():
    """Prompts the user for details and builds a natural language query."""
    print("Please provide the following details to generate your query:")
    
    # Prompt the user for each piece of information
    topic = input("Enter the topic: ")
    grade_level = input("Enter the grade level (e.g., 10): ")
    subject = input("Enter the subject (e.g., History): ")
    content_type = input("Enter the preferred content type (e.g., articles, videos): ")
    language = input("Enter the language (e.g., English): ")
    comprehension = input("Enter the comprehension level (e.g., beginner, intermediate): ")
    
    # Prompt for max_results and handle potential errors
    try:
        max_results = int(input("Enter the maximum number of results (e.g., 5): "))
    except ValueError:
        print("Invalid input for maximum results. Using a default value of 5.")
        max_results = 5

    # Building the query from user inputs
    query = (
        f"Show me up to {max_results} {content_type} about '{topic}' "
        f"for a grade {grade_level} {subject} class. "
        f"The content should be in {language} with a {comprehension} comprehension level. "
        "Include links in the response with detailed lengthy response content ."
    )
    
    return query

def main():
    """Main function to run the script."""
    # Generate the query directly from user prompts
    meaningful_query = get_query_from_user_input()
    
    if meaningful_query:
        print("\n--- Generated Query ---")
        print(meaningful_query)
        print("-----------------------\n")
        
        print("--- Model Response ---")
        try:
            # Stream the response from the model using the generated query
            full_response = ""
            for chunk in chat.stream(meaningful_query):
                print(chunk.content, end="", flush=True)
                full_response += chunk.content
            
            if not full_response.strip():
                print("\nReceived an empty response from the API.")

        except Exception as e:
            print(f"\nAn error occurred while communicating with the API: {e}")

if __name__ == "__main__":
    main()