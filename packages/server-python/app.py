import os
from quart import Quart, request, redirect
from werkzeug.utils import secure_filename
from telethon import TelegramClient, events, sync, sessions
from telethon.tl.types import PeerChannel
import asyncio
import hypercorn.asyncio

from dotenv import load_dotenv
load_dotenv()

api_id = os.getenv('TELE_APP_ID')
api_hash = os.getenv('TELE_APP_HASH')
loop = asyncio.get_event_loop()

client = TelegramClient('anon', api_id, api_hash)

print("%s---%s" % (api_id, api_hash))

app = Quart(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'tmp')


# Connect the client before we start serving with Quart
@app.before_serving
async def startup():
    await client.connect()


# After we're done serving (near shutdown), clean up the client
@app.after_serving
async def cleanup():
    await client.disconnect()


@app.route('/')
async def hello_world():
    return 'Hello, World!'


@app.route('/text', methods=['POST'])
async def sendNote():
    data = request.get_json(request)

    text = data.text
    service = data.service
    payload = data.payload

    assert text is not None
    assert service is not None

    return {"ok": True}


@app.route('/file', methods=['POST'])
async def sendFile():
    # check if the post request has the file part
    form = await request.form

    service = form['service']
    payload = form['payload']
    assert service is not None
    assert payload is not None

    files = await request.files

    if 'file' not in files:
        return {"error": True, "message": 'no file uploaded.'}

    for file in files.getlist('file'):
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return {"error": True, "message": 'file not have name.'}
        if file:
            filename = secure_filename(file.filename)
            await client.send_file(PeerChannel(1383133416), file=file.stream)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    return {"ok": True, "filename": filename}


async def main():
    await hypercorn.asyncio.serve(app, hypercorn.Config())


# By default, `Quart.run` uses `asyncio.run()`, which creates a new asyncio
# event loop. If we create the `TelegramClient` before, `telethon` will
# use `asyncio.get_event_loop()`, which is the implicit loop in the main
# thread. These two loops are different, and it won't work.
#
# So, we have to manually pass the same `loop` to both applications to
# make 100% sure it works and to avoid headaches.
#
# To run Quart inside `async def`, we must use `hypercorn.asyncio.serve()`
# directly.
#
# This example creates a global client outside of Quart handlers.
# If you create the client inside the handlers (common case), you
# won't have to worry about any of this, but it's still good to be
# explicit about the event loop.
client.loop.run_until_complete(main())
