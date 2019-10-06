'use strict';

const express = require('express');
const os = require('os');
const gateways = require('./lib/gateways');

console.log(gateways.GATEWAYS);

const app = express();
app.set('views', 'views');
app.set('view engine', 'jade');

app.locals.env = process.env;
app.locals.os = os;

app.get('/', function (req, res) {
  res.render('index', {});
});

const server = app.listen(process.env.PORT || 8080,  () => {
  console.log("Server listeing on port " + server.address().port);
});
