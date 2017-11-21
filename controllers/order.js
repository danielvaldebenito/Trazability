'use strict'

const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const moment = require('moment')
const pushSocket = require('../services/pushSocket')
const pushNotification = require('../services/push')
moment.locale('es')
const Order = require('../models/order')
const Client = require('../models/client')
const OrderItem = require('../models/orderItem')
const Warehouse = require('../models/warehouse')
const Distributor = require('../models/distributor')
const Dependence = require('../models/dependence')
const Address = require('../models/address')
const Vehicle = require('../models/vehicle')
const ProductType = require('../models/productType')
const config = require('../config')
const orderIntegration = require('../integration/connection/order')
const loginIntegration = require('../integration/connection/login')
const Excel = require('exceljs')
const fs = require('fs')
const path = require('path')

function getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || '_id'
    const sord = req.query.sord || 1
    const state = req.query.state
    const date = req.query.date;
    const splited = date ? date.split('-') : [0, 0, 0]
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
        .populate({ path: 'items.productType', model: ProductType })
        .populate('distributor')
        .populate('client')
        .populate('address')
        .populate({ path: 'vehicle', populate: { path: 'user' } })
        .populate({ path: 'device', populate: { path: 'user' } })
        .populate('history.device')
        .populate('history.user')
        .populate('history.oldDevice')
        .paginate(page, limit, (err, records, total) => {
            if (err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err })
            if (!records)
                return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })

            const old = records.length
            if (filter) {
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
                    code: 0,
                    date1,
                    date2
                })
        })
}

