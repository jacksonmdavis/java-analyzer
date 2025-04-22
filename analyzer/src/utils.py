"""
This module provides data analysis functionality for student performance data.

The main function is data_analysis, which processes the StudentsPerformance.csv file
and generates various statistics and visualizations.

Usage:
    from utils import data_analysis
    
    # Process the file and get results
    results = data_analysis(file)

Note: Currently only supports the StudentsPerformance.csv file as a functionality test.
The file must contain columns for math score, reading score, writing score, and various
categorical columns (gender, lunch, test_preparation_course, etc.).

Expected input:
    A file object containing the StudentsPerformance.csv file

Returns:
    A dictionary containing:
    - Overall averages for each subject
    - Averages broken down by categorical columns
    - Averages for individual students
    - Base64 encoded images of the generated plots

Dictionary structure:
    {
        'overall': {
            'data': {
                'math score': float,
                'reading score': float,
                'writing score': float
            },
            'image': base64_encoded_image_string
        },
        'columns': [
            {
                'column_name': {
                    'data': {
                        'math score': float,
                        'reading score': float,
                        'writing score': float
                    },  
                    'image': base64_encoded_image_string
                }
            },
            ...
        ]
    }

"""



import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

def create_bar_plot(df: pd.DataFrame, categorical_column: str, overall_avg: pd.Series, response_dict: dict):
    plt.figure(figsize=(12, 6))
    
    # Calculate means for each score by category
    math_means = df.groupby(categorical_column)['math score'].mean()
    reading_means = df.groupby(categorical_column)['reading score'].mean()
    writing_means = df.groupby(categorical_column)['writing score'].mean()
    
    # Set bar positions
    x = range(len(df[categorical_column].unique()))
    width = 0.25
    
    # Create bars
    plt.bar([i - width for i in x], math_means, width, label='Math')
    plt.bar(x, reading_means, width, label='Reading')
    plt.bar([i + width for i in x], writing_means, width, label='Writing')
    
    # Add overall average points
    plt.plot([i - width for i in x], [overall_avg['math score']] * len(x), 'ro', label='Overall Math')
    plt.plot(x, [overall_avg['reading score']] * len(x), 'go', label='Overall Reading')
    plt.plot([i + width for i in x], [overall_avg['writing score']] * len(x), 'bo', label='Overall Writing')

    # Finalize plot
    plt.title(f'Average Scores by {categorical_column}')  
    plt.xticks(x, df[categorical_column].unique(), rotation=45)
    plt.legend()
    plt.tight_layout()
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    return image

def process_overall_avg(overall_avg: pd.Series, response_dict: dict):

    # Create bar plot for overall averages
    plt.figure(figsize=(10, 6))
    overall_avg.plot(kind='bar')
    plt.title('Overall Average Scores by Subject')
    plt.ylabel('Average Score')
    plt.xticks(rotation=0)
    plt.tight_layout()

    # save the plot to a buffer and convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    response = {'data': overall_avg.round(2).to_dict(), 'image': image}
    plt.close()
    return response

def data_analysis(file: io.BytesIO):
    df = pd.read_csv(file)
    score_columns = ['math score', 'reading score', 'writing score']
    categorical_columns = ['gender', 'race/ethnicity', 'parental level of education', 'lunch', 'test preparation course']
    overall_avg = df[score_columns].mean()

    response_dict = {}
    response_dict['overall'] = process_overall_avg(overall_avg, response_dict)
    response_dict['columns'] = []
    for col in categorical_columns:
        response_dict['columns'].append({col: {'data': df.groupby(col)[score_columns].mean().round(2).to_dict(), 'image': create_bar_plot(df, col, overall_avg, response_dict)}})
    return response_dict

if __name__ == "__main__":
    with open("StudentsPerformance.csv", "rb") as data:
        print(data_analysis(data))
