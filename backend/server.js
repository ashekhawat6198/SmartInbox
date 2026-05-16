import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';

dotenv.config();

const app=express();

app.use('/auth',authRoutes);
app.use('/gmail',gmailRoutes);

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});