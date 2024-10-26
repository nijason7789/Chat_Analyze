import pandas as pd
from santinize_file_name  import sanitize_filename
import matplotlib.pyplot as plt
import os

def generate_chart_from_csv(input_csv):
    data = pd.read_csv(f'csv_files/{input_csv}')
    
    def convert_to_seconds(timestamp):
        parts = list(map(int, timestamp.split(":")))
        return sum(x * 60 ** i for i, x in enumerate(reversed(parts)))

    data['seconds'] = data['timestamp'].apply(convert_to_seconds)

    data['minute'] = data['seconds'] // 60
    message_counts = data.groupby('minute').size()
    p75 = message_counts.quantile(0.75)

    plt.figure(figsize=(21, 9))
    plt.plot(message_counts.index, message_counts.values, marker='o', linestyle='-', color='b')
    plt.title("YouTube Chat Messages Over Time")
    plt.xlabel("Time (every min)")
    plt.ylabel("Number of Messages")
    plt.grid(True)

    for time_index, message_count in message_counts.items():
        if message_count > p75:
            minutes = (time_index * 60) // 60
            seconds = (time_index * 60) % 60
            timestamp = f"{minutes}:{seconds:02d}"
            plt.annotate(
                timestamp, 
                (time_index, message_count), 
                textcoords="offset points", 
                xytext=(0,10), 
                ha='center', 
                color='red'
            )

    output_image = sanitize_filename(os.path.splitext(input_csv)[0]) + ".png"
    plt.savefig(f'charts/{output_image}')
    plt.close()

