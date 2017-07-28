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
api.get('/pricelists/:distributor?', md_auth.ensureAuth, SelectController.getPriceLists)
/* Obtiene roles de usuario */
api.get('/roles', md_auth.ensureAuth, SelectController.getRoles)

api.get('/internal-process-types', md_auth.ensureAuth, SelectController.getInternalProcessTypes)
module.exports = api;