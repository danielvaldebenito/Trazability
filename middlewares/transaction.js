'use strict'

var mongoose = require('mongoose')
var Transaction = require('../models/transaction')
var createSaleTransaction = function(req, res, next) {
    console.log('Creando transaccion')
    var transaction = new Transaction()
    transaction.type = 'VENTA'
    transaction.save((err, tr) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.transaction = tr._id
        next();
    })
}

module.exports = {
    createSaleTransaction
}