import axios from 'axios';


const generateAIReply=async(emailContent)=>{
    try{
     const response=await axios.post('http://localhost:8000/generate-reply',{
        emailContent
     });
     return response.data.reply;
    }catch(error){
     console.error('Error generating AI reply:', error);
     throw error;
    }
}

export {generateAIReply};