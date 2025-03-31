from flask import Flask, request, jsonify
import base64
from utils import data_analysis as da

app = Flask(__name__)

# DUMMY_IMAGE = {
#     'image': 'dummy_output.png'
# }

# with open('src/dummy_output.png', "rb") as image_file:
#         encoded_image = base64.b64encode(image_file.read()).decode('utf-8')


# DUMMY_RESPONSE = {
#     'averages': {
#         'math': 75.5,
#         'reading': 82.3,
#         'writing': 78.9
#     },
#     'averages_by_column': {
#         'gender': {
#             'male': 75.5,
#             'female': 82.3
#         },
#         'lunch': {
#             'standard': 75.5,
#             'free': 82.3
#         },
#         'test_preparation_course': {
#             'completed': 75.5,
#             'none': 82.3
#         }
#     },
#     'averages_by_row': {
#         'student_1': {
#             'math': 75.5,
#             'reading': 82.3,
#             'writing': 78.9
#         },
#         'student_2': {
#             'math': 75.5,
#             'reading': 82.3,
#             'writing': 78.9
#         }
#     },
#     'image': encoded_image
# }

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename != 'StudentsPerformance.csv':
        return jsonify({'error': 'This app currently only supports the StudentsPerformance.csv file'}), 400

    results = da.data_analysis(file)
    
    return jsonify({
        'message': 'File processed successfully!',
        'filename': file.filename,
        'results': results
                
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
