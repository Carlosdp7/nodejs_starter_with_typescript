import express from 'express';
import { roleRouter } from './role';
import { userRouter } from './user';

const app = express();

app.use('/users', userRouter);
app.use('/roles', roleRouter);

export { app as v1Routers } 