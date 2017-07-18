'use strict'
var express = require('express')
var GeoreferenceRequestController = require('../controllers/georeferenceRequest')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/georeference-request/:requestId?', md_auth.ensureAuth, GeoreferenceRequestController.getForRequest)
api.get('/georeference-request/:id', md_auth.ensureAuth, GeoreferenceRequestController.getOne)
api.post('/georeference-request/', [ md_auth.ensureAuth], GeoreferenceRequestController.saveOne)
api.put('/georeference-request/:id', md_auth.ensureAuth, GeoreferenceRequestController.updateOne)
api.delete('/georeference-request/:id', [md_auth.ensureAuth, md_auth.isAdmin], GeoreferenceRequestController.deleteOne)

module.exports = api;