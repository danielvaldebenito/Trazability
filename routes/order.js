'use strict'
var express = require('express')
var OrderController = require('../controllers/order')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()


api.get('/order/:distributor', md_auth.ensureAuth, OrderController.getAll)
api.get('/order/:id', md_auth.ensureAuth, OrderController.getOne)
api.post('/order/', [ md_auth.ensureAuth ], OrderController.saveOne)
api.put('/order/:id', md_auth.ensureAuth, OrderController.updateOne)
api.delete('/order/:id', [md_auth.ensureAuth, md_auth.isAdmin], OrderController.deleteOne)

module.exports = api;