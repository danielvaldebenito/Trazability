'use strict'

const Transaction = require('../models/transaction')
const Sale = require('../models/sale')
const Maintenance = require('../models/maintenance')
const Truckload = require('../models/truckload')
const Truckunload = require('../models/truckunload')
const Transfer = require('../models/transfer')
const Vehicle = require('../models/vehicle')
const Delivery = require('../models/delivery')
const Order = require('../models/order')
function getOne (req, res) {
    const id = req.params.id
    Transaction.findById(id)
        .populate({
            path: 'movements',
            populate: {
                path: 'items',
                populate: {
                    path: 'product'
                }
            },
            populate: {
                path: 'warehouse'
            }
        })
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error de sistema', code: -1, err})
            if(!record) return res.status(404).send({ done: false, code: 1, message: 'No se encontró registro'})
            return res.status(200)
                    .send({
                        done: true,
                        message: 'OK',
                        data: record,
                        code: 0
                    })
        })
}
function getSaleByTransaction (req, res) {
    const transaction = req.params.transaction
    Sale.findOne({ transaction: transaction })
        .populate('items.productType')
        .populate('retreats.productType')
        .exec((err, sale) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
            if(!sale) return res.status(404).send({ done: false, message: 'No se ha encontrado venta asociada'})
            
            Delivery.findOne({ sale: sale._id}, (err, delivery) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
                if(delivery) {
                    Order.findById(delivery.order, (err, order) => {
                        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
                        return res.status(200)
                        .send({
                            done: true,
                            message: 'OK',
                            data: { sale, delivery, order }
                        })
                    })
                } else {
                    return res.status(200)
                    .send({
                        done: true,
                        message: 'OK',
                        data: { sale }
                    })
                }
                
            })
            
        })

}
function getMaintenanceByTransaction (req, res) {
    const transaction = req.params.transaction
    Maintenance
    .findOne({ transaction: transaction })
    .populate([
        { path: 'originWarehouse'},
        { path: 'destinyWarehouse'},
        { path: 'document'}
    ])
    .exec((err, maintenance) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
        if(!maintenance) return res.status(404).send({ done: false, message: 'No se ha encontrado mantención asociada'})
        return res.status(200)
            .send({
                done: true,
                message: 'OK',
                data: maintenance
            })
    })

}
function getTruckloadByTransaction (req, res) {
    const transaction = req.params.transaction
    Truckload
    .findOne({ transaction: transaction })
    .populate([
        { 
            path: 'destinyWarehouse',
            populate: {
                path: 'dependence'
            } 
        }, {
            path: 'originWarehouse',
            populate: {
                path: 'dependence'
            }
        }, 'document'])
    .exec((err, truckload) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
        if(!truckload) return res.status(404).send({ done: false, message: 'No se ha encontrado carga asociada'})
        
        Vehicle.findOne({ warehouse: truckload.destinyWarehouse._id}, (err, vehicle) => {
            if(err)return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehiculo', err})
            return res.status(200)
            .send({
                done: true,
                message: 'OK',
                data: { vehicle, truckload }
            })
        })
        
        
    })

}
function getTruckunloadByTransaction (req, res) {
    const transaction = req.params.transaction
    Truckunload
    .findOne({ transaction: transaction })
    .populate([
        { 
            path: 'destinyWarehouse',
            populate: {
                path: 'dependence'
            } 
        }, {
            path: 'originWarehouse',
            populate: {
                path: 'dependence'
            }
        }, 'document'])
    .exec((err, truckunload) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
        if(!truckunload) return res.status(404).send({ done: false, message: 'No se ha encontrado descarga asociada'})
        const warehouse = truckunload.originWarehouse ? truckunload.originWarehouse._id : null
        if(warehouse) {
            Vehicle.findOne({ warehouse: warehouse}, (err, vehicle) => {
                if(err)return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehiculo', err})
                return res.status(200)
                .send({
                    done: true,
                    message: 'OK',
                    data: {vehicle, truckunload}
                })
            })
        } else {
            return res.status(200)
            .send({
                done: true,
                message: 'OK',
                data: { truckunload }
            })
        }
        
        
    })

}

