import pandas as pd
from santinize_file_name import sanitize_filename
import matplotlib.pyplot as plt
import os
from utils import read_and_preprocess_data, convert_to_seconds

def calculate_rolling_average(data, window_size=30):
    message_counts = data.resample('1s').size()
    return message_counts.rolling(window=window_size, min_periods=1).mean()

def detect_incremental_peaks(rolling_average, window_size=30, increment_threshold=2):
    incremental_peaks = []
    for i in range(window_size, len(rolling_average) - window_size):
        prev_avg = rolling_average.iloc[i - window_size:i].mean()
        curr_avg = rolling_average.iloc[i:i + window_size].mean()
        if curr_avg > prev_avg * increment_threshold:
            incremental_peaks.append(rolling_average.index[i])
    return incremental_peaks

def detect_change_points(rolling_average, peaks, neighborhood_size=30):
    change_points = []
    for peak in peaks:
        start = peak
        end = peak
        for i in range(1, neighborhood_size):
            if peak - pd.to_timedelta(i, unit='s') in rolling_average.index:
                if rolling_average[peak - pd.to_timedelta(i, unit='s')] < rolling_average[peak]:
                    start = peak - pd.to_timedelta(i, unit='s')
                else:
                    break
        for i in range(1, neighborhood_size):
            if peak + pd.to_timedelta(i, unit='s') in rolling_average.index:
                if rolling_average[peak + pd.to_timedelta(i, unit='s')] < rolling_average[peak]:
                    end = peak + pd.to_timedelta(i, unit='s')
                else:
                    break
        change_points.append((start, end))
    return change_points

def merge_close_intervals(change_points, merge_threshold=30):
    merged_intervals = []
    current_start, current_end = change_points[0]

    for start, end in change_points[1:]:
        if (start - current_end).total_seconds() <= merge_threshold:
            current_end = max(current_end, end)
        else:
            merged_intervals.append((current_start, current_end))
            current_start, current_end = start, end

    merged_intervals.append((current_start, current_end))
    return merged_intervals

def plot_data_with_red_intervals(rolling_average, change_points, title, output_image, window_size):
    plt.figure(figsize=(100, 6))
    plt.plot(rolling_average.index.total_seconds(), rolling_average.values, linestyle='-', color='b')
    plt.title(title)
    plt.xlabel("Time (seconds)")
    plt.ylabel(f"Average Number of Messages per {window_size} seconds")
    plt.grid(True)

    for start, end in change_points:
        start_seconds = int(start.total_seconds())
        end_seconds = int(end.total_seconds())
        start_time = f"{start_seconds // 60}:{start_seconds % 60:02d}"
        end_time = f"{end_seconds // 60}:{end_seconds % 60:02d}"
        midpoint = (start_seconds + end_seconds) / 2

        plt.plot(range(start_seconds, end_seconds + 1), rolling_average[start:end].values, color='red', linewidth=2)

        plt.annotate(f"Start: {start_time}\nEnd: {end_time}",
                     (midpoint, rolling_average.max() * 0.8),
                     textcoords="offset points", xytext=(0, 10), ha='center', color='red',
                     bbox=dict(facecolor='white', edgecolor='red', boxstyle='round,pad=0.5'))

    plt.savefig(output_image)
    plt.close()

def generate_sliding_window_charts(input_csv, window_sizes=[10, 30, 60], increment_threshold=2, csv_folder='csv_files', chart_folder='charts'):
    data = read_and_preprocess_data(input_csv, csv_folder)
    for window_size in window_sizes:
        rolling_average = calculate_rolling_average(data, window_size=window_size)
        incremental_peaks = detect_incremental_peaks(rolling_average, window_size=window_size, increment_threshold=increment_threshold)
        change_points = detect_change_points(rolling_average, incremental_peaks, neighborhood_size=window_size)
        merged_change_points = merge_close_intervals(change_points, merge_threshold=window_size)
        output_image = os.path.join(chart_folder, sanitize_filename(os.path.splitext(input_csv)[0]) + f"_change_point_annotations_{window_size}s_window.png")
        plot_data_with_red_intervals(rolling_average, merged_change_points, f"YouTube Chat Messages Over Time (Merged Change Points, {window_size}-second Window)", output_image, window_size)
