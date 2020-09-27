import {
  appSendCode,
  appSignin,
  sendNote,
  getHistoryMessages,
  getFullUser,
  sendMessage,
  uploadFile,
} from "../tele-push";
import path from "path";
import fs from "fs";
import _ from "lodash";
import md5File from "md5-file";

// const seedX = _.random(1, 3).toString();
// const phoneNumber = "99966" + seedX + _.random(1000, 9999).toString();

const phoneNumber = String(process.env.TELEGRAM_PHONE_NUMBER);

// xit("should send note correctly", async () => {
//   const result = await sendNote("a test script", {
//     field1: 1,
//     field2: "a string",
//   });

//   expect(1).toEqual(1);
// });

xit("should send code to user", async () => {
  const result = await appSendCode(phoneNumber);

  expect(result).toBeDefined();
});

xit("should sign user in", async () => {
  const result = await appSignin(phoneNumber, "18132", "196d639dfecce6812f");
  expect(result).toBeDefined();
});

xit("should get full user", async () => {
  const result = await getFullUser();

  expect(result).toBeDefined();
});

xit("should read the chat history", async () => {
  const result = await getHistoryMessages(2);
  console.info(result);
  expect(result).toBeDefined();
});

xit("should send message correctly", async () => {
  const result = await sendMessage("test message", {
    field1: "aaa",
    field2: 12345,
  });

  console.info(result);

  expect(result).toBeDefined();
});

it("should upload file correctly", async () => {
  const rstream = fs.createReadStream(
    path.join(__dirname, "./chat_item_team_chat.csv")
  );

  const result = await uploadFile(
    rstream,
    {
      filename: "chat_item_team_chat.csv",
      md5checksum: md5File.sync(
        path.join(__dirname, "./chat_item_team_chat.csv")
      ),
      mimeType: "text/csv",
    },
    {
      text: "test file upload",
      payload: {
        field1: "abc",
        field2: 1234,
      },
    }
  );

  expect(result).toBeDefined();
});