function getTransferByTransaction (req, res) {
    const transaction = req.params.transaction

    Transfer
    .findOne({ transaction: transaction })
    .populate('originDependence')
    .exec((err, transfer) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
        if(!transfer) return res.status(404).send({ done: false, message: 'No se ha encontrado transferencia asociada'})
        return res.status(200)
            .send({
                done: true,
                message: 'OK',
                data: transfer
            })
    })

}
function getStationByTransaction (req, res) {
    const transaction = req.params.transaction
    Transfer
    .findOne({ 'stations.transaction': transaction })
    .populate('stations.destinyDependence')
    .exec((err, transfer) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
        if(!transfer) return res.status(404).send({ done: false, message: 'No se ha encontrado transferencias con una estación asociada'})
        
        const station = transfer.stations.filter((s) => { return s.transaction == transaction})
        if(!station) return res.status(404).send({ done: false, message: 'No se encontró estación asociada'})
        return res.status(200)
            .send({
                done: true,
                message: 'OK',
                data: station[0]
            })
    })

}
function fixDiplicatedTransactions(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 500
    Transaction.find()
        .populate({
            path: 'movements',
            populate: {
                path: 'items',
                populate: {
                    path: 'product'
                }
            }
        })
        .paginate(page, limit, (err, transactions, total) => {
            if(err) return res.status(500).send({ done: false, err })
            let count = limit;
            transactions.forEach((transaction, t) => {
                const movements = transaction.movements
                let products = []
                if(!movements || !movements.length || movements.length == 0)
                    products = []
                else  {
                    movements.map(movement => {
                        const items = movement.items
                        items.map((i) => { if(i.product) products.push(i.product._id)  });
                        
                    })
                }
                Transaction.find({ _id: { $ne: transaction._id }, user: transaction.user, document: transaction.document, device: transaction.device, type: transaction.type })
                    .populate({
                        path: 'movements',
                        populate: {
                            path: 'items',
                            populate: {
                                path: 'product'
                            }
                        }
                    })
                    .exec((err, similarsTransactions) => {
                        if(err) return res.status(500).send({ done: false, err })
                        if(similarsTransactions && similarsTransactions.length && similarsTransactions.length > 0) {
                            similarsTransactions.forEach(sTransaction => {
                                const sMovements = sTransaction.movements
                                let sProducts = []
                                if(!sMovements || !sMovements.length || sMovements.length == 0)
                                    sProducts = []
                                else {
                                    sMovements.map(sMovement => {
                                        const sItems = sMovement.items
                                        sItems.map((i) => { if(i.product) sProducts.push (i.product._id) });
                                        
                                    })
                                }
                                
                                if(arraysEqual(products, sProducts)) {
                                    console.log('Se debe eliminar transaccion ' + sTransaction._id + ' porque es igual a la transaccion ' + transaction._id)
                                } 
                                
                            })
                            count--;
                            console.log('Analizando similares ' + (limit - count) + ' de ' + limit)
                            if(count == 0)
                                return res.status(200).send({ message: 'OK' })
                        } else {
                            count--;
                            console.log('Analizando ' + (limit - count) + ' de ' + limit)
                            if(count == 0)
                                return res.status(200).send({ message: 'OK' })
                        }
                        
                    })
                    
            })    
        })
}
function arraysEqual(arr1, arr2) {
    if (arr1.length == arr2.length
        && arr1.every(function(u, i) {
            return u === arr2[i];
        })
    ) {
        return true;
    } else {
        return false;
    }
    
  }

module.exports = { 
    getOne,
    getMaintenanceByTransaction,
    getSaleByTransaction,
    getStationByTransaction,
    getTransferByTransaction,
    getTruckloadByTransaction,
    getTruckunloadByTransaction,
    fixDiplicatedTransactions
}