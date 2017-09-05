'use strict'

var mongoose = require('mongoose')
var Movement = require('../models/movement')
var MovementItem = require('../models/movementItem')
var Product = require('../models/product')
var createMovementItems = function(req, res, next) {
    
    var params = req.body
    var movement = params.movement
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
                            saveMovementItemToDb(i, id, movement)
                            
                        })
                    } else {
                        id = pro._id
                        saveMovementItemToDb(i, id, movement)

                    }
                    
                })
        
    })
    next()
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
            
            movement.items.push( mi )
            movement.save()
            return true
        })
        
    })
    
}
module.exports = {
    createMovementItems
}