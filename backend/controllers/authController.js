import oauth2Client from "../config/googleAuth.js";


// google login
export const googleLogin=async(req,res)=>{
 try{
   const url=oauth2Client.generateAuthUrl({
    access_type:'offline',
    scope:[
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
    ],
   })
    res.redirect(url);
 }catch(error){
    res.status(500).json({error:error.message});
 }
}

// after google login it provide a code and then we can exchange code with tokens to access google api
// google callback
export const googleCallback=async(req,res)=>{
    try{
       const {code}=req.query;
       const {tokens}=await oauth2Client.getToken(code);
       oauth2Client.setCredentials(tokens);
       res.send("Google Authentication Successful");
    }catch(error){
        res.status(500).json({error:error.message});
    }
}