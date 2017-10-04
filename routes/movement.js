'use strict'
var express = require('express')
var MovementController = require('../controllers/movement')
var md_auth = require('../middlewares/authenticated')
var md_transaction = require('../middlewares/transaction')
var md_movement = require('../middlewares/movement')
var md_movementItem = require('../middlewares/movementItem')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()


api.post('/movement/', 
    [
         md_auth.ensureAuth,
         md_wh.getWarehousesFromMovement,
         md_wh.getVehicleWarehouse,
         md_wh.getInternalProcessWarehouse,
         md_transaction.createAnyTransaction,
         md_movement.createInputMovement,
         md_movement.createOutputMovement,
         md_movementItem.createNormalMovementItems
    ], MovementController.OKMovement)

module.exports = api;