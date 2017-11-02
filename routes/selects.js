'use strict'
var express = require('express')
var SelectController = require('../controllers/selects')
var md_auth = require('../middlewares/authenticated')

var api = express.Router()

api.get('/vehicleTypes', md_auth.ensureAuth, SelectController.getvehicleTypes)
api.get('/inicialdata/:distributor', md_auth.ensureAuth, SelectController.initialDataToDevice)
api.get('/country', md_auth.ensureAuth, SelectController.getCountryData)
/* Obtiene la totalidad de vehiculos de un distribuidor */
api.get('/vehicles/:distributor?', md_auth.ensureAuth, SelectController.getVehiclesToAsign)
/* Obtiene la totalidad de dependencias de un distribuidor */
api.get('/dependences/:distributor?', md_auth.ensureAuth, SelectController.getDependences)
/* Obtiene lista de precios */
api.get('/pricelists/:distributor', md_auth.ensureAuth, SelectController.getPriceLists)
/* Obtiene roles de usuario */
api.get('/roles', md_auth.ensureAuth, SelectController.getRoles)
/* Obtiene procesos internos de planta en el sistema */
api.get('/internal-process-types', md_auth.ensureAuth, SelectController.getInternalProcessTypes)
/* Obtiene lista de usuarios de un distribuidor, por el rol que tienen */
api.get('/user-rol/:distributor/:rol', md_auth.ensureAuth, SelectController.getUsersFromRol)
/* Obtiene lista de estados de pedidos*/
api.get('/order-states', md_auth.ensureAuth, SelectController.getOrderStates)
/* Obtiene métodos de pago */
api.get('/pay-methods', md_auth.ensureAuth, SelectController.getPayMethods)
/* Obtiene las pos de un distributor */
api.get('/pos/:distributor', md_auth.ensureAuth, SelectController.getPos)
/* Obtiene las razones para envio a mantención */
api.get('/maintenance-reasons', md_auth.ensureAuth, SelectController.getReasonsMaintenance)
/* Obtiene los tipos de transctions */
api.get('/transaction-types', md_auth.ensureAuth, SelectController.getTransactionTypes)
module.exports = api;