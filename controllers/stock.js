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
            { header: 'Fecha', key: 'date', width: 10 },
            { header: 'Origen', key: 'origin', width: 30 },
            { header: 'Destino', key: 'destiny', width: 30}
        ];
        
        let rows = stock.map((s) => { 
            return { 
                nif: s.product.formatted || s.product.nif,
                pos: s.mov && s.mov.movement && s.mov.movement.transaction && s.mov.movement.transaction.device ? s.mov.movement.transaction.device.pos : '',
                date: s.mov && s.mov.movement && s.mov.movement.transaction ? s.mov.movement.transaction.createdAt : '',
                origin: s.mov && s.mov.movement && s.mov.movement.transaction ? s.mov.movement.warehouse.name : '',
                destiny: s.mov && s.mov.movement && s.mov.movement.transaction ? s.mov.movement.warehouse.name : ''
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
                                st.mov = mov
                                sts.push(st)
                                if(i == stock.length -1) {
                                    resolve(sts)
                                }
                            }, reason => {
                                console.log(reason)
                            })
                }, this);
                
            })
    })
}
function getLastMovement (product) {
    return new Promise ( ( resolve, reject ) => {
        MovementItem
            .find({ product: product }, { }, { sort: { createdAt: -1 } })
            .limit(2)
            .populate({ 
                path: 'movement', 
                populate: { 
                    path: 'transaction',
                    populate: { 
                        path: 'device'
                    }
                }
            })
            .exec((err, movement) => {
                if(err) reject(err)
                movement = movement.filter((m) => { return m.movement.type == 'E' })
                resolve(movement)
            })
    })
}

module.exports = { getByNif, getStockWarehouse, exportToExcel }