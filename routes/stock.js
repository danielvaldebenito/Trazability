'use strict'
const express = require('express')
const StockController = require('../controllers/stock')
const api = express.Router()
const md_auth = require('../middlewares/authenticated')
api.get('/stock/:nif', StockController.getByNif)
api.get('/stock-warehouse/:warehouse', md_auth.ensureAuth, StockController.getStockWarehouse)

module.exports = api;