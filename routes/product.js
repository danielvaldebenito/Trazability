'use strict'
const express = require('express')
const ProductController = require('../controllers/product')
const md_auth = require('../middlewares/authenticated')
const api = express.Router()


api.get('/product/:nif', md_auth.ensureAuth, ProductController.getOneByNif)

module.exports = api;