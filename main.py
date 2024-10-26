import argparse
import os
from dotenv import load_dotenv
from download_chat import download_chat_to_csv
from generate_chart import generate_chart_from_csv
from get_video_information import get_video_information
from santinize_file_name import sanitize_filename

load_dotenv()

API_KEY = os.getenv("API_KEY")

def main():
    parser = argparse.ArgumentParser(description="Download YouTube chat and generate message chart.")
    parser.add_argument("url", help="YouTube video URL")
    args = parser.parse_args()
    url = args.url
    video_id = url.split("v=")[1]
    total_seconds, total_formatted_time, author, date = get_video_information(video_id, API_KEY)
    output_csv = sanitize_filename(f'{date}-{author}') + ".csv"
    print(f'Total length: {total_formatted_time}')
    print("Downloading")
    download_chat_to_csv(url, output_csv, total_seconds)
    
    print(f'Generating chart from {output_csv}')
    generate_chart_from_csv(output_csv)

    print('Done')

if __name__ == "__main__":
    main()
