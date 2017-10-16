'use strict'
var express = require('express')
var SaleController = require('../controllers/sale')
var md_auth = require('../middlewares/authenticated')
var md_transaction = require('../middlewares/transaction')
var md_document = require('../middlewares/document')
var md_movement = require('../middlewares/movement')
var md_movementItem = require('../middlewares/movementItem')
var md_sale = require('../middlewares/sale')
var md_order = require('../middlewares/order')
var md_geocoding = require('../middlewares/geocoding')
var md_warehouse = require('../middlewares/warehouse')
var api = express.Router()


api.get('/sale/', md_auth.ensureAuth, SaleController.getAll)
api.get('/sale/:id', md_auth.ensureAuth, SaleController.getOne)
api.get('/sale-order/:order', md_auth.ensureAuth, SaleController.getOneFromOrder)
api.post('/sale/', [
    md_auth.ensureAuth,
    md_order.validateDelivery,
    md_geocoding.findCoordFromAddress,
    md_warehouse.createAddressWarehouseForOrder,
    md_warehouse.getWarehouseFromVehicle, 
    md_transaction.createSaleTransaction, 
    md_document.createDocument, 
    md_movement.createInputMovementFromSale,
    md_movement.createInputMovementFromRetreat,
    md_movement.createOutputMovementFromSale, 
    md_movement.createOutputMovementFromRetreat,
    md_movementItem.createMovementItems,
    md_movementItem.createMovementItemsByRetreat, 
    md_order.clientFromOrderByDevice, 
    md_sale.convertMovementDetailToSaleDetail,
    md_order.saveOneByDevice
     ], SaleController.saveOne)

api.post('/sale-granel/', [
    md_auth.ensureAuth,
    md_sale.convertMovementDetailToSaleDetail,
    md_order.saveOneByDevice
    ], SaleController.saveOne)
api.put('/sale/:id', md_auth.ensureAuth, SaleController.updateOne)
api.delete('/sale/:id', [md_auth.ensureAuth, md_auth.isAdmin], SaleController.deleteOne)

module.exports = api;