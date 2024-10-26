import csv
import time
from chat_downloader import ChatDownloader

def download_chat_to_csv(url, output_csv, total_duration):
    chat = ChatDownloader().get_chat(url)
    
    with open(f'csv_files/{output_csv}', mode="w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "name", "message"])

        last_update_time = time.time()

        for message in chat:
            timestamp = message.get("time_text", "")
            name = message.get("author", {}).get("name", "")
            content = message.get("message", "")
            writer.writerow([timestamp, name, content])

            time_parts = list(map(int, timestamp.split(":")))
            current_time_seconds = sum(x * 60 ** i for i, x in enumerate(reversed(time_parts)))

            current_time = time.time()
            if current_time - last_update_time >= 1:
                print(f"Progress: {current_time_seconds} / {total_duration} ({current_time_seconds / total_duration:.2%})")
                last_update_time = current_time
