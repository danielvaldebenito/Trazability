'use strict'
var express = require('express')
var DependenceController = require('../controllers/dependence')
var md_auth = require('../middlewares/authenticated')
var md_merma = require('../middlewares/warehouse')
var api = express.Router()

api.get('/dependences/:distributor', md_auth.ensureAuth, DependenceController.getAll)
api.get('/dependence/:id', md_auth.ensureAuth, DependenceController.getOne)
api.post('/dependence/', md_auth.ensureAuth, DependenceController.saveOne)
api.put('/dependence/:id', md_auth.ensureAuth, DependenceController.updateOne)
api.delete('/dependence/:id', [md_auth.ensureAuth, md_auth.isAdmin], DependenceController.deleteOne)

module.exports = api;