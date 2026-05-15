
// this file helps backend to connect to google, login users, access gmail api
import {google} from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client=new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI    
)
console.log(process.env.CLIENT_ID);
console.log(process.env.REDIRECT_URI);

export default oauth2Client;