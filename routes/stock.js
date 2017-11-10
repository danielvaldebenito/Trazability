'use strict'
const express = require('express')
const StockController = require('../controllers/stock')
const api = express.Router()
const md_auth = require('../middlewares/authenticated')
api.get('/stock/:nif', StockController.getByNif)
api.get('/stock-warehouse/:warehouse', md_auth.ensureAuth, StockController.getStockWarehouse)
api.get('/stock-export', md_auth.ensureAuth, StockController.exportToExcel)
api.get('/stock-resume-export', md_auth.ensureAuth, StockController.exportResumeToExcel)
module.exports = api;