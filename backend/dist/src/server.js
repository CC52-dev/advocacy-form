import express, { urlencoded, json } from "express";
import { notFound } from "./middleware/not-found.js";
import { error } from "./middleware/error.js";
import { request } from "./middleware/request.js";
const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(request);
app.get('/', (req, res) => {
    res.json({ 'message': 'Hello World!' });
});
app.get('/api/clear', (req, res) => {
    console.clear();
    res.redirect('http://localhost:3000/');
});
import formRouter from './routes/form.js';
app.use('/api/form', formRouter);
app.use(notFound);
app.use(error);
export default app;
