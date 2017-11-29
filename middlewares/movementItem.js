'use strict'

const mongoose = require('mongoose')
const Movement = require('../models/movement')
const MovementItem = require('../models/movementItem')
const Product = require('../models/product')
const productService = require('../services/product')
const createMovementItems = function (req, res, next) {

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
            productService.formatNif(nif)
                .then(formatted => {
                    let product = new Product({
                        nif: formatted,
                        productType: i.productType,
                        createdByPda: true,
                        createdBy: req.user.username,
                        formatted: formatted
                    })
                    saveProduct(formatted, product)
                        .then(productId => {
                            saveMovementItemToDb(i, productId, inputMovement)
                            saveMovementItemToDb(i, productId, outputMovement)
                        })
                        .catch(error => {
                            return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err: error })
                        })
                })
                .catch((error) => {
                    return res.status(500).send({ done: false, message: 'Error al intentar formatear nif', err: error })
                })
        })
        next()
    }
}


const createNormalMovementItems = function (req, res, next) {
    const params = req.body
    const inputMovement = params.inputMovementId
    const outputMovement = params.outputMovementId
    let items
    if (req.body.isStation) {
        items = req.body.isSecondTime ? req.body.putUp : req.body.putDown
    } else {
        items = params.items
    }

    if (!items || !items.length || items.length == 0)
        return next()
    const both = inputMovement && outputMovement
    const length = items.length
    const total = both ? items.length * 2 : items.length
    let count = 0

    items.forEach((i, index) => {

        let nif = i.nif

        productService.formatNif(nif)
            .then(formatted => {
                let product = new Product ({
                    nif: formatted,
                    productType: i.productType,
                    createdByPda: true,
                    createdBy: req.user.username,
                    formatted: formatted
                })
                saveProduct(formatted, product)
                    .then(productId => {
                        const movementItem = new MovementItem({
                            fill: i.fill,
                            active: i.active,
                            product: productId,
                            movement: inputMovement || outputMovement,
                        })
                        // Movimiento de entrada
                        Movement.findByIdAndUpdate(movementItem.movement, { $push: { "items": movementItem._id } }, (err, movement) => {
                            if (err) return res.status(500).send({ done: false, message: 'Error al actualizar movement', err })
                            movementItem.save((err, mi) => {
                                if (err) return res.status(500).send({ done: false, message: 'Error al guardar movimiento item', err })
                                count++;
                                if (count == total) {
                                    next()
                                } else {
                                    if (both) {
                                        const movementItem2 = new MovementItem({
                                            fill: i.fill,
                                            active: i.active,
                                            product: productId,
                                            movement: outputMovement,
                                        })
                                        // Movimiento de salida
                                        Movement.findByIdAndUpdate(movementItem2.movement, { $push: { "items": movementItem2._id } }, (err, movement) => {
                                            if (err) return res.status(500).send({ done: false, message: 'Error Buscar movimiento ' + movementItem.movement, err })
                                            movementItem2.save((err, mi) => {
                                                if (err) return res.status(500).send({ done: false, message: 'Error al guardar movimiento item', err })
                                                count++
                                                if (count == total) {
                                                    next()
                                                }
                                            })

                                        })

                                    }
                                }

                            })
                        })
                    })
                    .catch(error => {
                        return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err: error })
                    })
                
            })
            .catch(error => { throw error })
    })
}

const saveProduct = (formatted, product) => {
    return new Promise((resolve, reject) => {
        Product.findOne({ formatted: formatted })
            .exec((err, doc) => {
                if(err) reject(err)
                if(!doc) {
                    product.save((err, saved) => {
                        if(err) reject(err)
                        resolve(saved._id)
                    })
                } else {
                    resolve(doc._id)
                }
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


const createMovementItemsByRetreat = function (req, res, next) {
    var params = req.body
    if (!params.delivery.done) {
        next()
    } else {
        const retreats = req.body.retreats
        if (!retreats || !retreats.length) {
            next()
        } else {
            const retreatOutputMovement = req.body.retreatOutputMovement
            const retreatInputMovement = req.body.retreatInputMovement
            retreats.forEach(function (i) {
                let nif = i.nif
                
                if (nif) {
                    productService.formatNif(nif)
                        .then(formatted => {
                            let product = new Product({
                                nif: formatted,
                                productType: i.productType,
                                createdByPda: true,
                                createdBy: req.user.username,
                                formatted: formatted
                            })
                            saveProduct(formatted, product)
                                .then(productId => {
                                    if (retreatInputMovement)
                                        saveMovementItemToDb(i, productId, retreatInputMovement)
                                    if (retreatOutputMovement)
                                        saveMovementItemToDb(i, productId, retreatOutputMovement)
                                    })
                                .catch(error => { 
                                    return res.status(500).send({ done: false, message: 'Error al buscar producto para verificar si existe en la base de datos', err: error 
                                })
                        })
                        .catch(error => { throw error })
                })
            }
            }, this);
            next()
        }

    }


}
var saveMovementItemToDb = function (i, id, movementId) {
    Movement.findById(movementId, (err, movement) => {
        if (err) { console.log('error al guardar item', err); return false }

        var movementItem = new MovementItem({
            fill: i.fill,
            active: i.active,
            product: id,
            movement: movement,
        })
        movementItem.save((merr, mi) => {
            if (merr) { console.log('error al guardar item', merr); return false }
            console.log('movimiento item creado')
            movement.items.push(mi)
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