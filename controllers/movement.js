'use strict'

const config = require('../config')
const Truckload = require('../models/truckload')
const Truckunload = require('../models/truckunload')
const Maintenance = require('../models/maintenance')
function OKMovement (req, res) {

    console.log('movimiento', req.body)
    const tt = req.body.transactionType
    const types = config.entitiesSettings.transaction.types
    const promise = tt == types[4] // CARGA
        ? saveTruckload(req.body)
        : tt == types[5]
            ? saveTruckunload(req.body)
            : tt == types[3] // MANTENCION
                ? saveMaintenance(req.body)
                    : responseNormal()
    
    promise
        .then(resolve => {
            return res.status(200).send({ done: true, code: 0, message: 'Transacción realizada correctamente'})
        }, onreject => {
            return res.status(500).send({ done: false, code: 0, message: 'Ha ocurrido un error', err: onreject})
        })
}
function responseNormal() {
    return new Promise((resolve, reject) => {
        resolve()
    })
}
function saveTruckload(params) {
    return new Promise((resolve, reject) => {
        let truckload = new Truckload ({
            transaction: params.transaction,
            originWarehouse: params.originWarehouse,
            destinyWarehouse: params.destinyWarehouse,
            document: params.document
        })
        truckload.save((err, tl) => {
            if(err) reject(err)
            resolve(tl)
        })
    })
}
function saveTruckunload(params) {
    return new Promise((resolve, reject) => {
        let truckunload = new Truckunload ({
            transaction: params.transaction,
            originWarehouse: params.originWarehouse,
            destinyWarehouse: params.destinyWarehouse,
            document: params.document
        })
        truckunload.save((err, tl) => {
            if(err) reject(err)
            resolve(tl)
        })
    })
}
function saveMaintenance(params) {
    return new Promise((resolve, reject) => {
        let maintenance = new Maintenance ({
            reason: params.reason,
            transaction: params.transaction,
            originWarehouse: params.originWarehouse,
            destinyWarehouse: params.destinyWarehouse,
            document: params.document
        })
        maintenance.save((err, tl) => {
            if(err) reject(err)
            resolve(tl)
        })
    })
}
module.exports = { OKMovement }