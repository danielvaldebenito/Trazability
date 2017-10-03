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
                                    saveMovementItemToDb(i, id, retreatInputMovement)
                                    saveMovementItemToDb(i, id, retreatOutputMovement)
                                })
                            } else {
                                id = pro._id
                                saveMovementItemToDb(i, id, retreatInputMovement)
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
    createMovementItemsByRetreat
}