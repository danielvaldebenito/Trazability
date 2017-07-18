'use strict'
var express = require('express')
var GeoreferenceController = require('../controllers/georeference')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/georeference/:requestId', md_auth.ensureAuth, GeoreferenceController.getForRequest)
api.get('/georeference/:id', md_auth.ensureAuth, GeoreferenceController.getOne)
api.post('/georeference/', [ md_auth.ensureAuth], GeoreferenceController.saveOne)
api.put('/georeference/:id', md_auth.ensureAuth, GeoreferenceController.updateOne)
api.delete('/georeference/:id', [md_auth.ensureAuth, md_auth.isAdmin], GeoreferenceController.deleteOne)

module.exports = api;