'use strict'
var express = require('express')
var ZoneController = require('../controllers/zone')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/zone/', md_auth.ensureAuth, ZoneController.getAll)
api.get('/zone/:id', md_auth.ensureAuth, ZoneController.getOne)
api.post('/zone/', [md_auth.ensureAuth], ZoneController.saveOne)
api.put('/zone/:id', md_auth.ensureAuth, ZoneController.updateOne)
api.delete('/zone/:id', [md_auth.ensureAuth, md_auth.isAdmin], ZoneController.deleteOne)

module.exports = api;