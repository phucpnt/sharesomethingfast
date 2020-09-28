from flask import Flask, request, redirect
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'tmp')


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/text', methods=['POST'])
def sendNote():
    data = request.get_json(request)

    text = data.text
    service = data.service
    payload = data.payload


    assert text is not None
    assert service is not None

    return {"ok": True}


@app.route('/file', methods=['POST'])
def sendFile():
    # check if the post request has the file part
    service = request.form['service']
    payload = request.form['payload']
    assert service is not None
    assert payload is not None

    if 'file' not in request.files:
        return {"error": True, "message": 'no file uploaded.'}
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return {"error": True, "message": 'file not have name.'}
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        return {"ok": True, "filename": filename}
    

