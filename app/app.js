'use strict';

const express = require('express');
const os = require('os');

const app = express();
app.set('views', 'views');
app.set('view engine', 'jade');

app.locals.env = process.env;
app.locals.os = os;

app.get('/', function (req, res) {
  res.render('index', {});
});

app.listen(8080);
