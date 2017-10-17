'use strict'

var mongoose = require('mongoose')
var Movement = require('../models/movement')
var MovementItem = require('../models/movementItem')
var Product = require('../models/product')
var createMovementItems = function(req, res, next) {
    
    var params = req.body
    if (!params.delivery.done) {
        next()
    } else {
        var inputMovement = params.inputMovement
        var outputMovement = params.outputMovement
        var items = params.items
        var ids = []
        var total = items.length
        items.forEach((i) => {
            var nif = i.nif
            
            Product.findOne({ nif: nif })
                    .exec((err, pro) => {
                        if(err) return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err})
                        var id
                        if(!pro)
                        {
                            var product = new Product ({
                                nif: nif,
                                productType: i.productType,
                                createdByPda: true,
                                createdBy: req.user.username
                            })
                            product.save ((errr, productStored) => {
                                if(errr) return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err})
                                id = productStored._id
                                saveMovementItemToDb(i, id, inputMovement)
                                saveMovementItemToDb(i, id, outputMovement)
                            })
                        } else {
                            id = pro._id
                            saveMovementItemToDb(i, id, inputMovement)
                            saveMovementItemToDb(i, id, outputMovement)
                        }
                        
                    })
            
        })
        next()
    }   
}


const createNormalMovementItems = function(req, res, next) {
    const params = req.body
    const inputMovement = params.inputMovementId
    const outputMovement = params.outputMovementId
    let items
    if(req.body.isStation) {
        items = req.body.isSecondTime ? req.body.putUp : req.body.putDown
    } else {
        items = params.items
    }
    if(!items || !items.length || !items.length == 0) 
        return next()
    const both = inputMovement && outputMovement
    const length = items.length
    const total = both ? items.length * 2 : items.length
    let count = 0
    
    items.forEach((i, index) => {
        console.log('item' + index, i)
        let nif = i.nif
        let product = {
            nif: nif,
            productType: i.productType,
            createdByPda: true,
            createdBy: req.user.username
        }
        Product.findOneAndUpdate({ nif: nif }, product, { upsert: true, new: true, projection: { _id: true }  }, (err, doc) => {
            if(err) return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err})
            
            const id = doc._id
            
            const movementItem = new MovementItem ({
                fill: i.fill,
                active: i.active,
                product: id,
                movement: inputMovement || outputMovement,
            })

            console.log('product: ', doc)
            // Movimiento de entrada
            Movement.findByIdAndUpdate(movementItem.movement, { $push: { "items": movementItem._id }}, (err, movement) => {
                if(err) return res.status(500).send({ done: false, message: 'Error al actualizar movement', err})
                movementItem.save((err, mi) => {
                    if(err) return res.status(500).send({ done: false, message: 'Error al guardar movimiento item', err})
                    count++;
                    if(count == total) {
                        next()
                    } else {
                        if(both) {
                            const movementItem2 = new MovementItem ({
                                fill: i.fill,
                                active: i.active,
                                product: id,
                                movement: outputMovement,
                            })
                            // Movimiento de salida
                            Movement.findByIdAndUpdate(movementItem2.movement, { $push: { "items": movementItem2._id }}, (err, movement) => {
                                if(err) return res.status(500).send({ done: false, message: 'Error Buscar movimiento ' + movementItem.movement, err})
                                movementItem2.save((err, mi) => {
                                    if(err) return res.status(500).send({ done: false, message: 'Error al guardar movimiento item', err})
                                    count++
                                    if(count == total) {
                                        next()
                                    }
                                })
                                
                            })
                            
                        } 
                    }
                    
                })
            })
        })
    })    
}
const invertVariables = function (req, res, next) {
    const origin = req.body.originWarehouse
    const destiny = req.body.destinyWarehouse
    req.body.originWarehouse = destiny
    req.body.destinyWarehouse = origin
    req.body.isSecondTime = !req.body.isSecondTime
    req.body.vehicleIsOrigin = !req.body.vehicleIsOrigin
    next() 
}


const createMovementItemsByRetreat = function(req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        next()
    } else {
        const retreats = req.body.retreats
        if(!retreats || !retreats.length) {
            next()
        } else {
            const retreatOutputMovement = req.body.retreatOutputMovement
            const retreatInputMovement = req.body.retreatInputMovement
            retreats.forEach(function(i) {
                var nif = i.nif
                if(nif) {
                    Product.findOne({ nif: nif })
                        .exec((err, pro) => {
                            if(err) return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err})
                            var id
                            if(!pro)
                            {
                                var product = new Product ({
                                    nif: nif,
                                    productType: i.productType,
                                    createdByPda: true,
                                    createdBy: req.user.username
                                })
                                product.save ((errr, productStored) => {
                                    if(errr) return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', errr})
                                    id = productStored._id
                                    if(retreatInputMovement)
                                        saveMovementItemToDb(i, id, retreatInputMovement)
                                    if(retreatOutputMovement)
                                        saveMovementItemToDb(i, id, retreatOutputMovement)
                                })
                            } else {
                                id = pro._id
                                if(retreatInputMovement)
                                    saveMovementItemToDb(i, id, retreatInputMovement)
                                if(retreatOutputMovement)
                                    saveMovementItemToDb(i, id, retreatOutputMovement)
                            }
                        
                    })
                }
            }, this);
            next()
        }
        
    }
    
    
}
var saveMovementItemToDb = function(i, id, movementId) {
    Movement.findById(movementId, (err, movement) => {
        if(err) { console.log('error al guardar item', err); return false } 

        var movementItem = new MovementItem({
            fill: i.fill,
            active: i.active,
            product: id,
            movement: movement,
        })
        movementItem.save((merr, mi) => {
            if(merr)
                { console.log('error al guardar item', merr); return false } 
            console.log('movimiento item creado')
            movement.items.push( mi )
            movement.save()
            return true
        })
        
    })
    
}
module.exports = {
    createMovementItems,
    createMovementItemsByRetreat,
    createNormalMovementItems,
    invertVariables
}