import express from "express";

import {
  getInboxEmails,
  getSingleEmail,
  sendEmail,
} from "../controllers/gmailController.js";

import {generateAIReply} from "../services/aiService.js";

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

router.post("/ai-reply",async(req,res)=>{
  try{
     const {emailContent}=req.body;
     
     // call ai service to generate reply
     const aiResponse=await generateAIReply(emailContent);

     if(!aiResponse){
      return res.status(500).json({
        error:"AI reply generation failed", 
      })
     }

     res.json({
      success:true,
      aiReply:aiResponse,
     })
  }catch(error){
     console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
})


export default router;
