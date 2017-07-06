'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
var Order = require('../models/order')
var OrderItem = require('../models/orderItem')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1

    Order.find()
            .sort([[sidx, sord]])
            .populate('originWarehouse')
            .populate('destinyWarehouse')
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
    Order.findById(id)
        .populate('originWarehouse')
        .populate('destinyWarehouse')
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

    var order = new Order()
    var params = req.body
    order.commitmentDate = moment(params.commitmentDate, "DD-MM-YYYY");
    order.type = params.type
    order.originWarehouse = params.originWarehouse
    order.destinyWarehouse = params.destinyWarehouse
    var items = JSON.parse(req.body.items)
    order.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        var total = items.length
        items.forEach((i) => {
            var orderItem = new OrderItem({
                order: stored._id,
                productType: i.productType,
                quantity: i.quantity
            })
            orderItem.save((errr, orderItemStored) => {
                if(errr) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar item', error: errr })
                stored.items.push(orderItemStored)
                stored.save((errrr, ok) => {
                    if(errrr) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar item', error: errr })
                    total--;
                    if(total == 0)
                    {
                        return res
                            .status(200)
                            .send({ 
                                done: true, 
                                message: 'Registro guardado exitosamente', 
                                stored: stored
                            })
                    }
                })
            }) 
        })
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Order.findByIdAndUpdate(id, update, (err, updated) => {
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
    Order.findByIdAndRemove(id, (err, deleted) => {
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