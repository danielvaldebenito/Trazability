'use strict'

const config = require('../config')
const Truckload = require('../models/truckload')
const Truckunload = require('../models/truckunload')
const Maintenance = require('../models/maintenance')
const Movement = require('../models/movement')
const Transaction = require('../models/transaction')
const moment = require('moment')
const Excel = require('exceljs')
const fs = require('fs')
const path = require('path')
const Enumerable = require('linq')
const datesService = require('../services/dates')
function getData(limit, page, type, from, to, filter) {

    return new Promise((resolve, reject) => {
        Transaction
        .find({ 
            type: type,
            createdAt: {
                $gte: from,
                $lte: to
            }
        })
        .populate([{
            path: 'movements',
            populate: [{
                path: 'items',
                populate: {
                    path: 'product',
                    populate: {
                        path: 'productType'
                    }
                }
            },
            {
                path: 'warehouse',
                populate: {
                    path: 'dependence'
                }
            }]
            }, 
            {
                path: 'device'
            }, 
            {
                path: 'user'
            },
            {
                path: 'document'
            }
        ])
        .sort([['createdAt', -1]])
        .paginate(page, limit, (err, records, total) => {
            if(err) reject(err)

            if(filter) {
                let length = records.length
                records = records.filter((f) => { 
                    return (f.device && f.device.pos && f.device.pos.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1) 
                    || (f.user && (f.user.name + ' ' + f.user.surname).toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1 )
                })
                total = total - (length - records.length)
            }
            
            resolve({records, total })
        })
    })
}
function getDataTruckload (from, to, filter) {
    return new Promise((resolve, reject) => {
        Truckload.find({ createdAt: { $gte: from, $lte: to } })
        .populate({
            path: 'transaction',
            populate: [{
                path: 'movements',
                populate: [{ 
                    path: 'items',
                    populate: {
                        path: 'product',
                        populate: {
                            path: 'productType'
                        }
                    }
                },{
                    path: 'warehouse'
                }]
            }, {
                path: 'document'
            }, {
                path: 'user'
            }, {
                path: 'device'
            }]
        })
        .sort([['createdAt', -1]])
        .exec ( ( err, data ) => {
            if(err) reject(err)
            if(filter) {
                data = data.filter((f) => { 
                    return (f.transaction.device && f.transaction.device.pos && f.transaction.device.pos.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1) 
                    || (f.transaction.user && (f.transaction.user.name + ' ' + f.transaction.user.surname).toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1 )
                })
                
            }
            resolve(data)
        })
    })
}
function getDataTruckunload (from, to, filter) {
    return new Promise((resolve, reject) => {
        Truckunload.find({ createdAt: { $gte: from, $lte: to } })
        .populate({
            path: 'transaction',
            populate: [{
                path: 'movements',
                populate: [{ 
                    path: 'items',
                    populate: {
                        path: 'product',
                        populate: {
                            path: 'productType'
                        }
                    }
                },{
                    path: 'warehouse'
                }]
            },{
                path: 'document'
            }, {
                path: 'user'
            }, {
                path: 'device'
            }]

        })
        .sort([['createdAt', -1]])
        .exec ( ( err, data ) => {
            if(err) reject(err)
            if(filter) {
                data = data.filter((f) => { 
                    return (f.transaction.device && f.transaction.device.pos && f.transaction.device.pos.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1) 
                    || (f.transaction.user && (f.transaction.user.name + ' ' + f.transaction.user.surname).toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1 )
                })
                
            }
            resolve(data)
        })
    })
    
}

function getDataMaintenance (from, to, filter) {
    return new Promise((resolve, reject) => {
        Maintenance.find({ createdAt: { $gte: from, $lte: to } })
        .populate([{
            path: 'transaction',
            populate: [{
                path: 'movements',
                populate: [{ 
                    path: 'items',
                    populate: {
                        path: 'product',
                        populate: {
                            path: 'productType'
                        }
                    }
                },{
                    path: 'warehouse'
                }]
            },{
                path: 'document'
            }, {
                path: 'user'
            }, {
                path: 'device'
            }]

        },{
            path: 'originWarehouse'
        },{
            path: 'destinyWarehouse'
        }])
        .sort([['createdAt', -1]])
        .exec ( ( err, data ) => {
            if(err) reject(err)
            if(filter) {
                data = data.filter((f) => { 
                    return (f.transaction.device && f.transaction.device.pos && f.transaction.device.pos.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1) 
                    || (f.transaction.user && (f.transaction.user.name + ' ' + f.transaction.user.surname).toString().toLowerCase().indexOf(filter.toString().toLowerCase()) > -1 )
                })
                
            }
            resolve(data)
        })
    })
    
}


