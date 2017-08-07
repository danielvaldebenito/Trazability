'use strict'
var express = require('express')
var ClientController = require('../controllers/client')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()

api.get('/clients/', md_auth.ensureAuth, ClientController.getAll)
api.get('/client/:id', md_auth.ensureAuth, ClientController.getOne)
api.get('/client-validate-nit/:nit', md_auth.ensureAuth, ClientController.validateNit)
api.post('/client/', [md_auth.ensureAuth], ClientController.saveOne)
api.post('/client-quick/', [md_auth.ensureAuth], ClientController.saveOneQuick)
api.put('/client/:id', md_auth.ensureAuth, ClientController.updateOne)
api.delete('/client/:id', [md_auth.ensureAuth, md_auth.isAdmin], ClientController.deleteOne)

module.exports = api;