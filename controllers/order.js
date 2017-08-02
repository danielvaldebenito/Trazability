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
                        $gte: moment(date1), 
                        //$lte: moment(date2)
                    }
                } : {})
            .where(distributor ? { distributor: distributor } : {})
            .sort([[sidx, sord]])
            .populate('originWarehouse')
            .populate('destinyWarehouse')
            .populate('items')
            .populate('distributor')
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
    console.log('guardando pedido', params)
    order.commitmentDate = moment().add(1, 'hour');
    order.type = params.type
    if(params.originWarehouse) {
        order.originWarehouse = params.originWarehouse;
        order.status = 'ASIGNADO';
    }
    order.destinyWarehouse = params.destinyWarehouse
    order.distributor = params.distributor
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
    deleteOne,
    getDayResume
}  
