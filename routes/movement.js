'use strict'
const express = require('express')
const MovementController = require('../controllers/movement')
const md_auth = require('../middlewares/authenticated')
const md_transaction = require('../middlewares/transaction')
const md_movement = require('../middlewares/movement')
const md_movementItem = require('../middlewares/movementItem')
const md_wh = require('../middlewares/warehouse')
const md_document = require('../middlewares/document')
const api = express.Router()

api.get('/movements', md_auth.ensureAuth, MovementController.getAll)
api.post('/movement/', 
    [
         md_auth.ensureAuth,
         md_document.createDocument,
         md_wh.getWarehousesFromMovement,
         md_wh.getVehicleWarehouse,
         md_wh.getInternalProcessWarehouse,
         md_transaction.createAnyTransaction,
         md_movement.createInputMovement,
         md_movement.createOutputMovement,
         md_movementItem.createNormalMovementItems
    ], MovementController.OKMovement)
api.get('/movement-export',md_auth.ensureAuth, MovementController.exportTransaction)

module.exports = api;