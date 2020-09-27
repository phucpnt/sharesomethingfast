import axios from "axios";
import moment, { parseTwoDigitYear } from "moment";
import { MTProto } from "@mtproto/core";
import { Readable } from "stream";
import md5File from "md5-file";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_BOT_USERNAME;
const appId = process.env.TELEGRAM_APP_ID;
const appHash = process.env.TELEGRAM_APP_HASH;

const tele = axios.create({
  baseURL: "https://api.telegram.org/bot" + token,
});

const teleApp = new MTProto({
  api_hash: String(appHash),
  api_id: Number(appId),
});
teleApp.setDefaultDc(5);

type teleMessageSend = {
  chat_id: string;
  text: string;
  parse_mode: "MarkdownV2" | "HTML";
  disable_web_page_preview: boolean;
  disable_notification: boolean;
  reply_to_message_id?: number;
};

type structNote = Pick<teleMessageSend, "text" | "parse_mode">;

function makeProgramableNote(text: string, payload: any): structNote {
  const timeStr = moment().format("YYYY-MM-DD HH:mm:ss");
  //   let content = `
  // ${text}\n
  // ===========
  // ${JSON.stringify(payload, null, 2)}
  // ===========${timeStr}<<<
  // `;

  let content = JSON.stringify(
    {
      text,
      payload,
    },
    null,
    2
  );
  return {
    text: content,
    parse_mode: "MarkdownV2",
  };
}

export async function sendNote(text: string, payload: any) {
  const message: teleMessageSend = {
    chat_id: String(chatId),
    ...makeProgramableNote(text, payload),
    disable_web_page_preview: true,
    disable_notification: false,
  };

  try {
    const result = await tele.post("/sendMessage", message, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.info(result.data);
  } catch (error) {
    console.error(error);
  }
}

export async function appSendCode(phone: string) {
  const result = await teleApp
    .call("auth.sendCode", {
      phone_number: phone,
      settings: {
        _: "codeSettings",
      },
    })
    .catch((error: Error) => {
      console.error(error);
      throw error;
    });

  console.info(result);
  return result;
}

export async function appSignin(
  phone: string,
  phoneCode: string,
  phoneCodeHash: string
) {
  const result = await teleApp.call("auth.signIn", {
    phone_code: phoneCode,
    phone_number: phone,
    phone_code_hash: phoneCodeHash,
  });

  console.info({ result });

  return result;
}

export async function getFullUser() {
  const result = await teleApp.call("users.getFullUser", {
    id: {
      _: "inputUserSelf",
    },
  });

  console.dir(result);

  return result;
}

export async function getHistoryMessages(fromMessageId: number, limit = 100) {
  const result = await teleApp.call("messages.getHistory", {
    peer: {
      _: "inputPeerChannel",
      channel_id: 1383133416,
      access_hash: "17932621754438103818",
    },
    offset_id: fromMessageId,
  });

  return result;
}

export function sendMessage(text: string, payload: any) {
  const pNote = makeProgramableNote(text, payload);
  return teleApp
    .call("messages.sendMessage", {
      peer: {
        _: "inputPeerChannel",
        channel_id: 1383133416,
        access_hash: "17932621754438103818",
      },
      flags: {
        no_webpage: true,
      },
      message: pNote.text,
      random_id: Number(Math.random().toString().slice(2)),
    })
    .catch((error) => {
      console.error(error);
    });
}

const maxPartSize = 512 * 1024 - 84;
function uploadPart(fileId: number, partIndex: number, buffer: Buffer) {
  console.info('buffer length', buffer.length, buffer.byteLength)
  return teleApp.call("upload.saveFilePart", {
    file_id: fileId,
    file_part: partIndex,
    bytes: buffer, 
  });

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     console.info('upload part', {fileId, partIndex, bytes})
  //     resolve(true);
  //   }, 100);
  // });
}

type uploadQueue = {
  fileId: number;
  uploadIndex: number;
  parts: any[];
};

export async function uploadFile(
  fstream: Readable,
  fileInfo: {
    md5checksum: string;
    filename: string;
    mimeType: string;
  },
  message: {
    text: string;
    payload: any;
  }
) {
  let uploadQ: uploadQueue = {
    fileId: Number(Math.random().toString().slice(2)),
    uploadIndex: 0,
    parts: [Buffer.concat([])],
  };
  let readFileDone = false;

  fstream.on("data", (chunk) => {
    const cIndex = uploadQ.parts.length - 1;
    const remainPartSize =
      uploadQ.parts.length > 0
        ? maxPartSize - uploadQ.parts[cIndex].length
        : maxPartSize;

    const cbuffer = Buffer.concat([chunk]);
    uploadQ.parts[cIndex] = Buffer.concat([
      uploadQ.parts[cIndex],
      cbuffer.slice(0, remainPartSize),
    ]);

    if (remainPartSize < chunk.length) {
      uploadQ.parts.push(chunk.slice(remainPartSize));
    }
  });
  fstream.on("end", () => {
    readFileDone = true;
  });

  for (; uploadQ.parts.length > 0 || !readFileDone; ) {
    let singlePart = uploadQ.parts[0];
    if (singlePart.length === maxPartSize) {
      // valid full part
      await uploadPart(uploadQ.fileId, uploadQ.uploadIndex++, singlePart);
      uploadQ.parts.shift();
    } else if (uploadQ.parts.length === 1 && readFileDone) {
      // end of file and part is not full
      await uploadPart(uploadQ.fileId, uploadQ.uploadIndex++, singlePart);
      uploadQ.parts.shift();
    }
    await sleep(10);
  }

  return teleApp.call("messages.sendMedia", {
    media: {
      _: "inputMediaUploadedDocument",
      file: {
        _: "inputFile",
        id: uploadQ.fileId,
        parts: uploadQ.uploadIndex,
        md5_checksum: fileInfo.md5checksum,
      },
      mime_type: fileInfo.mimeType,
      attributes: [
        {
          _: "documentAttributeFilename",
          file_name: fileInfo.filename,
        },
      ],
    },
    message: makeProgramableNote(message.text, message.payload).text,
    random_id: Math.random().toString().slice(2),
  });

  return { fileId: uploadQ.fileId };
}

function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}
