'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
moment.locale('es')
var Order = require('../models/order')
var OrderItem = require('../models/orderItem')
var Warehouse = require('../models/warehouse')
var Distributor = require('../models/distributor')
var Dependence = require('../models/dependence')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var state = req.query.state
    var date = req.query.date;
    var date1 = !date ? '': date + 'T00:00:00.000Z'
    var date2 = !date ? '' : date + 'T23:59:59.999Z'
    var filter = req.query.filter
    var distributor = req.params.distributor
    
    Order.find(state ? { status: state } : {})
            .where(date ? 
                { 
                    createdAt: {
                        "$gte": moment(date1), 
                        "$lt": moment(date2)
                    }
                } : {})
            .sort([[sidx, sord]])
            .populate(
            {
                path: 'originWarehouse',
                model: Warehouse,
                match: { 'dependence': { $ne: null } },
                populate: {
                    path: 'dependence',
                    populate: {
                        path: 'distributor',
                        match: {
                            '_id': distributor
                        }
                    }
                }
            })
            .populate('destinyWarehouse')
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
                
                if(filter)
                    records = records.filter(r => { 
                        return r.originWarehouse.name.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 
                            || r.destinyWarehouse.name.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 
                    })
                return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: records, 
                        total: total,
                        code: 0
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
