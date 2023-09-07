var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const mongoose=require('mongoose')
const cors=require('cors')



const teacherRouter = require('./routes/teacher');
const administratorRouter = require('./routes/administrator');
const studentRouter=require('./routes/student')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'https://frontend-managment.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));

mongoose.connect("mongodb+srv://afhamdunnurpp:Afham%4098@cluster0.igpowov.mongodb.net/collagemanagment").then(
  console.log("connected")
).catch((error)=>{
  console.log(error)
})

app.use('/teacher', teacherRouter);
app.use('/admin', administratorRouter);
app.use('/student',studentRouter)

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
