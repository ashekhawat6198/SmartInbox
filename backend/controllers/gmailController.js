import { google } from "googleapis";
import oauth2Client from "../config/googleAuth.js";

export const getInboxEmails = async (req, res) => {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        messages: "No emails found in the inbox.",
      });
    }

    const emailData = [];

    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const headers = email.data.payload.headers;

      const subject = headers.find((item) => item.name === "Subject")?.value;

      const from = headers.find((item) => item.name === "From")?.value;

      emailData.push({
        id: message.id,
        from,
        subject,
        snippet: email.data.snippet,
      });
    }

    res.json(emailData);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getSingleEmail = async (req, res) => {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    const { id } = req.params;

    const response = await gmail.users.messages.get({
      userId: "me",
      id,
    });

    const headers = response.data.payload.headers;

    const subject = headers.find((item) => item.name === "Subject")?.value;

    const from = headers.find((item) => item.name === "From")?.value;

    // Email Body
    let body = "";

    if (response.data.payload.parts) {
      const part = response.data.payload.parts.find(
        (part) => part.mimeType === "text/plain",
      );

      if (part?.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }

    res.json({
      id,
      from,
      subject,
      body,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    const { to, subject, message } = req.body;

    // email format

    const emal = [
      `To:${to}`,
      "Content-Type: text/plain; charset=UTF-8",
      "MIME-Version: 1.0",
      `Subject:${subject}`,
      "",
      message,
    ].join("\n");

    const encodedEmail = Buffer.from(emal)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });

    res.json({
      message: "Email sent successfully",
      id: response.data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
