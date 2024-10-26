from googleapiclient.discovery import build
import re

def get_video_information(video_id, api_key):
    youtube = build('youtube', 'v3', developerKey=api_key)
    information_response = youtube.videos().list(part="snippet", id=video_id).execute()
    duration_response = youtube.videos().list(part="contentDetails", id=video_id).execute()
    total_seconds, total_formatted_time = get_video_length(duration_response)
    author, date = get_video_details(information_response)
    return total_seconds, total_formatted_time, author, date


def get_video_length(duration_response):
    duration = duration_response['items'][0]['contentDetails']['duration']
    hours = minutes = seconds = 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    
    if match:
        if match.group(1):  # Hours
            hours = int(match.group(1))
        if match.group(2):  # Minutes
            minutes = int(match.group(2))
        if match.group(3):  # Seconds
            seconds = int(match.group(3))
    
    total_seconds = hours * 3600 + minutes * 60 + seconds
    return total_seconds, f"{hours:02}:{minutes:02}:{seconds:02}"

def get_video_details(information_response):
    video_data = information_response["items"][0]["snippet"]
    author = video_data["channelTitle"]
    date = video_data["publishedAt"][:10]
    return author, date

def parse_duration(duration):
    parsed_duration = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    return parsed_duration


