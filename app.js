'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// create routes


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// configurar cabeceras

// rutas base



module.exports = app;