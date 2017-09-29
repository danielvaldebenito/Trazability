'use strict'
var express = require('express')
var InternalProcessComponent = require('../controllers/internalProcess')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()

api.get('/internal-processes/:distributor', md_auth.ensureAuth, InternalProcessComponent.getAll)
api.get('/internal-process/:id', md_auth.ensureAuth, InternalProcessComponent.getOne)
api.get('/internal-process-dependence/:dependence', md_auth.ensureAuth, InternalProcessComponent.getByDependence)
api.get('/internal-process-dependence-type/:dependence/:types?', md_auth.ensureAuth, InternalProcessComponent.getByDependenceAndTypes)
api.post('/internal-process/', [md_auth.ensureAuth, md_wh.createInternalProcessWarehouse], InternalProcessComponent.saveOne)
api.put('/internal-process/:id', md_auth.ensureAuth, InternalProcessComponent.updateOne)
api.delete('/internal-process/:id', md_auth.ensureAuth, InternalProcessComponent.deleteOne)

module.exports = api;