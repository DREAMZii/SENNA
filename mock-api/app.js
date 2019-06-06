#!/usr/bin/env node

global.__basedir = __dirname;

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var references = require('./routes/references');
var image = require('./routes/image');
var news = require('./routes/news');
var sentiment = require('./routes/sentiment');
var config = require('./routes/config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/SearchReferences', references);
app.use('/api/Image', image);
app.use('/api/News', news);
app.use('/api/Sentiment', sentiment);
app.use('/api/GetCOnfig', config);

module.exports = app;
