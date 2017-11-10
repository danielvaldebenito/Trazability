'use strict'

const Stock = require('../models/stock')
const Product = require('../models/product')
const Dependence = require('../models/dependence')
const Warehouse = require('../models/warehouse')
const Movement = require('../models/movement')
const MovementItem = require('../models/movementItem')
const Excel = require('exceljs')
const fs = require('fs')
const path = require('path')
const Enumerable = require('linq')
const config = require('../config')
const Vehicle = require('../models/vehicle')
const Client = require('../models/client')
const Address = require('../models/address')
function getByNif(req, res) {
    const nif = req.params.nif
    Product.findOne({ nif: nif })
        .exec((err, product) => {
            if(err) return res.status(500).send({ done: false, message: 'Error al buscar un producto con el nif ' + nif, err, code: -1})
            
            if(!product) return res.status(404).send({ done: false, message: 'No existe producto con el NIF ' + nif, code: 1})
            
            Stock.find({ product: product._id })
                .populate('product')
                .populate('warehouse')
                .exec((err, stock) => {
                    if(err) return res.status(500).send({ done: false, message: 'Error al buscar stock para el nif ' + nif, err, code: -1})
                    
                    if(!stock) return res.status(404).send({ done: false, message: 'No existe stock para el NIF ' + nif, code: 1})
                    
                    return res.status(200)
                            .send({
                                done: true,
                                code: 0,
                                message: 'OK',
                                data: stock
                            })
                })
        })
}
function getStockWarehouse(req, res) {
    const warehouse = req.params.warehouse
    Stock.find({ warehouse: warehouse })
        .populate([
            {
                path: 'warehouse'
            },
            {
                path: 'product'
            }])
        .exec( ( err, stock ) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
            //stock = stock.filter((s) => { return s.warehouse && s.warehouse.dependence && s.warehouse.dependence._id == dependence })
            return res.status(200).send({ done: true, message: 'OK', data: stock})
        } )
    
}
function exportResumeToExcel(req, res) {
    const dependence = req.query.dependence
    const warehouseType = req.query.warehouseType
    const warehouse = req.query.warehouse
    const dependenceName = req.query.dependenceName
    const warehouseName = req.query.warehouseName
    getResumeDataToExport(dependence, warehouseType, warehouse)
        .then(stock => {
            writeResumeFileExcel(stock)
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
                })
        })
}
function exportToExcel (req, res) {
    const dependence = req.query.dependence
    const warehouseType = req.query.warehouseType
    const warehouse = req.query.warehouse
    const dependenceName = req.query.dependenceName
    const warehouseName = req.query.warehouseName
    getDataToExport(dependence, warehouseType, warehouse)
        .then(stock => {
            console.log('stock', stock)
            writeFileExcel(stock)
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
                })
        }, onrejected => {
            res.status(onrejected.status).send({ done: false, message: 'Ha ocurrido un error', err: onrejected.err})
        })
}
function writeFileExcel(data) {
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
        let worksheetName = 'Stock'
        let worksheet = workbook.addWorksheet(worksheetName)
        worksheet.autoFilter = 'A1:I1';
        worksheet.columns = [
            { header: 'NIF', key: 'nif', width: 20 },
            { header: 'POS', key: 'pos', width: 10 },
            { header: 'Fecha', key: 'date', width: 10 },
            { header: 'Tipo Origen', key: 'originType', width: 20 },
            { header: 'Origen', key: 'origin', width: 40 },
            { header: 'Tipo Destino', key: 'destinyType', width: 20 },
            { header: 'Destino (Actual)', key: 'destiny', width: 40},
            { header: 'NIT Cliente', key: 'clientNit', width: 40 },
            { header: 'Nombre Cliente', key: 'clientName', width: 40 },
            { header: 'Documento', key: 'document', width: 20 }
        ];
        
        let rows = data.stock.map((s) => { 
            let movitems = []
            movitems = s.movs;
            const inputMov = Enumerable.from(movitems)
                                .where(w => { return w.movement.type == 'E'})
                                .firstOrDefault();
            const outputMov = Enumerable.from(movitems)
                                .where(w => { return w.movement.type == 'S'})
                                .firstOrDefault();
            let client = s.additional && s.additional.address ? s.additional.address.client : null

            return { 
                
                nif: s.product.formatted || s.product.nif,
                pos: inputMov && inputMov.movement && inputMov.movement.transaction && inputMov.movement.transaction.device ? inputMov.movement.transaction.device.pos : '',
                date: inputMov && inputMov.movement ? inputMov.movement.createdAt : '',
                originType: outputMov && outputMov.movement && outputMov.movement.warehouse ? outputMov.movement.warehouse.type : '',
                origin: outputMov && outputMov.movement && outputMov.movement.warehouse ? outputMov.movement.warehouse.name : '',
                destinyType: s.warehouse ? s.warehouse.type : '',
                destiny: s.warehouse ? s.warehouse.name : '',
                clientNit: client ? client.nit : '',
                clientName: client ? client.name + ' ' + client.surname : '',
                document: inputMov && inputMov.movement && inputMov.movement.transaction && inputMov.movement.transaction.document ? inputMov.movement.transaction.document.folio : ''
            } 
        })
        worksheet.addRows(rows);

        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
            row.font = { name: 'Arial', family: 4, size: 10 }
        })
        const random = Math.random().toString(36).slice(2);
        let filename = `EXPORT_${random}.xlsx`;
        workbook.xlsx.writeFile(`exports/` + filename)
            .then(() => {
                resolve(filename)
            });
    })
}
function writeResumeFileExcel(data) {
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
        let worksheetName = 'Stock'
        console.log(worksheetName)
        let worksheet = workbook.addWorksheet(worksheetName)
        worksheet.autoFilter = 'A1:D1';
        worksheet.columns = [
            { header: 'Tipo Ubicación', key: 'type', width: 20 },
            { header: 'Ubicación', key: 'ubication', width: 20 },
            { header: 'Producto', key: 'productType', width: 20 },
            { header: 'Cantidad', key: 'quantity', width: 10 }
        ];
        
        let rows = data.stock.map((s) => { 
            return { 
                type: s.ubicationType,
                ubication: s.ubicationName,
                productType: s.type,
                quantity: s.quantity
            } 
        })
        worksheet.addRows(rows);
        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
            row.font = { name: 'Arial', family: 4, size: 10 }
        })
        const random = Math.random().toString(36).slice(2);
        let filename = `EXPORT_${random}.xlsx`;
        workbook.xlsx.writeFile(`exports/` + filename)
            .then(() => {
                resolve(filename)
            });
    })
}
function getResumeDataToExport (dependence, warehouseType, warehouse) {
    return new Promise((resolve, reject) => {
        Stock.find()
            .populate({ 
                path: 'warehouse', 
                populate: { 
                    path: 'dependence'
                }
            })
            .populate('product')
            .exec((err, stock) => {
                if(err) reject({status: 500, err: err})

                if(dependence) {
                    stock = stock.filter((s) => { return s.warehouse && s.warehouse.dependence && s.warehouse.dependence._id == dependence })
                    if(warehouseType) {
                        stock = stock.filter((s) => { return s.warehouse && s.warehouse.type == warehouseType })
                        if(warehouse) {
                            stock = stock.filter((s) => { return s.warehouse && s.warehouse._id == warehouse })
                        }
                    }
                }
                if(!stock || !stock.length || stock.length == 0) {
                    resolve({ stock: []})
                }
                let sts = []
                stock.forEach((s, i) => {
                    let st = s.toObject()
                    let type = st.product.productType ? st.product.productType.name  : 'DESCONOCIDO'
                    let ubication = st.warehouse ? st.warehouse._id : 'DESCONOCIDO'
                    let exists = Enumerable.from(sts)
                                    .where((w) => { return w.type == type && w.ubication.toString() == ubication.toString() })
                                    .firstOrDefault();
                    console.log('exists', {exists, type, ubication})
                    if(exists) {
                        exists.quantity = exists.quantity + 1;
                    } else {
                        sts.push({ 
                            type: type, 
                            quantity: 1, 
                            ubication: ubication,
                            ubicationName: st.warehouse ? st.warehouse.name : 'DESCONOCIDO',
                            ubicationType: st.warehouse ? st.warehouse.type : 'DESCONOCIDO'
                        })
                    }
                    if(i == stock.length - 1) {
                        resolve({ stock: sts})
                    }
                    
                }, this);
                
            })
    })
}


