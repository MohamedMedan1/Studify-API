const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require("dotenv");
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

const studentRouter = require("./routes/studentRoutes");
const instructorRouter = require("./routes/instructorRoutes");
const courseRouter = require("./routes/courseRoutes");
const levelRouter = require("./routes/levelRoutes");
const adminRouter = require("./routes/adminRoutes");

const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./utils/appError');

// Enable Config.env file to can access to process.env
dotenv.config({ path: "./config.env" });
const app = express();

// To enable file exporting
app.use(express.static('public'));

app.use(morgan("dev"));

// Enable frontend to call api
app.use(cors());

app.set('trust proxy', 1);

// Rate limiting to prevent Brute Force or DOS/DDOS Attack
const limiter = rateLimit({
  limit: 200,
  windowMs: (15 * 60 * 1000)
});

app.use(limiter);

// Preventing User to add some headers to requests
app.use(helmet());

// Body Parser Middleware and limit the body size
app.use(express.json({ limit: "10kb" }));

// Preventing Cross Site Scripting Attacks
app.use(xss());

// Preventing NoSQL Query Injection like {email:{$gte:""}}
app.use(mongoSanitize());

// Preventing Parameter Pollution 
app.use(hpp({
  whitelist: ['course','sort', 'page', 'limit']
}));

// Main Routes
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/instructors", instructorRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/levels", levelRouter);

// Admin Routes
app.use("/api/v1/admins", adminRouter);

app.use('*', (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
})

app.use(globalErrorHandler);

module.exports = app;
