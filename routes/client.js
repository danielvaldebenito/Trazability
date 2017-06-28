'use strict'
var express = require('express')
var ClientController = require('../controllers/client')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/client/', md_auth.ensureAuth, ClientController.getAll)
api.get('/client/:id', md_auth.ensureAuth, ClientController.getOne)
api.post('/client/', md_auth.ensureAuth, ClientController.saveOne)
api.put('/client/:id', md_auth.ensureAuth, ClientController.updateOne)
api.delete('/client/:id', [md_auth.ensureAuth, md_auth.isAdmin], ClientController.deleteOne)

module.exports = api;