function getAll (req, res) {
    const distributor = req.query.distributor
    const limit = parseInt(req.query.limit) || 200
    const page = parseInt(req.query.page) || 1
    const type = req.query.type
    const from = !req.query.from || req.query.from == 'null' ? moment().add(-10, 'days') : req.query.from
    const to = !req.query.to || req.query.to == 'null' ? from + ' 23:59:59' : req.query.to + ' 23:59:59'
    const filter = req.query.filter
    getData(limit, page, type, from, to, filter)
        .then(
            resolved => {
                return res.status(200)
                    .send({
                        done: true, 
                        message: 'OK',
                        records: resolved.records,
                        total: resolved.total
                    })
            },
            rejected => {
                return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err: rejected })
            })
}
function OKMovement (req, res) {

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
function exportTransaction(req, res) {
    const distributor = req.query.distributor
    const limit = parseInt(req.query.limit) || 200000
    const page = parseInt(req.query.page) || 1
    const type = req.query.type
    const from = req.query.from
    const to = req.query.to
    const filter = req.query.filter
    const dates = datesService.convertDateRange([from, to], 'YYYY-MM-DD')

    let promise = type == 'CARGA' ? getDataTruckload(dates[0] , dates[1], filter) 
                    : type == 'DESCARGA' ? getDataTruckunload(dates[0], dates[1], filter)
                        : type == 'MANTENCIÓN' ? getDataMaintenance(dates[0], dates[1], filter)
                            : null;
    if(!promise) return;
    
    promise
        .then(
            resolved => {
                let promise2 = type == 'CARGA' || type == 'DESCARGA' ? writeFileExcel(type, resolved) : writeFileExcelMaintenance(resolved)
                promise2
                    .then(filename => {
                        console.log('filename', filename)
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
                    }, error => res.status(500).send({message: 'Ha ocurrido un error', error: error})
                    )
                    .catch(reason => console.log('reason', reason))
            },
            rejected => {
                return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err: rejected })
            })
    
    
}
function writeFileExcel(type, data) {
    console.log('resolved', data.length);
    return new Promise((resolve, reject) => {
        try 
        {
            let workbook = new Excel.Workbook()
            workbook.creator = 'Unigas'
            workbook.created = new Date()
            workbook.views = [
                {
                  x: 0, y: 0, width: 10000, height: 200000, 
                  firstSheet: 0, activeTab: 1, visibility: 'visible'
                }
              ]
            let worksheet = workbook.addWorksheet(type)
            worksheet.autoFilter = 'A1:H1';
            worksheet.columns = [
                { header: 'Tipo', key: 'type', width: 15 },
                { header: 'Fecha', key: 'date', width: 15 },
                { header: 'Vehículo', key: 'vehicle', width: 15 },
                { header: 'TCO', key: 'tco', width: 15 },
                { header: 'NIF', key: 'nif', width: 20 },
                { header: 'Capacidad', key: 'productType', width: 15 },
                { header: 'POS', key: 'pos', width: 15 },
                { header: 'Usuario', key: 'user', width: 15 }
            ];
            let transactions = data.map(t => { return t.transaction });
            let items = []
            transactions.map((transaction, t) => {
                let movements = transaction.movements;
                movements.map((movement, m) => {
                    let movementType = type == 'CARGA' ? 'E' : 'S'
                    if(movement.type == movementType) {
                        let i = movement.items
                        i.map((it, i) => {
                            
                            let item = {
                                vehicle: movement.warehouse.name,
                                tco: transaction.document ? transaction.document.folio : '',
                                nif: it.product ? it.product.formatted || it.product.nif : '',
                                productType: it.product && it.product.productType ? it.product.productType.capacity : '',
                                date: transaction.createdAt,
                                pos: transaction.device ? transaction.device.pos : '',
                                user: transaction.user ? transaction.user.name + ' ' + transaction.user.surname : ''
                            }
                            items.push(item);
                        })
                    }
                    
                })
            });

            let rows = items.map((i) => { 
                return { 
                    type: type,
                    date: i.date,
                    vehicle: i.vehicle,
                    tco: i.tco,
                    nif: i.nif,
                    productType: i.productType,
                    user: i.user,
                    pos: i.pos
                } 
            })

            worksheet.addRows(rows);
    
            worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
                row.font = { name: 'Arial', family: 4, size: 10 }
            })
            const random = Math.random().toString(36).slice(2);
            let filename = `EXPORT_${random}.xlsx`;
            console.log('try saving', filename)
            workbook.xlsx.writeFile(`exports/` + filename)
                .then(() => {
                    console.log('saved!', filename)
                    resolve(filename)
                }, rej => {
                    reject('No se pudo guardar el archivo')
                });
        }
        catch (e) {
            reject('error' + e)
        }
        
    })
}

