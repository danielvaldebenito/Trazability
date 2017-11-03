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

function exportToExcel (req, res) {
    getDataToExport()
        .then(stock => {
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
        })
}
function writeFileExcel(stock) {
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
        let worksheet = workbook.addWorksheet('Productos')
        worksheet.autoFilter = 'A1:E1';
        worksheet.columns = [
            { header: 'NIF', key: 'nif', width: 30 },
            { header: 'POS', key: 'pos', width: 30 },
            { header: 'Fecha', key: 'date', width: 30 },
            { header: 'Tipo Origen', key: 'originType', width: 30 },
            { header: 'Origen', key: 'origin', width: 30 },
            { header: 'Tipo Destino', key: 'destinyType', width: 30 },
            { header: 'Destino (Actual)', key: 'destiny', width: 30},
            { header: 'Test', key: 'test', width: 50 }
        ];
        
        let rows = stock.map((s) => { 
            let movitems = []
            movitems = s.movs;
            const inputMov = Enumerable.from(movitems)
                                .where(w => { return w.movement.type == 'E'})
                                .firstOrDefault();
            const outputMov = Enumerable.from(movitems)
                                .where(w => { return w.movement.type == 'S'})
                                .firstOrDefault();
            return { 
                nif: s.product.formatted || s.product.nif,
                pos: inputMov && inputMov.movement && inputMov.movement.transaction && inputMov.movement.transaction.device ? inputMov.movement.transaction.device.pos : '',
                date: inputMov && inputMov.movement ? inputMov.movement.createdAt : '',
                originType: outputMov && outputMov.movement && outputMov.movement.warehouse ? outputMov.movement.warehouse.type : '',
                origin: outputMov && outputMov.movement && outputMov.movement.warehouse ? outputMov.movement.warehouse.name : '',
                destinyType: s.warehouse ? s.warehouse.type : '',
                destiny: s.warehouse ? s.warehouse.name : '',
                test: JSON.stringify(s.additional)
            } 
        })
        // NIF  | POS QUE HIZO LA TRANSACCION | FECHA Y HORA | ORIGEN | DESTINO

        worksheet.addRows(rows);

        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
            row.font = { name: 'Arial', family: 4, size: 12 }
        })
        const random = Math.random().toString(36).slice(2);
        let filename = `EXPORT_${random}.xlsx`;
        workbook.xlsx.writeFile(`exports/` + filename)
            .then(() => {
                resolve(filename)
            });
    })
}
function getDataToExport () {
    return new Promise((resolve, reject) => {
        Stock.find()
            .populate('warehouse')
            .populate('product')
            .exec((err, stock) => {
                if(err) reject(err)
                let sts = []
                stock.forEach(function(s, i) {
                    let st = s.toObject()
                    if(s.product)
                        getLastMovement(s.product._id)
                            .then(mov => {
                                st.movs = mov
                                getAditionalData(s.warehouse)
                                .then(additional => {
                                    st.additional = additional
                                    sts.push(st)
                                    if(i == stock.length -1) {
                                        resolve(sts)
                                    }
                                })
                            }, reason => {
                                console.log(reason)
                            })
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
                case types[1]: // vehículo
                Vehicle.findOne({ warehouse: warehouse}, (err, vehicle) => {
                    if(err) reject(err)
                    resolve({vehicle})
                })
                break;
                case types[2]:
                    Address
                        .find({warehouse: warehouse})
                        .populate('client')
                        .exec((err, address) => {
                            if(err) reject(err)
                            resolve({address})
                    })
                break;
                case types[3]: // store
                    resolve(null);
                break;
                case types[4]: // mermas
                    resolve(null)
                break;
                case types[5]: // proceso Interno
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
                    populate: { 
                        path: 'device'
                    }
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

module.exports = { getByNif, getStockWarehouse, exportToExcel }