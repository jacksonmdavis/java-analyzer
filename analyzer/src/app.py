"""
This module provides a Flask REST API for the student performance data analyzer.

The API exposes endpoints for uploading and analyzing student performance data.

Endpoints:
    POST /upload
        Accepts ONLY the StudentsPerformance.csv file and returns analysis results
        
        Request:
            - Content-Type: multipart/form-data
            - Body: file=@StudentsPerformance.csv
        
        Response:
            {
                'message': str,
                'filename': str,
                'results': {
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
            }

Note: Currently only supports the StudentsPerformance.csv file as input.
The file must contain columns for math score, reading score, writing score,
and various categorical columns (gender, lunch, test_preparation_course, etc.).


"""

from flask import Flask, request, jsonify
import base64
from utils import data_analysis as da

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename != 'StudentsPerformance.csv':
        return jsonify({'error': 'This app currently only supports the StudentsPerformance.csv file'}), 400

    results = da(file)
    
    return jsonify({
        'message': 'File processed successfully!',
        'filename': file.filename,
        'results': results
                
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
