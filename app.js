'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var app = express();

// create routes

var address_routes = require('./routes/address')
var client_routes = require('./routes/client')
var dependence_routes = require('./routes/dependence')
var distributor_routes = require('./routes/distributor')
var order_routes = require('./routes/order')
var productType_routes = require('./routes/productType')
var sale_routes = require('./routes/sale')
var store_routes = require('./routes/store')
var user_routes = require('./routes/user')
var userWarehouse_routes = require('./routes/userWarehouse')
var vehicle_routes = require('./routes/vehicle')
var zone_routes = require('./routes/zone')

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
app.use('/api', address_routes)
app.use('/api', client_routes)
app.use('/api', dependence_routes)
app.use('/api', distributor_routes)
app.use('/api', order_routes)
app.use('/api', productType_routes)
app.use('/api', sale_routes)
app.use('/api', store_routes)
app.use('/api', user_routes)
app.use('/api', userWarehouse_routes)
app.use('/api', vehicle_routes)
app.use('/api', zone_routes)
module.exports = app