import dotenv from 'dotenv';
dotenv.config();
import './config/mongoose';
import express from 'express';
import cors from 'cors';
import { v1Routers } from './v1/routes/index'
const port = process.env.PORT || 8080;

const app = express();

app.use(cors({
  // origin: ["http://localhost:3000"],
}));

app.use(express.json());

//V1 Routers
app.use('/api/v1', v1Routers);

app.all('*', (req, res) => {
  res.status(404).send({
    err: 'Route not found'
  })
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})