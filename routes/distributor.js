'use strict'
var express = require('express')
var DistributorController = require('../controllers/distributor')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/distributor/', md_auth.ensureAuth, DistributorController.getAll)
api.get('/distributor/:id', md_auth.ensureAuth, DistributorController.getOne)
api.post('/distributor/', [md_auth.ensureAuth], DistributorController.saveOne)
api.put('/distributor/:id', md_auth.ensureAuth, DistributorController.updateOne)
api.delete('/distributor/:id', [md_auth.ensureAuth, md_auth.isAdmin], DistributorController.deleteOne)

module.exports = api;