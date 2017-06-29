'use strict'
var express = require('express')
var StoreController = require('../controllers/store')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()

api.get('/store/:distributor?/', md_auth.ensureAuth, StoreController.getAll)
api.get('/store/:id', md_auth.ensureAuth, StoreController.getOne)
api.post('/store/', [md_auth.ensureAuth, md_wh.createStoreWarehouse], StoreController.saveOne)
api.put('/store/:id', md_auth.ensureAuth, StoreController.updateOne)
api.delete('/store/:id', [md_auth.ensureAuth, md_auth.isAdmin], StoreController.deleteOne)

module.exports = api;