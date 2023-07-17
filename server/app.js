var createError = require('http-errors');
var express = require('express');
var path = require('path');
const url = require('url');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/players');
var puzzlesRouter = require('./routes/puzzles');
var imagesRouter = require('./routes/images');

var app = express();
let cors = require('cors')
app.use(
  cors({
    origin: "*", //that will be site domain we put this here
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use((req, res, next) => {
  if (!req.url.endsWith(".js") && !req.url.endsWith(".css")) {
    res.type("text/html");
  }
  next();
});

app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.type("text/javascript");
  }
  next();
});

app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "puzzle", "dist", "assets"))
);
app.use(express.static(path.join(__dirname, "..", "puzzle", "dist")));

app.get("/index-*.js", function (req, res) {
  res.type("application/javascript");
  res.sendFile(
    path.join(__dirname, "..", "puzzle", "dist", "assets", req.path)
  );
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/', indexRouter);
app.use('/players', usersRouter);
app.use('/puzzles', puzzlesRouter);
app.use('/images', imagesRouter);

app.get("*", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "puzzle",
    "dist",
    "index.html"
  );
  console.log("File path:", filePath);
  res.sendFile(filePath);
});

module.exports = app;
