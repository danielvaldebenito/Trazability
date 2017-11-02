'use strict'
const express = require('express')
const PriceListController = require('../controllers/pricelist')
const md_auth = require('../middlewares/authenticated')
const api = express.Router()


api.get('/pricelist/:distributor', md_auth.ensureAuth, PriceListController.getAll)
api.get('/pricelist/pl/:id', md_auth.ensureAuth, PriceListController.getOne)
api.post('/pricelist/', [ md_auth.ensureAuth ], PriceListController.saveOne)
api.put('/pricelist/:id', md_auth.ensureAuth, PriceListController.updateOne)
api.delete('/pricelist/:id', [md_auth.ensureAuth, md_auth.isAdmin], PriceListController.deleteOne)

module.exports = api;