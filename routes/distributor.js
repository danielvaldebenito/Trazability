'use strict'
const express = require('express')
const DistributorController = require('../controllers/distributor')
const md_auth = require('../middlewares/authenticated')
const api = express.Router()

api.get('/distributors/', md_auth.ensureAuth, DistributorController.getAll)
api.get('/distributor/:id', md_auth.ensureAuth, DistributorController.getOne)
api.post('/distributor/', [md_auth.ensureAuth], DistributorController.saveOne)
api.put('/distributor/:id', md_auth.ensureAuth, DistributorController.updateOne)
api.put('/finish-tutorial/:distributor', md_auth.ensureAuth, DistributorController.finishTutorial)
api.delete('/distributor/:id', [md_auth.ensureAuth, md_auth.isAdmin], DistributorController.deleteOne)

module.exports = api;