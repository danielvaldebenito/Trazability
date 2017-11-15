'use strict'
const express = require('express')
const ProductController = require('../controllers/product')
const md_auth = require('../middlewares/authenticated')
const api = express.Router()
const multipart = require('connect-multiparty')
const md_upload = multipart({uploadDir: './uploads/products'});

api.get('/products', md_auth.ensureAuth, ProductController.getAllProducts)
api.get('/products/format', md_auth.ensureAuth, ProductController.getAllProductsFormat)
api.get('/products/json/:page', ProductController.getJsonProducts)
api.get('/product/:nif', md_auth.ensureAuth, ProductController.getOneByNif)
api.get('/product-exists/:nif', md_auth.ensureAuth, ProductController.existsByNif)
api.post('/product-false-nif', md_auth.ensureAuth, ProductController.createFalseNifs)
api.post('/products-load', [md_auth.ensureAuth, md_upload], ProductController.importProducts )
module.exports = api;