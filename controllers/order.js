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
var Address = require('../models/address')
var ProductType = require('../models/productType')
var config = require('../config')
function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var state = req.query.state
    var date = req.query.date;
    var splited = date ? date.split('-') : [0,0,0]
    var year = parseInt(splited[0]) 
    var month = parseInt(splited[1])
    var day = parseInt(splited[2])
    var date1 = new Date(year, month - 1, day, 0, 0, 0)
    var date2 = new Date(year, month - 1, day, 23, 59, 59)
    var filter = req.query.filter
    var distributor = req.params.distributor
    
    Order.find(state ? { status: state } : {})
            .where(date ? 
                { 
                    createdAt: {
                        $gte: date1, 
                        $lte: date2
                    }
                } : {})
            .where(distributor ? { distributor: distributor } : {})
            .sort([[sidx, sord]])
            .populate('originWarehouse')
            .populate('destinyWarehouse')
            .populate({path:'items.productType', model: ProductType })
            .populate('distributor')
            .populate('client')
            .populate('address')
            .populate('vehicle')
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
                
                
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

function getAllVehicle (req, res) {
    var vehicle = req.params.vehicle
    Order.find({ vehicle: vehicle })
        .populate({
            path: 'items',
            select: ['-_id'],
            populate: { path: 'productType', select: 'name'}
        })
        .populate({
            path: 'address',
            select: ['_id', 'warehouse', 'location', 'coordinates']
        })
        .populate({
            path: 'client',
            select: ['_id', 'nit', 'name', 'surname', 'fullname', 'discountSurcharges']
        })
        .select(['-__v'])
        .exec((err, records) => {
            if(err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
            if(!records)
                return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
            
            
            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: records,
                        code: 0
                    })
        })  
}

function getDayResume (req, res) {
    var date = req.query.date;
    var splited = date.split('-')
    var year = parseInt(splited[0]) 
    var month = parseInt(splited[1])
    var day = parseInt(splited[2])
    var date1 = new Date(year, month - 1, day, 0, 0, 0)
    var date2 = new Date(year, month - 1, day, 23, 59, 59)
    var dist = req.params.distributor;
    var ObjectId = mongoose.Types.ObjectId
    Order.aggregate([
        {   
            $match: { 
                 distributor:  new ObjectId(dist),
                 createdAt : { $gte: date1, $lte: date2 }
             } 
        },
        {   
            $group : { _id: '$status', count: { $sum: 1 } } 
        }
    ])
    .exec((e, d) => {
        if (e) return res.status(500).send({ done: false, message: 'Error al obtener resumen', error: e, code: -1 })
        if (!d) return res.status(404).send({ done: false, message: 'Error al obtener resumen', code: 1 })
        return res.status(200).send({ done: true, message: 'OK', data: d, code: 0, date1, date2, year, month, day })
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
    order.commitmentDate = moment().add(config.entitiesSettings.order.delayCommitted.value, config.entitiesSettings.order.delayCommitted.time);
    order.type = params.type
    order.client = params.client
    order.address = params.address
    order.vehicle = params.vehicle
    order.phone = params.phone
    order.observation = params.observation
    order.payMethod = params.payMethod
    if(params.originWarehouse) {
        order.originWarehouse = params.originWarehouse;
        order.status = 'ASIGNADO';
    }
    order.destinyWarehouse = params.destinyWarehouse
    order.distributor = params.distributor
    order.items = params.items
    order.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        return res
            .status(200)
            .send({ 
                done: true, 
                message: 'Registro guardado exitosamente', 
                stored: stored
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
function setOrderEnRuta(req, res) {
    var body = req.body
    var orders = body.orders;
    Order.update({ _id: { $in: orders }}, { status: config.entitiesSettings.order.status[2] }, { multi: true })
        .exec((err, raw) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar', error: err, code: -1 })
            return res.status(200)
                        .send({
                            done: true,
                            message: 'OK',
                            raw,
                            code: 0
                        })
        })
}
module.exports = {
    getAll,
    getOne,
    getAllVehicle,
    saveOne,
    updateOne,
    deleteOne,
    getDayResume,
    setOrderEnRuta
}  
