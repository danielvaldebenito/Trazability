'use strict'
var fs = require('fs')
var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var app = express();
var logger = require("./logger");
var soap = require('soap')
var morgan = require('morgan')

// BODY PARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//LOG CONFIG
morgan.token('json', (req, res) => {
  return 'body: ' + JSON.stringify(req.body) + ' | ';
})
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :json', { stream: logger.stream }))
logger.info('Iniciando aplicación')

// create routes
var address_routes = require('./routes/address')
var client_routes = require('./routes/client')
var dependence_routes = require('./routes/dependence')
var device_routes = require('./routes/device')
var distributor_routes = require('./routes/distributor')
var folio_routes = require('./routes/folio')
var georeference_request_routes = require('./routes/georeferenceRequest')
var georeference_routes = require('./routes/georeference')
var order_routes = require('./routes/order')
var priceList_routes = require('./routes/priceList')
var productType_routes = require('./routes/productType')
var sale_routes = require('./routes/sale')
var store_routes = require('./routes/store')
var user_routes = require('./routes/user')
var userWarehouse_routes = require('./routes/userWarehouse')
var vehicle_routes = require('./routes/vehicle')
var zone_routes = require('./routes/zone')
var test_routes = require('./routes/test')
var test_integration_routes = require('./integration/routes/test')
// selects route
var selects_routes = require('./routes/selects')
// ERP INTEGRATION
var erp_order_routes = require('./integration/routes/order')
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
app.use('/api', device_routes)
app.use('/api', distributor_routes)
app.use('/api', folio_routes)
app.use('/api', georeference_request_routes)
app.use('/api', georeference_routes)
app.use('/api', order_routes)
app.use('/api', priceList_routes)
app.use('/api', productType_routes)
app.use('/api', sale_routes)
app.use('/api', store_routes)
app.use('/api', user_routes)
app.use('/api', userWarehouse_routes)
app.use('/api', vehicle_routes)
app.use('/api', zone_routes)
app.use('/api', test_routes)
app.use('/api/test', test_integration_routes)
app.use('/api/selects', selects_routes)
// integration
app.use('/api/erp', erp_order_routes)
// FIREBASE
var admin = require("firebase-admin");

var serviceAccount = require('./unigas-envasado-firebase-adminsdk-bgnij-4a607b3f86.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://unigas-envasado.firebaseio.com"
});



module.exports = app