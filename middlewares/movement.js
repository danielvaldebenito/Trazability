'use strict'

var mongoose = require('mongoose')
var Movement = require('../models/movement')
var Transaction = require('../models/transaction')
var MovementItem = require('../models/movementItem')
var Enumerable = require('linq')
var config = require('../config')

var createOutputMovementFromSale = function(req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        next()
    } else {
        var movement = new Movement()
        movement.type = 'S',
        movement.transaction = params.transaction
        movement.warehouse = params.warehouse
        Transaction.findById(params.transaction, (err, transaction) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
            movement.save((err, mov) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                req.body.outputMovement = mov._id
                console.log('movimiento salida creado')
                transaction.movements.push(mov)
                transaction.save((e, t) => {
                    if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar la transaction', e})
                    next()
                })
                
            })
        })
    }
    
}
const createInputMovementFromSale = function (req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        return next()
    } else {
        var movement = new Movement()
        movement.type = 'E',
        movement.transaction = params.transaction
        movement.warehouse = params.destinyWarehouse
    
        Transaction.findById(params.transaction, (err, transaction) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
    
            movement.save((err, mov) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                req.body.inputMovement = mov._id
                console.log('movimiento entrada creado')
                transaction.movements.push(mov)
                transaction.save((e, t) => {
                    if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar la transaction', e})
    
                    next()
                })
                
            })
        })
    }
    
}

var createOutputMovementFromRetreat = function(req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        return next()
    } else {
        var retreats = req.body.retreats
        if(!retreats || !retreats.length) {
            return next()
        } else {
            var movement = new Movement()
            movement.type = 'S',
            movement.transaction = params.transaction
            movement.warehouse = params.destinyWarehouse
            Transaction.findById(params.transaction, (err, transaction) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                movement.save((err, mov) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                    req.body.retreatOutputMovement = mov._id
                    console.log('movimiento retiro salida creado')
                    transaction.movements.push(mov)
                    transaction.save((e, t) => {
                        if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar la transaction', e})
                        next()
                    })
                    
                })
            })
        }
        
    }
    
}
const createInputMovementFromRetreat = function (req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        next()
    } else {
        var retreats = req.body.retreats
        if(!retreats || !retreats.length) {
            next()
        } else {
            var movement = new Movement()
            movement.type = 'E',
            movement.transaction = params.transaction
            movement.warehouse = params.warehouse
        
            Transaction.findById(params.transaction, (err, transaction) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                movement.save((err, mov) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                    req.body.retreatInputMovement = mov._id
                    console.log('movimiento retiro entrada creado')
                    transaction.movements.push(mov)
                    transaction.save((e, t) => {
                        if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar la transaction', e})
                        next()
                    })
                    
                })
            })
        }
        
    }
    
}

const createOutputMovement = function(req, res, next) {
    const params = req.body
    if(!params.originWarehouse) {
        next()
    } else {
        const movement = new Movement()
        movement.type = 'S',
        movement.transaction = params.transaction
        movement.warehouse = params.originWarehouse
        Transaction.findByIdAndUpdate(params.transaction, { $push: { movements: movement._id }}, (err, raw) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar transacción', err})
            movement.save((err, mov) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                req.body.outputMovementId = mov._id
                next()
            })
        })
    } 
}
const createInputMovement = function (req, res, next) {
    const params = req.body
    if(!params.destinyWarehouse) {
        next()
    } else {
        const movement = new Movement()
        movement.type = 'E',
        movement.transaction = params.transaction
        movement.warehouse = params.destinyWarehouse
        Transaction.findByIdAndUpdate(params.transaction, { $push: { movements: movement._id }}, (err, raw) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar transacción', err})
            movement.save((err, mov) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar el movimiento', err})
                req.body.inputMovementId = mov._id
                next()
            })
        })  
    }
}

module.exports = {
    createOutputMovementFromSale,
    createInputMovementFromSale,
    createOutputMovementFromRetreat,
    createInputMovementFromRetreat,
    createOutputMovement,
    createInputMovement
}