'use strict'
var express = require('express')
var PriceListController = require('../controllers/pricelist')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()


api.get('/pricelist/:distributor', md_auth.ensureAuth, PriceListController.getAll)
api.get('/pricelist/pl/:id', md_auth.ensureAuth, PriceListController.getOne)
api.post('/pricelist/', [ md_auth.ensureAuth ], PriceListController.saveOne)
api.put('/pricelist/:id', md_auth.ensureAuth, PriceListController.updateOne)
api.delete('/pricelist/:id', [md_auth.ensureAuth, md_auth.isAdmin], PriceListController.deleteOne)

module.exports = api;