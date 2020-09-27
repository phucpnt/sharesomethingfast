import asyncio
import pytest
from telethon import TelegramClient, events, sync, sessions
import http.client as http_client
from dotenv import load_dotenv
import os

load_dotenv()

api_id = os.getenv('APP_ID')
api_hash = os.getenv('APP_HASH')


@pytest.fixture(scope="function")
async def client_tele() -> TelegramClient:
    client = TelegramClient('anon', api_id, api_hash)
    await client.connect()
    yield client
    await client.disconnect()


# @pytest.mark.asyncio
# async def test_login(client_tele):
#     client = client_tele
#     me = await client.get_me()
#     # "me" is an User object. You can pretty-print
#     # any Telegram object with the "stringify" method:
#     print(me.stringify())

#     # When you print something, you see a representation of it.
#     # You can access all attributes of Telegram objects with
#     # the dot operator. For example, to get the username:
#     username = me.username

#     assert 'result' == 'result1'
#     print(username)
#     print(me.phone)

@pytest.mark.asyncio
async def test_file_upload(client_tele: TelegramClient):
    from telethon.tl.types import PeerChannel
    from os import path
    with open(path.join(path.dirname(__file__), 'chat_item_team_chat.csv'), 'rb') as f:
        result = await client_tele.send_file(PeerChannel(1383133416), file=f)
        print(result)
        assert 'upload' == 'upload'
