'use strict'
var express = require('express')
var FolioController = require('../controllers/folio')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/folios/:distributor', md_auth.ensureAuth, FolioController.getAll)
api.get('/folio/:id', md_auth.ensureAuth, FolioController.getOne)
api.post('/folio/', [md_auth.ensureAuth], FolioController.saveOne)
api.delete('/folio/:id', [md_auth.ensureAuth, md_auth.isAdmin], FolioController.deleteOne)

module.exports = api;