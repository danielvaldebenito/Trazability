'use strict'
var express = require('express')
var AddressController = require('../controllers/address')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()

api.get('/address/:client?/', md_auth.ensureAuth, AddressController.getAll)
api.get('/address/:id', md_auth.ensureAuth, AddressController.getOne)
api.post('/address/', [md_auth.ensureAuth, md_wh.createAddressWarehouse], AddressController.saveOne)
api.put('/address/:id', md_auth.ensureAuth, AddressController.updateOne)
api.delete('/address/:id', [md_auth.ensureAuth, md_auth.isAdmin], AddressController.deleteOne)

module.exports = api;