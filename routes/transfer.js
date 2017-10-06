'use strict'
const express = require('express')
const TransferController = require('../controllers/transfer')
const md_document = require('../middlewares/document')
const md_auth = require('../middlewares/authenticated')
const md_transaction = require('../middlewares/transaction')
const md_movement = require('../middlewares/movement')
const md_movementItem = require('../middlewares/movementItem')
const md_wh = require('../middlewares/warehouse')
const api = express.Router()

api.post('/transfer/', 
[
     md_auth.ensureAuth,
     md_wh.getWarehousesFromMovement,
     md_wh.getVehicleWarehouse,
     md_wh.getInternalProcessWarehouse,
     md_transaction.createAnyTransaction,
     md_movement.createInputMovement,
     md_movement.createOutputMovement,
     md_movementItem.createNormalMovementItems
], TransferController.saveOne )

api.put('/transfer/',
[
    md_auth.ensureAuth,
    md_wh.getWarehousesFromMovement,
    md_wh.getVehicleWarehouse,
    md_wh.getInternalProcessWarehouse,
    md_transaction.createAnyTransaction,
    // 1 vez
    md_movement.createInputMovement,
    md_movement.createOutputMovement,
    md_movementItem.createNormalMovementItems,
    
    md_movementItem.invertVariables,
    // 2 vez
    md_movement.createInputMovement,
    md_movement.createOutputMovement,
    md_movementItem.createNormalMovementItems
],
TransferController.saveStation)

module.exports = api