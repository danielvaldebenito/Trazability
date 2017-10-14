'use strict'
const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const logger = require("./logger");
const soap = require('soap')
const morgan = require('morgan')

// BODY PARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//LOG CONFIG
morgan.token('json', (req, res) => {
  return 'body: ' + JSON.stringify(req.body);
})

app.use(morgan(':method :url :status :response-time ms - :res[content-length] :json', { stream: logger.stream }))
logger.info('Iniciando aplicación')

// create routes
const address_routes = require('./routes/address')
const client_routes = require('./routes/client')
const dependence_routes = require('./routes/dependence')
const device_routes = require('./routes/device')
const distributor_routes = require('./routes/distributor')
const folio_routes = require('./routes/folio')
const georeference_request_routes = require('./routes/georeferenceRequest')
const georeference_routes = require('./routes/georeference')
const internal_process_routes = require('./routes/internalProcess')
const movement_routes = require('./routes/movement')
const order_routes = require('./routes/order')
const priceList_routes = require('./routes/priceList')
const product_routes = require('./routes/product')
const productType_routes = require('./routes/productType')
const sale_routes = require('./routes/sale')
const store_routes = require('./routes/store')
const stock_routes = require('./routes/stock')
const transaction_routes = require('./routes/transaction')
const transfer_routes = require('./routes/transfer')
const user_routes = require('./routes/user')
const userWarehouse_routes = require('./routes/userWarehouse')
const vehicle_routes = require('./routes/vehicle')
const zone_routes = require('./routes/zone')
const test_routes = require('./routes/test')
const test_integration_routes = require('./integration/routes/test')
// selects route
const selects_routes = require('./routes/selects')
// ERP INTEGRATION
const erp_order_routes = require('./integration/routes/order')
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
app.use('/api', internal_process_routes)
app.use('/api', movement_routes)
app.use('/api', order_routes)
app.use('/api', priceList_routes)
app.use('/api', product_routes)
app.use('/api', productType_routes)
app.use('/api', sale_routes)
app.use('/api', stock_routes)
app.use('/api', store_routes)
app.use('/api', transaction_routes)
app.use('/api', transfer_routes)
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
const admin = require("firebase-admin");

const serviceAccount = require('./unigas-envasado-firebase-adminsdk-bgnij-4a607b3f86.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://unigas-envasado.firebaseio.com"
});



module.exports = app