'use strict'
const express = require('express')
const SimpleInventoryController = require('../controllers/simpleInventory')
const md_auth = require('../middlewares/authenticated')
const md_wh = require('../middlewares/warehouse')
const api = express.Router()

api.get('/simple-inventory/', md_auth.ensureAuth, SimpleInventoryController.getAll)
api.get('/simple-inventory/:id', md_auth.ensureAuth, SimpleInventoryController.getOne)
api.post('/simple-inventory/', [md_auth.ensureAuth], SimpleInventoryController.saveOne)

module.exports = api;