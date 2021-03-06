'use strict'
const express = require('express')
const OrderController = require('../controllers/order')
const md_auth = require('../middlewares/authenticated')
const md_wh = require('../middlewares/warehouse')
const md_vehicle = require('../middlewares/vehicle')
const api = express.Router()


api.get('/orders/:distributor', md_auth.ensureAuth, OrderController.getAll)
api.get('/orders-monitor/', md_auth.ensureAuth, OrderController.getMonitor)
api.get('/orders-monitor-export/', md_auth.ensureAuth, OrderController.exportMonitor)
api.get('/orders-monitor-page/', md_auth.ensureAuth, OrderController.getDataMonitorOtherPages)
api.get('/order/:id', md_auth.ensureAuth, OrderController.getOne)
api.get('/order-resume/:distributor', md_auth.ensureAuth, OrderController.getDayResume)
api.get('/order/vehicle/:vehicle', md_auth.ensureAuth, OrderController.getAllVehicle)
api.get('/order/device/:device/:vehicle', md_auth.ensureAuth, OrderController.getAllDevice)
api.post('/order/', [ md_auth.ensureAuth, md_wh.createAddressWarehouseForOrder, md_vehicle.getVehicleFromDevice, md_wh.getWarehouseFromVehicle], OrderController.saveOne)
api.put('/order/:id', md_auth.ensureAuth, OrderController.updateOne)
api.put('/order-set-en-ruta/', md_auth.ensureAuth, OrderController.setOrderEnRuta)
api.put('/order-cancel/:id', md_auth.ensureAuth, OrderController.cancelOrder)
api.put('/order-cancel-confirm/:id', [md_auth.ensureAuth], OrderController.confirmCancel)
api.put('/order-assign-device/', [md_auth.ensureAuth, md_vehicle.getVehicleFromDevice ], OrderController.assignDeviceToOrder)
// api.put('/order-reassign-device/', [md_auth.ensureAuth, md_vehicle.getVehicleFromDevice ], OrderController.reassignDeviceToOrder)
api.delete('/order/:id', [md_auth.ensureAuth, md_auth.isAdmin], OrderController.deleteOne)

module.exports = api;