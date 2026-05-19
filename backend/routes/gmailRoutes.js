import express, { text } from "express";

import {
  getInboxEmails,
  getSingleEmail,
  sendEmail,
} from "../controllers/gmailController.js";

import { generateAIReply } from "../services/aiService.js";

const router = express.Router();

// Inbox Route
router.get("/inbox", getInboxEmails);
router.get("/email/:id", getSingleEmail);
router.post("/send", sendEmail);
router.post("/reply", async (req, res) => {
  try {
    const { to, subject, message, threadId, messageId } = req.body;

    const mail = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      message,
    ].join("\n");

    const encodedEmail = Buffer.from(mail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
        threadId: threadId,
      },
    });
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/ai-reply", async (req, res) => {
  try {
    const { emailContent } = req.body;

    // call ai service to generate reply
    const aiResponse = await generateAIReply(emailContent);

    if (!aiResponse) {
      return res.status(500).json({
        error: "AI reply generation failed",
      });
    }

    res.json({
      success: true,
      aiReply: aiResponse,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/auto-reply/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId;

    //Step1. Fetch the original email content using messageId
    const message = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });
    const payload = message.data.payload;
    const headers = payload.headers;
    //Step2. Extract important headers
    const from = headers.find((item) => item.name === "From")?.value;
    const subject = headers.find((item) => item.name === "Subject")?.value;
    const originalMessageId = headers.find(
      (item) => item.name === "Message-ID",
    )?.value;

    //Step 3. Extract email body
    let body = "";

    if (payload.parts) {
      const textPart = payload.parts.find(
        (part) => part.mimeType === "text/plain",
      );

      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      //Step 4. Generate AI reply

      const aiResponse = await generateAIReply(body);

      if (!aiResponse.success) {
        return res.status(500).json({
          error: "AI reply generation failed",
        });
      }

      const aiReply = aiResponse.reply;

      //Step5. Create reply email
      const mail = [
        `To: ${from}`,
        `Subject: Re: ${subject}`,
        `In-Reply-To: ${originalMessageId}`,
        `References: ${originalMessageId}`,
        "Content-Type: text/plain; charset=UTF-8",
        "",
        aiReply,
      ].join("\n");

      const encodedEmail = Buffer.from(mail)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
        threadId: message.data.threadId,
      },
    });

    res.json({
      success: true,
      aiReply,
      gmailResponse: response.data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
