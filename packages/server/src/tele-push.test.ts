import {
  appSendCode,
  appSignin,
  sendNote,
  getHistoryMessages,
  getFullUser,
  sendMessage,
} from "./tele-push";

const phoneNumber = String(process.env.TELEGRAM_PHONE_NUMBER);

xit("should send note correctly", async () => {
  const result = await sendNote("a test script", {
    field1: 1,
    field2: "a string",
  });

  expect(1).toEqual(1);
});

xit("should send code to user", async () => {
  const result = await appSendCode(phoneNumber);

  expect(result).toBeDefined();
});

xit("should sign user in", async () => {
  const result = await appSignin(phoneNumber, "80509", "a5cc77c288a917fd41");
  expect(result).toBeDefined();
});

xit("should get full user", async () => {
  const result = await getFullUser();

  expect(result).toBeDefined();
});

it("should read the chat history", async () => {
  const result = await getHistoryMessages(2);
  console.info(result);
  expect(result).toBeDefined();
});

it("should send message correctly", async () => {
  const result = await sendMessage("test message", {
    field1: "aaa",
    field2: 12345,
  });

  console.info(result);

  expect(result).toBeDefined();
});
