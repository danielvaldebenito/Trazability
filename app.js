'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var app = express();

// create routes
var user_routes = require('./routes/user')
var address_routes = require('./routes/address')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// configurar cabeceras
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Authorization, X_API_KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
})

// rutas base
app.use('/api', user_routes)
app.use('/api', address_routes)



module.exports = app