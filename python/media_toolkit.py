import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

def generate_slidespeak_presentation(
    plain_text: str,
    custom_user_instructions: str,
    length: int,
    language: str = "ENGLISH",
    fetch_images: bool = True,
    verbosity: str = "standard",
):
    """
    Generates and retrieves a SlideSpeak presentation by polling the task status.

    Args:
        plain_text (str): The main topic or plain_text of the presentation.
        custom_user_instructions (str): Specific instructions for the AI.
        length (int): The desired number of slides.
        language (str, optional): The language of the presentation ('english' or 'arabic'). Defaults to "english".
        fetch_images (bool, optional): Whether to include stock images. Defaults to True.
        verbosity (str, optional): The desired text verbosity ('concise', 'standard', 'text-heavy'). Defaults to "standard".

    Returns:
        dict: The final JSON response from the SlideSpeak API after the task is complete.
    """
    api_key = os.environ.get("SLIDESPEAK_API_KEY")
    if not api_key:
        raise ValueError("SLIDESPEAK_API_KEY environment variable not set.")

    # Initial request to generate the presentation
    generate_url = "https://api.slidespeak.co/api/v1/presentation/generate"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }
    payload = {
        "plain_text": plain_text,
        "custom_user_instructions": custom_user_instructions,
        "length": length,
        "language": language,
        "fetch_images": fetch_images,
        "verbosity": verbosity,
    }

    try:
        # --- 1. Start Presentation Generation ---
        initial_response = requests.post(generate_url, headers=headers, json=payload)
        initial_response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
        initial_data = initial_response.json()

        if "task_id" not in initial_data:
            return {"error": "task_id not found in initial response", "details": initial_data}

        task_id = initial_data["task_id"]
        print(f"Presentation generation started with task_id: {task_id}")

        # --- 2. Poll for Task Status ---
        status_url = f"https://api.slidespeak.co/api/v1/task_status/{task_id}"
        
        while True:
            print("Checking task status...")
            status_response = requests.get(status_url, headers=headers)
            status_response.raise_for_status()
            status_data = status_response.json()

            task_status = status_data.get("task_status")

            if task_status == "SUCCESS":
                print("Presentation generated successfully!")
                return status_data # Return the final successful response
            elif task_status == "FAILURE":
                print("Presentation generation failed.")
                return status_data # Return the final failed response
            else:
                # Wait for 5 seconds before checking the status again
                print(f"Status is '{task_status}'. Waiting for 5 seconds...")
                time.sleep(10)

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


if __name__ == "__main__":
    print("--- SlideSpeak Presentation Generator ---")
    print("Please provide the following details for your presentation:")

    if not os.environ.get("SLIDESPEAK_API_KEY"):
        print("\nWARNING: It is recommended to set your SLIDESPEAK_API_KEY as an environment variable.")
        api_key_input = input("Enter your SlideSpeak API Key: ")
        os.environ["SLIDESPEAK_API_KEY"] = api_key_input

    presentation_plain_text = input("plain_text: ")
    user_instructions = input("Custom Instructions: ")
    num_slides = int(input("Number of Slides: "))
    presentation_language = input("Language (english/arabic): ").lower()
    fetch_images_input = input("Fetch Images (true/false): ").lower()
    presentation_verbosity = input("Verbosity (concise/standard/text-heavy): ").lower()

    fetch_images_bool = fetch_images_input == "true"

    if presentation_language not in ["english", "arabic"]:
        print("Invalid language specified. Defaulting to 'english'.")
        presentation_language = "english"

    if presentation_verbosity not in ["concise", "standard", "text-heavy"]:
        print("Invalid verbosity specified. Defaulting to 'standard'.")
        presentation_verbosity = "standard"

    print("\nGenerating your presentation...")
    final_result = generate_slidespeak_presentation(
        plain_text=presentation_plain_text,
        custom_user_instructions=user_instructions,
        length=num_slides,
        language=presentation_language,
        fetch_images=fetch_images_bool,
        verbosity=presentation_verbosity,
    )

    print("\n--- Final API Response ---")
    # This will now print the result after the polling is complete
    print(final_result)