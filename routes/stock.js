'use strict'
var express = require('express')
var StockController = require('../controllers/stock')
var api = express.Router()

api.get('/stock/:nif', StockController.getByNif)


module.exports = api;