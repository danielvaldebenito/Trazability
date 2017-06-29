'use strict'
var express = require('express')
var UserWarehouseController = require('../controllers/userWarehouse')
var md_auth = require('../middlewares/authenticated')
var api = express.Router()

api.get('/userwarehouse/u=:user', md_auth.ensureAuth, UserWarehouseController.getForUser)
api.get('/userwarehouse/w=:warehouse', md_auth.ensureAuth, UserWarehouseController.getForWarehouse)
api.get('/userwarehouse/:distributor?', md_auth.ensureAuth, UserWarehouseController.getAll)
api.get('/userwarehouse/:id', md_auth.ensureAuth, UserWarehouseController.getOne)
api.post('/userwarehouse/', md_auth.ensureAuth, UserWarehouseController.saveOne)
api.put('/userwarehouse/:id', md_auth.ensureAuth, UserWarehouseController.updateOne)
api.delete('/userwarehouse/:id', [md_auth.ensureAuth, md_auth.isAdmin], UserWarehouseController.deleteOne)

module.exports = api;