'use strict'
var express = require('express')
var ProductType = require('../controllers/productType')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/productType/', md_auth.ensureAuth, ProductType.getAll)
api.get('/productType/:id', md_auth.ensureAuth, ProductType.getOne)
api.post('/productType/', [md_auth.ensureAuth], ProductType.saveOne)
api.put('/productType/:id', md_auth.ensureAuth, ProductType.updateOne)
api.delete('/productType/:id', [md_auth.ensureAuth, md_auth.isAdmin], ProductType.deleteOne)

module.exports = api;