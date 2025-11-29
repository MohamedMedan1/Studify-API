const app = require("./app");
const mongoose = require("mongoose");

// Connect App to DB server on MongoDB Atlas
const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.0ksa3nh.mongodb.net/`;
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log("DateBase connected successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// Run Server on PORT:5000
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log("Server is running on 5000 port");
});

process.on("unhandledRejection", err => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  })
});