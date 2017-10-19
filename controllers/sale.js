'use strict'

const path = require('path')
const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const Sale = require('../models/sale')
const SaleItem = require('../models/saleItem')
const Transaction = require('../models/transaction')
const Movement = require('../models/movement')
const MovementItem = require('../models/movementItem')
const Document = require('../models/document')
const Delivery = require('../models/delivery')
const Order = require('../models/order')
const pushSocket = require('../services/pushSocket')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1

    Sale.find()
            .sort([[sidx, sord]])
            .populate('document')
            .populate({
                path: 'transaction',
                populate: {
                    path: 'movements',
                    model: Movement,
                    populate: { path: 'items', model: MovementItem }
                }
            })
            .populate('delivery')
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                
                return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: records, 
                        total: total
                    })
                
                
            })
}
function getOne (req, res) {
    var id = req.params.id
    Sale.findById(id)
        .populate('document')
        .populate('transaction')
        .exec( (err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!record) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        record 
                    })
        })
}
function saveOne (req, res) {
    try{
        
        const params = req.body
       
        const delivery = params.delivery

        if(!delivery.done) {
            
            let del = new Delivery({
                coordinates: delivery.coordinates,
                done: delivery.done,
                order: params.orderId,
                reason: delivery.reason
            })
            del.save((e, deliveryStored) => {
                if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar la entrega', error: e })
                
                return res
                .status(200)
                .send({
                    done: true,
                    message: 'NO ENTREGA INFORMADA CORRECTAMENTE',
                    orderNumber: req.body.orderNumber
                })
            })
        } else {
            const sale = new Sale()
            sale.type = params.typeSale
            sale.paymentMethod = params.paymentMethod
            sale.transaction = params.transaction
            sale.document = params.document
            
            sale.items = params.itemsSale
            sale.retreats = params.retreats
            sale.user = req.user._id
            sale.save((err, stored) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
                if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
    
                if(delivery) {
                    let del = new Delivery({
                        coordinates: delivery.coordinates,
                        done: delivery.done,
                        order: params.orderId,
                        sale: stored._id,
                        reason: delivery.reason
                    })
                    del.save((e, deliveryStored) => {
                        if(e) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar la entrega', error: e })
                        return res
                        .status(200)
                        .send({
                            done: true,
                            message: 'ENTREGA INFORMADA',
                            orderNumber: req.body.orderNumber
                        })
        
                    })
                } 
            })
        }
        //sale.coordinates = params.coordinates
        //sale.done = params.done
        
    }
    catch(error) {
        return res
                .status(500)
                .send({ 
                    done: false, 
                    message: 'Error de sistema', 
                    error: error
                })
                .end()
    }  
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Sale.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    updated 
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Sale.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro eliminado', 
                    deleted 
                })
    })
}
const getOneFromOrder = function (req, res, next) {
    const orderId = req.params.order
    Order.findById(orderId)
        .populate('address')
        .populate('vehicle')
        .populate('device')
        .populate('client')
        .populate('items.productType')
        .populate('user')
        .exec((err, order) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar pedido', code: -1, err })
        if(!order) return res.status(404).send({ done: false, message: 'Orden no existe', code: 1})
        Delivery.findOne({order: orderId}, (err, delivery) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar entrega', code: -1, err })
            if(!delivery) return res.status(404).send({ done: false, message: 'No se ha realizado entrega para el pedido', code: 1})
            if(delivery.sale) {
                Sale
                    .findById(delivery.sale)
                    .populate('items.productType')
                    .exec((err, sale) => {
                        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', code: -1, err})

                        if(!sale) return res.status(404).send({ done: false, message: 'No existe venta asociada a la entrega', code: 1})

                        return res.status(200)
                            .send({
                                done: true,
                                message: 'OK',
                                code: 0,
                                delivery,
                                sale,
                                order
                            })
                    })
            } else {
                return res.status(200)
                        .send({
                            done: true,
                            message: 'OK',
                            code: 0,
                            delivery,
                            order
                            
                        })
            }
        })
    })
}

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne,
    getOneFromOrder
}  