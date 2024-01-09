import numpy as np
import pandas as pd

def count_instances(df, category_column, category):
    """Count instances of a specific category."""
    count = df.loc[df[category_column] == category, :].shape[0]
    return count

def preprocess_data(df):
    """Preprocess data."""
    df['Year'] = pd.to_datetime(df['Year'], format='%Y').dt.year
    df['Age'] = 2022 - df['Year']
    df['Race'].replace(np.nan, 'Unknown', inplace=True)
    df['Ethnicity'].replace(np.nan, 'Unknown', inplace=True)
    df['Gender'].replace(np.nan, 'Unknown', inplace=True)
    df['Income'].replace(np.nan, df['Income'].mean(), inplace=True)
    return df

def encode_categories(df, columns):
    """Encode categorical columns using one-hot encoding."""
    df = pd.get_dummies(df, columns=columns, drop_first=True)
    return df

def clean_data(df):
    """Clean data by removing null values and duplicates."""
    df = df.dropna()
    df = df.drop_duplicates()
    return df

def explore_data(df):
    """Explore data by counting instances and printing statistics."""
    print('Data Dimensions:', df.shape)
    print('Column Names:', df.columns)
    print('Column Data Types:', df.dtypes)

    for column in df.columns:
        if df[column].nunique() <= 10:
            print('\nColumn:', column)
            print('Data Type:', df[column].dtype)
            print('Number of Unique Values:', df[column].nunique())
            print('Counts:', df[column].value_counts())
        else:
            print('\nColumn:', column)
            print('Data Type:', df[column].dtype)
            print('Number of Unique Values:', df[column].nunique())

if __name__ == '__main__':
    df = pd.read_csv('your_data.csv')
    df = preprocess_data(df)
    df = encode_categories(df, columns=['Race', 'Ethnicity', 'Gender'])
    df = clean_data(df)
    explore_data(df)