function getDataToExport (dependence, warehouseType, warehouse) {
    return new Promise((resolve, reject) => {
        Stock.find()
            .populate({ 
                path: 'warehouse', 
                populate: { 
                    path: 'dependence'
                }
            })
            .populate('product')
            .exec((err, stock) => {
                if(err) reject({status: 500, err: err})
                if(dependence) {
                    stock = stock.filter((s) => { return s.warehouse && s.warehouse.dependence && s.warehouse.dependence._id == dependence })
                    if(warehouseType) {
                        stock = stock.filter((s) => { return s.warehouse && s.warehouse.type == warehouseType })
                        if(warehouse) {
                            stock = stock.filter((s) => { return s.warehouse && s.warehouse._id == warehouse })
                        }
                    }
                }
                if(!stock || !stock.length || stock.length == 0) {
                    resolve({ stock: [] })
                }
                let sts = []
                stock.forEach(function(s, i) {
                    let st = s.toObject()
                    if(s.product) {
                        getLastMovement(s.product._id)
                        .then(mov => {
                            st.movs = mov
                            getAditionalData(s.warehouse)
                            .then(additional => {
                                st.additional = additional
                                sts.push(st)
                                if(i == stock.length - 1) {
                                    resolve({ stock: sts })
                                }
                            })
                        }, reason => {
                            reject({ status: 500, err: reason })
                        })
                    }
                        
                }, this);
                
            })
    })
}
function getAditionalData(warehouse) {
    return new Promise((resolve, reject) => {
        if(!warehouse) {
            resolve(null)
        }
        Warehouse.findById(warehouse._id, (err, wh) => {
            if(err) reject(err)
            if(!wh) reject('No existe bodega')
            const type = wh.type
            const types = config.entitiesSettings.warehouse.types
            // types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
            switch(type) {
                case types[0]: // vehículo
                Vehicle.findOne({ warehouse: warehouse}, (err, vehicle) => {
                    if(err) reject(err)
                    resolve({vehicle})
                })
                break;
                case types[1]:
                    Address
                        .findOne({warehouse: warehouse})
                        .populate('client')
                        .exec((err, address) => {
                            if(err) reject(err)
                            resolve({address})
                    })
                break;
                case types[2]: // store
                    resolve(null);
                break;
                case types[3]: // mermas
                    resolve(null)
                break;
                case types[4]: // proceso Interno
                    resolve(null); 
                break;
                default: resolve(null);
            }
        })
    })
}
function getLastMovement (product) {
    return new Promise ( ( resolve, reject ) => {
        MovementItem
            .find({ product: product })
            .populate({ 
                path: 'movement', 
                populate: [{ 
                    path: 'transaction',
                    populate: [{ 
                        path: 'device'
                    },{
                        path: 'document'
                    }]
                },{
                    path: 'warehouse',
                }]
            })
            .sort([['createdAt', -1]])
            .limit(2)
            .exec((err, movements) => {
                if(err) reject(err)
                resolve(movements)
            })
    })
}

module.exports = { getByNif, getStockWarehouse, exportToExcel, exportResumeToExcel }