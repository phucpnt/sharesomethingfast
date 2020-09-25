import axios from "axios";
import { MTProto } from "@mtproto/core";

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
  let content = `
${text}\n
\`\`\`javascript
${JSON.stringify(payload, null, 2)}
\`\`\`
  `;
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

export async function getFullUser() {
  const result = await teleApp.call("users.getFullUser", {
    id: {
      _: "inputUserSelf",
    },
  });

  console.dir(result);

  return result;
}
