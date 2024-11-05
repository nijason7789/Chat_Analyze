import pandas as pd
import os

def read_and_preprocess_data(input_csv, csv_folder='csv_files'):
    """
    Reads and preprocesses the CSV data for analysis.

    Parameters:
    - input_csv: str, the name of the CSV file.
    - csv_folder: str, the folder where the CSV file is located.

    Returns:
    - pd.DataFrame, the preprocessed data with a 'seconds' column.
    """
    try:
        data = pd.read_csv(os.path.join(csv_folder, input_csv))
        data['seconds'] = data['timestamp'].apply(convert_to_seconds)
        data = data.set_index(pd.to_timedelta(data['seconds'], unit='s')).sort_index()
        return data
    except FileNotFoundError:
        print(f"Error: File {input_csv} not found in {csv_folder}.")
        return pd.DataFrame()

def convert_to_seconds(timestamp):
    """
    Converts a timestamp string to total seconds.

    Parameters:
    - timestamp: str, the timestamp in HH:MM:SS format.

    Returns:
    - int, the total seconds.
    """
    parts = list(map(int, timestamp.split(":")))
    return sum(x * 60 ** i for i, x in enumerate(reversed(parts)))
