'use strict'

var mongoose = require('mongoose')
var Movement = require('../models/movement')
var Transaction = require('../models/transaction')
var MovementItem = require('../models/movementItem')
var Enumerable = require('linq')

var createMovementFromSale = function(req, res, next) {
    
    var params = req.body
    var movement = new Movement()
    movement.type = 'S',
    movement.transaction = params.transaction
    movement.warehouse = params.warehouse

    Transaction.findById(params.transaction, (err, transaction) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})

        movement.save((err, mov) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
            req.body.movement = mov._id
            transaction.movements.push(mov)
            transaction.save((e, t) => {
                if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar la transaction', e})

            })
            next()
        })
    })
}

module.exports = {
    createMovementFromSale
}