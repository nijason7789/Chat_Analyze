import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from statsmodels.tsa.holtwinters import Holt
from utils import read_and_preprocess_data, convert_to_seconds

DEFAULT_CSV_FOLDER = 'csv_files'
DEFAULT_CHART_FOLDER = 'charts'
DEFAULT_ALPHA = 0.6
DEFAULT_INCREMENT_THRESHOLD = 0.8
DEFAULT_MERGE_THRESHOLD = 30
DEFAULT_PERCENTAGE = 99
EPSILON = 1e-6

def exponential_smoothing(data):
    """
    Applies exponential smoothing to the data.

    Parameters:
    - data: pd.Series, the data to smooth.
    - alpha: float, the smoothing factor.

    Returns:
    - pd.Series, the smoothed data.
    """
    data = data.resample('1s').size()
    model = Holt(np.asarray(data))
    fit = model.fit(smoothing_level=DEFAULT_ALPHA, smoothing_trend=DEFAULT_ALPHA, optimized=False)
    smoothed_data = pd.Series(fit.fittedvalues, index=data.index)
    return smoothed_data

def detect_peaks(smoothed_data, threshold):
    """
    Detects peaks in the smoothed data.

    Parameters:
    - smoothed_data: pd.Series, the smoothed data.
    - threshold: float, the threshold for peak detection.

    Returns:
    - list, the indices of detected peaks.
    """
    peaks = smoothed_data[(smoothed_data.shift(1) < smoothed_data) & 
                          (smoothed_data.shift(-1) < smoothed_data) & 
                          (smoothed_data > threshold)].index.tolist()
    return peaks

def detect_incremental_regions(smoothed_data, increment_threshold=DEFAULT_INCREMENT_THRESHOLD):
    """
    Detects incremental regions in the smoothed data.

    Parameters:
    - smoothed_data: pd.Series, the smoothed data.
    - increment_threshold: float, the threshold for detecting increments.

    Returns:
    - list of tuples, the start and end indices of incremental regions.
    """
    incremental_regions = []
    is_in_incremental_region = False
    start = None

    for i in range(1, len(smoothed_data)):
        increment = (smoothed_data.iloc[i] - smoothed_data.iloc[i - 1]) / max(smoothed_data.iloc[i - 1], EPSILON)
        
        if increment > increment_threshold:
            if not is_in_incremental_region:
                is_in_incremental_region = True
                start = smoothed_data.index[i]
        else:
            if is_in_incremental_region:
                end = smoothed_data.index[i - 1]
                incremental_regions.append((start, end))
                is_in_incremental_region = False

    if is_in_incremental_region:
        incremental_regions.append((start, smoothed_data.index[-1]))

    return incremental_regions

def merge_incremental_regions(peaks, incremental_regions, merge_threshold=DEFAULT_MERGE_THRESHOLD):
    """
    Merges peaks and incremental regions into intervals.

    Parameters:
    - peaks: list, the indices of detected peaks.
    - incremental_regions: list of tuples, the start and end indices of incremental regions.
    - merge_threshold: int, the threshold for merging intervals.

    Returns:
    - list of tuples, the merged intervals.
    """
    merged_incremental_regions = []
    for peak in peaks:
        peak_interval = (peak - pd.to_timedelta(merge_threshold, unit='s'), peak + pd.to_timedelta(merge_threshold, unit='s'))
        for region in incremental_regions:
            if region[0] <= peak_interval[1] and region[1] >= peak_interval[0]:
                start = min(peak, region[0])
                end = max(peak, region[1])
                merged_incremental_regions.append((start, end))
                break
    return merged_incremental_regions

def merge_overlapping_intervals(intervals):
    """
    Merges overlapping intervals.

    Parameters:
    - intervals: list of tuples, the intervals to merge.

    Returns:
    - list of tuples, the merged intervals.
    """
    if not intervals:
        return []

    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    merged_intervals = []
    current_start, current_end = sorted_intervals[0]

    for start, end in sorted_intervals[1:]:
        if start <= current_end:
            current_end = max(current_end, end)
        else:
            merged_intervals.append((current_start, current_end))
            current_start, current_end = start, end

    merged_intervals.append((current_start, current_end))
    return merged_intervals

def plot_highlighted_intervals(smoothed_data, title, merged_intervals, output_image):
    """
    Plots the smoothed data with highlighted intervals.

    Parameters:
    - data: pd.Series, the original data.
    - smoothed_data: pd.Series, the smoothed data.
    - title: str, the title of the plot.
    - merged_intervals: list of tuples, the intervals to highlight.
    - output_image: str, the path to save the plot image.
    """
    plt.figure(figsize=(100, 6))
    plt.plot(smoothed_data.index.total_seconds(), smoothed_data.values, color='blue', label="Smoothed Data")
    plt.title(title)
    plt.xlabel("Time (seconds)")
    plt.ylabel("Message Frequency")
    plt.grid(True)

    for start, end in merged_intervals:
        start_seconds = int(start.total_seconds())
        end_seconds = int(end.total_seconds())
        plt.plot(range(start_seconds, end_seconds + 1), smoothed_data[start:end].values, color='red', linewidth=2)
        midpoint = (start_seconds + end_seconds) / 2
        start_time = f"{start_seconds // 60}:{start_seconds % 60:02d}"
        end_time = f"{end_seconds // 60}:{end_seconds % 60:02d}"
        
        plt.annotate(f"Start: {start_time}\nEnd: {end_time}",
                     (midpoint, smoothed_data.max() * 0.8),
                     textcoords="offset points", xytext=(0, 10), ha='center', color='red',
                     bbox=dict(facecolor='white', edgecolor='red', boxstyle='round,pad=0.5'))

    plt.legend()
    plt.savefig(output_image)
    plt.close()

def generate_exp_smooth_chart(input_csv, csv_folder=DEFAULT_CSV_FOLDER, chart_folder=DEFAULT_CHART_FOLDER, increment_threshold=DEFAULT_INCREMENT_THRESHOLD, merge_threshold=DEFAULT_MERGE_THRESHOLD, percentage = DEFAULT_PERCENTAGE):
    """
    Detects and highlights intervals in chat data.

    Parameters:
    - input_csv: str, the name of the CSV file.
    - csv_folder: str, the folder where the CSV file is located.
    - chart_folder: str, the folder to save the chart.
    - alpha: float, the smoothing factor.
    - increment_threshold: float, the threshold for detecting increments.
    - merge_threshold: int, the threshold for merging intervals.
    """
    data = read_and_preprocess_data(input_csv, csv_folder)
    if data.empty:
        return
    smoothed_data = exponential_smoothing(data)
    peak_threshold_value = np.percentile(smoothed_data, percentage)
    peaks = detect_peaks(smoothed_data, peak_threshold_value)
    incremental_regions = detect_incremental_regions(smoothed_data, increment_threshold)
    merged_intervals = merge_incremental_regions(peaks, incremental_regions, merge_threshold)
    final_intervals = merge_overlapping_intervals(merged_intervals)
    output_image = os.path.join(chart_folder, os.path.splitext(input_csv)[0] + "_highlighted_intervals.png")
    plot_highlighted_intervals(smoothed_data, "YouTube Chat Messages Over Time (Exponential Smoothed)", final_intervals, output_image)
