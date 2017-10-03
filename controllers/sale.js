'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Sale = require('../models/sale')
var SaleItem = require('../models/saleItem')
var Transaction = require('../models/transaction')
var Movement = require('../models/movement')
var MovementItem = require('../models/movementItem')
var Document = require('../models/document')
var Delivery = require('../models/delivery')

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
        
        var params = req.body
       
        var delivery = params.delivery
        console.log('delivery', delivery.done)
        if(!delivery.done) {
            console.log('no entrega!!')
            var del = new Delivery({
                coordinates: delivery.coordinates,
                done: delivery.done,
                order: params.orderId
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
                .end() 

            })
        } else {
            var sale = new Sale()
            sale.type = params.typeSale
            sale.paymentMethod = params.paymentMethod
            sale.transaction = params.transaction
            sale.document = params.document
            
            sale.items = params.itemsSale
            sale.retreats = params.retreats
            sale.save((err, stored) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
                if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
    
                if(delivery) {
                    var del = new Delivery({
                        coordinates: delivery.coordinates,
                        done: delivery.done,
                        order: params.orderId,
                        sale: stored._id
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
                        .end() 
        
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

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne
}  