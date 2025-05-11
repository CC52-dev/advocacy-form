import app from "./server.js";
const port = process.env.PORT || 80;

app.listen(80,'0.0.0.0', () => {
  console.log(`Server is listening at port ${port}`);
});
