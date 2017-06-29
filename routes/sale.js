'use strict'
var express = require('express')
var SaleController = require('../controllers/sale')
var md_auth = require('../middlewares/authenticated')
var md_transaction = require('../middlewares/transaction')
var md_document = require('../middlewares/document')
var api = express.Router()


api.get('/sale/', md_auth.ensureAuth, SaleController.getAll)
api.get('/sale/:id', md_auth.ensureAuth, SaleController.getOne)
api.post('/sale/', [ md_auth.ensureAuth, md_document.createDocument ], SaleController.saveOne)
api.put('/sale/:id', md_auth.ensureAuth, SaleController.updateOne)
api.delete('/sale/:id', [md_auth.ensureAuth, md_auth.isAdmin], SaleController.deleteOne)

module.exports = api;