function writeFileExcelMaintenance(data) {
    return new Promise((resolve, reject) => {
        try 
        {
            let workbook = new Excel.Workbook()
            workbook.creator = 'Unigas'
            workbook.created = new Date()
            workbook.views = [
                {
                  x: 0, y: 0, width: 10000, height: 200000, 
                  firstSheet: 0, activeTab: 1, visibility: 'visible'
                }
              ]
            let worksheet = workbook.addWorksheet('MANTENCIÓN')
            worksheet.autoFilter = 'A1:H1';
            worksheet.columns = [
                { header: 'Fecha', key: 'date', width: 15 },
                { header: 'Origen', key: 'origin', width: 20 },
                { header: 'Destino', key: 'destination', width: 20 },
                { header: 'Motivo', key: 'reason', width: 25 },
                { header: 'TCO', key: 'tco', width: 15 },
                { header: 'NIF', key: 'nif', width: 20 },
                { header: 'Capacidad', key: 'productType', width: 15 },
                { header: 'POS', key: 'pos', width: 15 },
                { header: 'Usuario', key: 'user', width: 15 }
            ];
            let maintenances = data.map(m => { return m })
            //let transactions = data.map(t => { return t.transaction });
            let items = []
            maintenances.map((maintenance, m) => {
                let movements = maintenance.transaction.movements;
                console.log('maintenance', maintenance)
                movements.map((movement, m) => {
                    let movementType = 'S'
                    if(movement.type == movementType) {
                        let i = movement.items
                        i.map((it, i) => {
                            
                            let item = {
                                origin: maintenance.originWarehouse.name,
                                destination: maintenance.destinyWarehouse.name,
                                reason: maintenance.reason,
                                tco: maintenance.transaction.document ? maintenance.transaction.document.folio : '',
                                nif: it.product ? it.product.formatted || it.product.nif : '',
                                productType: it.product && it.product.productType ? it.product.productType.capacity : '',
                                date: maintenance.transaction.createdAt,
                                pos: maintenance.transaction.device ? maintenance.transaction.device.pos : '',
                                user: maintenance.transaction.user ? maintenance.transaction.user.name + ' ' + maintenance.transaction.user.surname : ''
                            }
                            items.push(item);
                        })
                    }
                    
                })
            });

            let rows = items.map((i) => { 
                return { 
                    origin: i.origin,
                    destination: i.destination,
                    reason: i.reason,
                    date: i.date,
                    vehicle: i.vehicle,
                    tco: i.tco,
                    nif: i.nif,
                    productType: i.productType,
                    user: i.user,
                    pos: i.pos
                } 
            })

            worksheet.addRows(rows);
    
            worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
                row.font = { name: 'Arial', family: 4, size: 10 }
            })
            const random = Math.random().toString(36).slice(2);
            let filename = `EXPORT_${random}.xlsx`;
            console.log('try saving', filename)
            workbook.xlsx.writeFile(`exports/` + filename)
                .then(() => {
                    console.log('saved!', filename)
                    resolve(filename)
                }, rej => {
                    reject('No se pudo guardar el archivo')
                });
        }
        catch (e) {
            reject('error' + e)
        }
        
    })
}
module.exports = { OKMovement, getAll, exportTransaction }