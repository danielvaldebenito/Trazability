'use strict'

var mongoose = require('mongoose')
var Transaction = require('../models/transaction')
var createSaleTransaction = function(req, res, next) {
    var body = req.body
    if (!body.delivery.done) {
        return next()
    }
    var transaction = new Transaction()
    transaction.type = 'VENTA'
    transaction.device = body.device
    transaction.user = req.user.sub
    transaction.document = body.document
    transaction.save((err, tr) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        console.log('Transacción creada')
        req.body.transaction = tr._id
        next();
    })
}
var createAnyTransaction = function(req, res, next) {
    var body = req.body
    var transaction = new Transaction()
    transaction.type = body.transactionType
    transaction.device = body.device
    transaction.document = body.document
    transaction.user = req.user.sub
    transaction.save((err, tr) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware que crea transacción', error: err })
            return
        };
        console.log('Transacción creada')
        req.body.transaction = tr._id
        next();
    })
}
module.exports = {
    createSaleTransaction,
    createAnyTransaction
}