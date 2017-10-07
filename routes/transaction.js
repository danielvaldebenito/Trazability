'use strict'
const express = require('express')
const TransactionController = require('../controllers/transaction')
const api = express.Router()

api.get('/transaction/:id', 
[
     
], TransactionController.getOne )


module.exports = api