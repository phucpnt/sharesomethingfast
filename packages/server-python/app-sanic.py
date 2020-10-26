from sanic import Sanic
from sanic.response import json
from werkzeug.utils import secure_filename
import os
from telethon import TelegramClient, events, sync, sessions
from telethon.tl.types import PeerChannel, User, DocumentAttributeFilename
import asyncio
import hypercorn.asyncio
from json import dumps

from dotenv import load_dotenv
load_dotenv()

api_id = os.getenv('TELE_APP_ID')
api_hash = os.getenv('TELE_APP_HASH')
channel_id = os.getenv('TELE_CHANNEL', 1383133416)

client = None

print("%s---%s" % (api_id, api_hash))

app = Sanic('app-sanic')


@app.listener('before_server_start')
async def setup_telethon(app, loop):
    global client
    client = TelegramClient('single_user', api_id, api_hash, loop=loop)
    await client.connect()


@app.route('/')
async def test(request):
    return json({'hello': 'world'})


@app.route('/login', methods=['GET', 'POST'])
async def login(request):
    # We want to update the global phone variable to remember it
    args = request.args

    if 'code' in args and 'phone_code_hash' in args:
        res: User = await client.sign_in(code=args['code'][0], phone_code_hash=args['phone_code_hash'][0])
        return json(res.to_dict())

    # Check form parameters (phone/code)
    elif 'phone' in args:
        phone = args['phone'][0]
        res = await client.send_code_request(phone)
        return json({"error": 0, "phone_code_hash": res.phone_code_hash})

    # If we're logged in, show them some messages from their first dialog
    if await client.is_user_authorized():
        # They are logged in, show them some messages from their first dialog
        dialog = (await client.get_dialogs())[0]
        return json({"title": dialog.title})


@app.route('/file', methods=['POST'])
async def sendFile(request):
    # check if the post request has the file part
    form = request.form

    service = form['service']
    payload = form['payload']

    assert service is not None
    assert payload is not None

    files = request.files

    if 'file' not in files:
        return json({"error": 1, "message": 'no file uploaded.'})

    for file in files.getlist('file'):
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.name == '':
            return json({"error": 1, "message": 'file not have name.'})
        if file:
            filename = secure_filename(file.name)
            await client.send_file(
                PeerChannel(channel_id),
                file=file.body,
                attributes=[DocumentAttributeFilename(file.name)],
                caption=dumps({"service": service, "payload": payload}))

    return json({"ok": 1, "filename": filename})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, auto_reload=True)
