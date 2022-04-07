import dotenv from 'dotenv';
dotenv.config();
import './config/mongoose';
import express from 'express';
import cors from 'cors';
const port = process.env.PORT || 8080;

const app = express();

app.use(cors());

app.use(express.json());

//Global routers
app.use(require('./routers/index'));

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})