function getAllVehicle(req, res) {
    const vehicle = req.params.vehicle
    Order
        .find({
            vehicle: vehicle,
            status: config.entitiesSettings.order.status[1]
        })
        .populate({
            path: 'items',
            select: ['-_id'],
            populate: { path: 'productType', select: 'name' }
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
            if (err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err })
            if (!records)
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

function getAllDevice(req, res) {
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
            populate: { path: 'productType', select: 'name' }
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
            if (err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err })
            if (!records)
                return res.status(404).send({ done: false, code: 1, message: 'Error al obtener los datos' })

            const ids = records.map((r) => { return r._id });
            Order.update({ _id: { $in: ids } }, { vehicle: vehicle }, { multi: true }, (err, raw) => {
                if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar order', code: -1 })

                Order.find({
                    device: device,
                    pendingConfirmCancel: true
                })
                    .exec((err, pendingsConfirmCancel) => {
                        if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar ordenes pendientes', code: -1 })
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

function getDayResume(req, res) {
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
                distributor: new ObjectId(dist),
                createdAt: { $gte: date1, $lte: date2 }
            }
        },
        {
            $group: { _id: '$status', count: { $sum: 1 } }
        }
    ])
        .exec((e, d) => {
            if (e) return res.status(500).send({ done: false, message: 'Error al obtener resumen', error: e, code: -1 })
            if (!d) return res.status(404).send({ done: false, message: 'Error al obtener resumen', code: 1 })
            return res.status(200).send({ done: true, message: 'OK', data: d, code: 0, date1, date2, year, month, day })
        })

}
function getOne(req, res) {
    var id = req.params.id
    Order.findById(id)
        .populate({ path: 'items.productType', model: ProductType })
        .populate('distributor')
        .populate('client')
        .populate('address')
        .populate({ path: 'vehicle', populate: { path: 'user' } })
        .populate({ path: 'device', populate: { path: 'user' } })
        .exec((err, record) => {
            if (err) return res.status(500).send({ done: false, message: 'Error en la petición' })
            if (!record) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro' })

            return res
                .status(200)
                .send({
                    done: true,
                    message: 'OK',
                    record
                })
        })
}
function saveOne(req, res) {

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
    order.destinyWarehouse = params.destinyWarehouse
    order.distributor = params.distributor
    order.items = params.items
    const history = {
        user: req.user.sub,
        userName: `${req.user.name} ${req.user.surname}`,
        device: params.device,
        date: moment(),
        event: config.entitiesSettings.order.eventsHistory[0] // Creación
    }
    let histories = []
    histories.push(history)
    if (params.device) {
        order.status = config.entitiesSettings.order.status[1];
        const history2 = {
            user: req.user.sub,
            userName: `${req.user.name} ${req.user.surname}`,
            device: params.device,
            date: moment(),
            event: config.entitiesSettings.order.eventsHistory[1] // Asignación
        }
        histories.push(history2)
    }
    order.history = histories;
    order.save((err, stored) => {
        if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if (!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })


        Order.findByIdAndUpdate(stored._id,
            { erpId: stored.orderNumber, erpOrderNumber: stored.orderNumber, erpUpdated: false },
            (err, raw) => {

                Order.findById(stored._id)
                    .populate('address')
                    .populate('device')
                    .populate('client')
                    .populate('items.productType')
                    .exec((err, populated) => {
                        if (err) return res.status(500).send({ done: false, message: 'Error al popular orden', err })

                        const loginPromise = loginIntegration.login();
                        loginPromise.then(logued => {
                            orderIntegration.createOrder(populated, logued)
                                .then(result => {
                                    console.log(result)
                                },
                                onrejected => {
                                    console.log('ERROR Integración: ', onrejected)
                                })
                        },
                            onrej => {
                                console.log('Error Integración: ', onrej)
                            });


                        if (params.device) {
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
        if (err) return res.status(500).send({ done: false, message: 'Error en la petición' })
        if (!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro' })

        return res
            .status(200)
            .send({
                done: true,
                message: 'OK',
                updated
            })
    })
}
function deleteOne(req, res) {
    var id = req.params.id
    Order.findByIdAndRemove(id, (err, deleted) => {
        if (err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if (!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })

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
    const userName = req.user.name && req.user.surname ? req.user.name + ' ' + req.user.surname : ''
    const history = {
        user: req.user.sub,
        userName: `${req.user.name} ${req.user.surname}`,
        device: body.device,
        date: moment(),
        event: config.entitiesSettings.order.eventsHistory[2] // En ruta
    }
    Order.update({ _id: { $in: orders } },
        {
            status: config.entitiesSettings.order.status[2],
            device: deviceId,
            userName: userName,
            distributor: distributor._id,
            $push: { history: history }
        },
        { multi: true })
        .exec((err, raw) => {
            if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar', error: err, code: -1 })

            pushSocket.send('orders', distributor._id, 'change-state-order', orders)

            loginIntegration.login()
                .then(sessionId => {
                    Order.find({ _id: { $in: orders } }, (err, o) => {
                        if (o && o.erpUpdated) {
                            orderIntegration.changeState(o, sessionId, config.entitiesSettings.order.statesErp[1]) // notificado al conductor
                                .then(result => console.log(result))
                        }
                    })
                }, onrejected => {
                    console.log('ERROR Integración: ', onrejected)
                })

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
    const reason = req.query.reason || ''
    Order.findById(id,
        (err, found) => {
            if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al buscar orden', err })
            const device = found.device
            const status = found.status
            if (status == config.entitiesSettings.order.status[3])
                return res.status(200)
                    .send({
                        done: false,
                        message: 'La orden no puede ser cancelada, pues ya fue entregado. Actualice el monitor'
                    })
            const history = {
                user: req.user.sub,
                userName: `${req.user.name} ${req.user.surname}`,
                device: found.device,
                date: moment(),
                event: config.entitiesSettings.order.eventsHistory[4] // Cancelación
            }
            const update = {
                status: config.entitiesSettings.order.status[4],
                pendingConfirmCancel: true,
                reasonCancel: reason,
                $push: { history: history }
            }
            Order.update({ _id: id }, update, (err, raw) => {
                if (device) {
                    pushNotification.cancelOrder(device, id, found.orderNumber, 'YES')
                }
                pushSocket.send('orders', found.distributor, 'change-state-order', id)

                loginIntegration.login()
                    .then(sessionId => {
                        orderIntegration.changeState(found, sessionId, config.entitiesSettings.order.statesErp[2], reason) // pedido cancelado
                            .then(result => console.log(result))

                    })
            })
            return res.status(200)
                .send({
                    done: true,
                    message: 'OK',
                    code: 0
                })


        })
}

function confirmCancel(req, res) {
    const id = req.params.id
    const status = config.entitiesSettings.order.status
    Order.findById(id, (err, updated) => {
        if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar orden', err })
        // update
        const history = {
            user: req.user.sub,
            userName: `${req.user.name} ${req.user.surname}`,
            device: updated.device,
            date: moment(),
            event: config.entitiesSettings.order.eventsHistory[5] // Confirmación Cancelación
        }
        const update = { status: status[4], pendingConfirmCancel: false, $push: { history: history } }
        Order.update({ _id: id }, update, (err, raw) => {
            if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar ordenes', err })

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



function assignDeviceToOrder(req, res) {
    const device = req.body.device;
    const order = req.body.order;
    const vehicle = req.body.vehicle;
    const originWarehouse = req.body.originWarehouse
    const old = req.body.old;

    const history = {
        user: req.user.sub,
        userName: `${req.user.name} ${req.user.surname}`,
        device: device,
        oldDevice: old ? old._id : null,
        date: moment(),
        event: old ? config.entitiesSettings.order.eventsHistory[8] : config.entitiesSettings.order.eventsHistory[1]  // Reasignacion / Asignación
    }
    const update = {
        vehicle: vehicle,
        status: config.entitiesSettings.order.status[1],
        device: device,
        originWarehouse: originWarehouse,
        $push: {
            history: history
        }
    }

    Order.findByIdAndUpdate(order, update,
        (err, updated) => {
            if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar orden', err })

            pushNotification.newOrderAssigned(device, order)
            if (old)
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


// MONITOR
function getMonitorData(distributor, type, from, to, filter, page, limit) {
    return new Promise((resolve, reject) => {
        let ObjectId = mongoose.Types.ObjectId
        Order.aggregate([
            { 
                $sort: { 
                    '_id': -1 
                }
            },
            { 
                $match: { 
                    createdAt: { 
                        $gte: from, 
                        $lte: to 
                    },
                    distributor: distributor ? new ObjectId(distributor) : { $ne: null }
                } 
            },
            { 
                $group: { 
                    _id: "$" + type + "", 
                    orders: { 
                        $push: { 
                            orderNumber: '$orderNumber', 
                            status: '$status',
                            createdAt: '$createdAt',
                            type: '$type',
                            _id: '$_id'
                        } 
                    },
                    total: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 1,
                    orders: {
                        $slice: ['$orders', 0, limit]
                    },
                    total: 1
                }
            },
            { 
                $sort: { 
                    '_id': 1 
                }
            }
          ])
            .exec((e, d) => {
                if (e) reject(e.toString())
                if (!d) reject('No se pudo obtener la información')
                if(type == 'vehicle') {
                    Vehicle.populate(d, {path: '_id'}, function(err, pop) {
                        if(filter) {
                            d = d.filter((f) => { return f._id && f._id.licensePlate.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 })
                        }
                        resolve(d)
                    });
                } else {
                    if(filter) {
                        d = d.filter((f) => { return f._id && f._id.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 })
                    }
                    resolve(d)
                }  
            })

    })
}

function getDataMonitorOtherPages(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type
    const id = req.query.id
    const from = req.query.from
    const to = req.query.to
    const fromSplit = from ? from.split('-') : [2017,1,1];
    const toSplit = to ? to.split('-') : null
    const date1 = new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 0, 0, 0)
    const date2 = !toSplit ? new Date() : new Date(parseInt(toSplit[0]), parseInt (toSplit[1]) - 1, parseInt( toSplit[2]), 23, 59, 59)
    if(type == 'vehicle') {
        Order.find()
            .sort([['_id', -1]])
            .where({ 
                vehicle: id, 
                createdAt: { 
                    $gte: date1, 
                    $lte: date2 
                }
            })   
            .populate({ path: 'vehicle', select: ['_id', 'licensePlate']})
            .select(['orderNumber', 'status', 'createdAt', 'type', '_id', 'vehicle'])
            .paginate(page, limit, (err, orders, total) => {
                if(err) return res.status(500).send({ done: false, err })
                return res.status(200).send({ done: true, orders, total })
        })
    } else {
        Order.find()
            .sort([['_id', -1]])
            .where({ userName: id, 
                createdAt: { 
                    $gte: from, 
                    $lte: to 
                } 
            })
            .select(['orderNumber', 'status', 'createdAt', 'type', '_id'])
            .paginate(page, limit, (err, orders, total) => {
                if(err) return res.status(500).send({ done: false, err })
                return res.status(200).send({ orders, total })
            })
    }
}

function getMonitor(req, res) {
    const type = req.query.type || 'vehicle'
    const distributor = req.query.distributor
    const from = req.query.from
    const to = req.query.to
    const fromSplit = from ? from.split('-') : [2017,1,1];
    const toSplit = to ? to.split('-') : null
    const date1 = new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 0, 0, 0)
    const date2 = !toSplit ? new Date() : new Date(parseInt(toSplit[0]), parseInt (toSplit[1]) - 1, parseInt( toSplit[2]), 23, 59, 59)
    const filter = req.query.filter
    const limit = parseInt(req.query.limit) || 5
    const page = parseInt(req.query.page) || 1
    getMonitorData(distributor, type, date1, date2, filter, page, limit)
        .then(data => {
            return res.status(200).send({ done: true, data })
        }, error => {
            return res.status(500).send({ message: 'Error: ' + error })
        })
}
function exportMonitor(req, res) {
    const type = req.query.type || 'vehicle'
    const distributor = req.query.distributor
    const from = req.query.from
    const to = req.query.to
    const fromSplit = from ? from.split('-') : [2017,1,1];
    const toSplit = to ? to.split('-') : null
    const date1 = new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 0, 0, 0)
    const date2 = !toSplit ? new Date() : new Date(parseInt(toSplit[0]), parseInt (toSplit[1]) - 1, parseInt( toSplit[2]), 23, 59, 59)
    const filter = req.query.filter
    const limit = parseInt(req.query.limit) || 50000
    const page = parseInt(req.query.page) || 1
    getMonitorData(distributor, type, date1, date2, filter, page, limit)
        .then(data => {
            console.log('data', data)
            writeFileExcelMonitor(data, type)
                .then(filename => {
                    const filePath = './exports/' + filename
                    fs.exists(filePath, (exists) => {
                        if(exists) {
                            res.sendFile(path.resolve(filePath))
                            setTimeout(function() {
                                fs.unlink(filePath, (err) => {
                                    if(err)
                                        console.log(err)
                                    console.log('deleted', filePath)
                                })
                            }, 60000);
                        } else {
                            res.status(400).send({message: 'Archivo no disponible'})
                        }
                    })
                }, rej => {
                    res.status(500).send({ error: rej.toString()})
                })

        }, error => {
            res.status(500).send({ error: error.toString()})
        })
}


function writeFileExcelMonitor(data, type) {
    return new Promise((resolve, reject) => {
        let workbook = new Excel.Workbook()
        workbook.creator = 'Unigas'
        workbook.created = new Date()
        workbook.views = [
            {
              x: 0, y: 0, width: 10000, height: 20000, 
              firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
          ]
        let worksheetName = 'Pedidos'
        let worksheet = workbook.addWorksheet(worksheetName)
        let key = type == 'vehicle' ? 'VEHÍCULO' : 'USUARIO'
        worksheet.autoFilter = 'A1:D1';
        worksheet.columns = [
            { header: key, key: 'key', width: 20 },
            { header: 'Número', key: 'orderNumber', width: 10 },
            { header: 'Estado', key: 'status', width: 20 },
            { header: 'Fecha', key: 'createdAt', width: 20 }
        ];
        
        let rows = []
        //const colorAsStatus = ['FF0000FF','FF0000FF','','','']
        data.map((s) => { 
            let head = type == 'vehicle' ? s._id ? s._id.licensePlate : 'Desconocido' : s._id || 'Desconocido'
            let orders = s.orders;
            let lastRow = worksheet.lastRow;
            let newRowNumber = lastRow.number + 1
            let border = {style:'medium', color: {argb:'00000000'}}
            worksheet.mergeCells('A' + newRowNumber + ':A' + (newRowNumber + orders.length - 1));
            worksheet.getCell('A' + newRowNumber).value = head;
            worksheet.getCell('A' + newRowNumber).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
            orders.map((o, i) => {
                worksheet.getCell('B' + (newRowNumber + i)).value = o.orderNumber;
                worksheet.getCell('C' + (newRowNumber + i)).value = o.status;
                worksheet.getCell('D' + (newRowNumber + i)).value = moment(o.createdAt).format("DD-MM-YYYY HH:mm:ss");
                
                worksheet.getCell('B' + (newRowNumber + i)).border = {
                    top: i == 0 ? border : null,
                    bottom: i == orders.length - 1 ? border : null,
                    left: border,
                    right: border
                }
                worksheet.getCell('B' + (newRowNumber + i)).alignment = { horizontal: 'center' }
                worksheet.getCell('C' + (newRowNumber + i)).border = {
                    top: i == 0 ? border : null,
                    bottom: i == orders.length - 1 ? border : null,
                    left: border,
                    right: border
                }
                worksheet.getCell('D' + (newRowNumber + i)).border = {
                    top: i == 0 ? border : null,
                    bottom: i == orders.length - 1 ? border : null,
                    left: border,
                    right: border
                }
                
            })
            worksheet.getCell('A' + newRowNumber).border = { 
                top: border,
                left: border,
                bottom: border,
                right: border
            }
            
            worksheet.getRow(newRowNumber + orders.length - 1).commit();
        })
        //worksheet.addRows(rows);

        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
            row.font = { name: 'Arial', family: 4, size: 11 }
        })
        
        const random = Math.random().toString(36).slice(2);
        let filename = `EXPORT_${random}.xlsx`;
        workbook.xlsx.writeFile(`exports/` + filename)
            .then(() => {
                resolve(filename)
            });
    })
}
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
    confirmCancel,
    getMonitor,
    getDataMonitorOtherPages,
    exportMonitor
}  
