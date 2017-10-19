'use strict'

const path = require('path')
const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const moment = require('moment')
const pushSocket = require('../services/pushSocket')
const pushNotification = require('../services/push')
moment.locale('es')
const Order = require('../models/order')
const OrderItem = require('../models/orderItem')
const Warehouse = require('../models/warehouse')
const Distributor = require('../models/distributor')
const Dependence = require('../models/dependence')
const Address = require('../models/address')
const ProductType = require('../models/productType')
const config = require('../config')
const orderIntegration = require('../integration/connection/order')
const loginIntegration = require('../integration/connection/login')
function getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || '_id'
    const sord = req.query.sord || 1
    const state = req.query.state
    const date = req.query.date;
    const splited = date ? date.split('-') : [0,0,0]
    const year = parseInt(splited[0]) 
    const month = parseInt(splited[1])
    const day = parseInt(splited[2])
    const date1 = new Date(year, month - 1, day, 0, 0, 0)
    const date2 = new Date(year, month - 1, day, 23, 59, 59)
    const filter = req.query.filter
    const distributor = req.params.distributor
    
    Order.find(state ? { status: state } : {})
            .where(date ? 
                { 
                    createdAt: {
                        $gte: date1, 
                        $lte: date2
                    }
                } : {})
            .where(distributor ? { distributor: distributor } : {})
            .sort([['orderNumber', 1]])
            //.populate('originWarehouse')
            //.populate('destinyWarehouse')
            .populate({path:'items.productType', model: ProductType })
            .populate('distributor')
            .populate('client')
            .populate('address')
            .populate({ path: 'vehicle', populate: { path: 'user'}})
            .populate({ path: 'device', populate: { path: 'user'}})
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
                
                const old = records.length
                if(filter){
                    records = records.filter((record) => {
                        return record.address.location.toLowerCase().indexOf(filter.toLowerCase()) > -1
                            || (record.client && record.client.fullname.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                            || (record.vehicle && record.vehicle.licensePlate.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                    })
                }
                total = total - (old - records.length)
                
                
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
    const vehicle = req.params.vehicle
    Order
        .find({ 
            vehicle: vehicle, 
            status: config.entitiesSettings.order.status[1]
        })
        .populate({
            path: 'items',
            select: ['-_id'],
            populate: { path: 'productType', select: 'name'}
        })
        .populate({
            path: 'address',
            select: ['_id', 'warehouse', 'location', 'city', 'region', 'coordinates']
        })
        .populate({
            path: 'client',
            select: ['_id', 'nit', 'name', 'surname', 'fullname', 'discountSurcharges', 'phone', 'addresses', 'city', 'region']
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

function getAllDevice (req, res) {
    const device = req.params.device
    const vehicle = req.params.vehicle
    const status = config.entitiesSettings.order.status
    const statusToSend = [status[1], status[2]]
    Order
        .find({ 
            device: device, 
            status: { $in: statusToSend }
        })
        .populate({
            path: 'items',
            select: ['-_id'],
            populate: { path: 'productType', select: 'name'}
        })
        .populate({
            path: 'address',
            select: ['_id', 'warehouse', 'location', 'city', 'region', 'coordinates']
        })
        .populate({
            path: 'client',
            select: ['_id', 'nit', 'name', 'surname', 'fullname', 'discountSurcharges', 'phone', 'addresses', 'city', 'region']
        })
        .select(['-__v'])
        .exec((err, records) => {
            if(err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
            if(!records)
                return res.status(404).send({ done: false, code: 1, message: 'Error al obtener los datos' })
            
            const ids = records.map((r) => { return r._id });
            Order.update({ _id: { $in: ids } }, { vehicle: vehicle }, { multi: true },(err, raw) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar order', code: -1})

                Order.find({ 
                    device: device, 
                    pendingConfirmCancel: true
                 })
                 .exec((err, pendingsConfirmCancel) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar ordenes pendientes', code: -1})
                    return res
                        .status(200)
                        .send({ 
                            done: true, 
                            message: 'OK', 
                            data: records,
                            code: 0,
                            pendingsConfirmCancel
                        })
                 })

                
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
            .populate({path:'items.productType', model: ProductType })
            .populate('distributor')
            .populate('client')
            .populate('address')
            .populate({ path: 'vehicle', populate: { path: 'user'}})
            .populate({ path: 'device', populate: { path: 'user'}})
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
    order.device = params.device
    order.vehicle = params.vehicle
    order.phone = params.phone
    order.observation = params.observation
    order.payMethod = params.payMethod
    order.originWarehouse = params.originWarehouse;
    if(params.device) {
        order.status = config.entitiesSettings.order.status[1];
    }
    order.destinyWarehouse = params.destinyWarehouse
    order.distributor = params.distributor
    order.items = params.items
    order.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        Order.findByIdAndUpdate(stored._id, 
            { erpId: stored.orderNumber, erpOrderNumber: stored.orderNumber, erpUpdated: false  },
            (err, raw) => {

                /**
                 * TODO: ERP INTEGRATION: Informar pedido a SalesForce
                 */
                Order.findById(stored._id)
                    .populate('address')
                    .populate('device')
                    .populate('client')
                    .populate('items.productType')
                    .exec((err, populated) => {
                        if(err) return res.status(500).send({ done: false, message: 'Error al popular orden', err})

                        const loginPromise = loginIntegration.login();
                        loginPromise.then(logued => {
                            orderIntegration.createOrder(populated, logued)
                                .then(result => {
                                    console.log(result)
                                })
                        });
                        
                        
                        if(params.device){
                            pushNotification.newOrderAssigned(params.device, stored._id)
                        }
                        
                        pushSocket.send('orders', params.distributor, 'new-order', stored._id)
                        return res
                            .status(200)
                            .send({
                                done: true,
                                message: 'Registro guardado exitosamente',
                                stored: stored
                            })
                    })
                
            }
        )
        
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
    const body = req.body
    const deviceId = req.body.device
    const orders = body.orders
    const user = req.user
    const distributor = req.user.distributor
    const userName = req.user.name && req.user.surname ? req.user.name + ' ' +  req.user.surname : ''
    
    Order.update({ _id: { $in: orders }}, 
        { status: config.entitiesSettings.order.status[2], device: deviceId, userName: userName }, 
        { multi: true })
        .exec((err, raw) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar', error: err, code: -1 })
            
            pushSocket.send('orders', distributor._id, 'change-state-order', orders)
            return res.status(200)
                        .send({
                            done: true,
                            message: 'OK',
                            raw,
                            code: 0
                        })
        })
}
function cancelOrder(req, res) {
    const id = req.params.id
    
    Order.findById(id, 
        (err, found) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al buscar orden', err})
            const device = found.device
            const status = found.status
            if(status == config.entitiesSettings.order.status[3])
                return res.status(200)
                        .send({
                            done: false,
                            message: 'La orden no puede ser cancelada, pues ya fue entregado. Actualice el monitor'
                        })
            const update = { status: config.entitiesSettings.order.status[4], pendingConfirmCancel: true }
            Order.update({ _id: id}, update, (err, raw) => {
                if(device) {
                    pushNotification.cancelOrder(device, id, found.orderNumber, 'YES')
                }
                pushSocket.send('orders', found.distributor, 'change-state-order', id)
                return res.status(200)
                    .send({
                        done: true,
                        message: 'OK',
                        code: 0
                    })
            })
            
    })
}

function confirmCancel (req, res) {
    const id = req.params.id
    const status = config.entitiesSettings.order.status
    Order.findById(id, (err, updated) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar orden', err})
        // update
        const update = { status: status[4], pendingConfirmCancel: false }
        Order.update({_id: id}, update, (err, raw) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar ordenes', err})
      
            pushSocket.send('orders', updated.distributor, 'change-state-order', id)
            return res.status(200)
                .send({
                    done: true,
                    message: 'OK',
                    code: 0
                })
        })
    })
}



function assignDeviceToOrder (req, res) {
    const device = req.body.device;
    const order = req.body.order;
    const vehicle = req.body.vehicle;
    const originWarehouse = req.body.originWarehouse
    const old = req.body.old;
    const update = {
        vehicle: vehicle, 
        status: config.entitiesSettings.order.status[1],
        device: device,
        originWarehouse: originWarehouse
    }
    Order.findByIdAndUpdate(order, update,
    (err, updated) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar orden', err})

        pushNotification.newOrderAssigned(device, order)      
        if(old)
            pushNotification.cancelOrder(old._id, order, updated.orderNumber, 'NO')

        pushSocket.send('orders', updated.distributor, 'new-order', updated._id)
        return res.status(200)
                .send({
                    done: true,
                    message: 'Vehículo asignado correctamente',
                    updated
                })
    })
            
}

// function reassignDeviceToOrder (req, res) {
//     const device = req.body.device;
//     const order = req.body.order;
//     const vehicle = req.body.vehicle;
//     const originWarehouse = req.body.originWarehouse
//     const old = req.body.old;
//     const update = {
//         pendingConfirmReassign: true,
//         pendingDeviceReassign: device,
//         pendingVehicleReassign: vehicle,
//         pendingOWReassign: originWarehouse
//     }
//     Order.findByIdAndUpdate(order, update,
//     (err, updated) => {
//         if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar orden', err})

//         pushNotification.cancelOrder(old._id, order, updated.orderNumber, 'NO')
//         pushSocket.send('/orders', updated.distributor, 'change-state-order', updated._id)
        
//         return res.status(200)
//                 .send({
//                     done: true,
//                     message: 'Vehículo reasignado correctamente. Pendiente de confirmación.',
//                     updated
//                 })
//     })
            
// }


module.exports = {
    getAll,
    getOne,
    getAllVehicle,
    getAllDevice,
    saveOne,
    updateOne,
    assignDeviceToOrder,
    // reassignDeviceToOrder,
    deleteOne,
    getDayResume,
    setOrderEnRuta,
    cancelOrder,
    confirmCancel
}  
