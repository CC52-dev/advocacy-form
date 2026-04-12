import express, { urlencoded, json } from "express";
import { notFound } from "./middleware/not-found.js";
import { error } from "./middleware/error.js";
import { request } from "./middleware/request.js";
import helmet from "helmet";
import cors from "cors";

const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: true, // Allow any origin
  credentials: true, // Allow cookies
}));

app.use(request);

app.get('/', (req, res) => {
    res.json({'message': 'Hello World! v2'});
});
app.get('/api/clear', (req, res) => {
    console.clear();
    res.redirect('http://localhost:3000/');

});
import formRouter from './routes/form.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import applicantRouter from './routes/applicant.js';
import helpRouter from './routes/help.js';
import roleRouter from './routes/role.js';
import applicationRouter from './routes/application.js';
import applicationRolesRouter from './routes/applicationRoles.js';
import eventRouter from './routes/event.js';
import statsRouter from './routes/stats.js';
app.use('/api/form', formRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/applicants', applicantRouter);
app.use('/api/help', helpRouter);
app.use('/api/role', roleRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/app-roles', applicationRolesRouter);
app.use('/api/events', eventRouter);
app.use('/api/stats', statsRouter);

app.use(notFound);
app.use(error);

export default app;