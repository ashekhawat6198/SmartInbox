import express from "express";

import {
  getInboxEmails,
  getSingleEmail,
  sendEmail,
} from "../controllers/gmailController.js";

const router = express.Router();


// Inbox Route
router.get("/inbox", getInboxEmails);
router.get("/email/:id", getSingleEmail);
router.post("/send", sendEmail);

export default router;