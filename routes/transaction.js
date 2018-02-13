'use strict'
const express = require('express')
const TransactionController = require('../controllers/transaction')
const md_auth = require('../middlewares/authenticated')
const api = express.Router()

api.get('/transaction/:id', 
[
     
], TransactionController.getOne )
api.get('/transaction/sale/:transaction', md_auth.ensureAuth, TransactionController.getSaleByTransaction)
api.get('/transaction/station/:transaction', md_auth.ensureAuth, TransactionController.getStationByTransaction)
api.get('/transaction/transfer/:transaction', md_auth.ensureAuth, TransactionController.getTransferByTransaction)
api.get('/transaction/truckload/:transaction', md_auth.ensureAuth, TransactionController.getTruckloadByTransaction)
api.get('/transaction/truckunload/:transaction', md_auth.ensureAuth, TransactionController.getTruckunloadByTransaction)
api.get('/transaction/maintenance/:transaction', md_auth.ensureAuth, TransactionController.getMaintenanceByTransaction)
api.get('/transaction-fix', md_auth.ensureAuth, TransactionController.fixDiplicatedTransactions)
module.exports = api