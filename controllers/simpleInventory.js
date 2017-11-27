'use strict'

const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const SimpleInventory = require('../models/simpleInventory')
const Enumerable = require('linq')
const moment = require('moment')
const Excel = require('exceljs')
const fs = require('fs')
const path = require('path')
function getData (date1, date2, filter, page, limit, sidx, sord) {
    return new Promise((resolve, reject) => {
        try {
            SimpleInventory
            .find({
                date: {
                    $gte: date1,
                    $lte: date2
                }
            })
            .sort([[sidx, sord]])
            .populate([
                { path: 'warehouse' },
                { path: 'dependence' }, 
                { path: 'user' },
                { path: 'takes.productType'}
            ])
            .paginate(page, limit, (err, records, total) => {
                if(err)
                   throw err
                if(!records)
                    throw 'Error al obtener los datos'
                
                if(filter) {
                    let length = records.length;
                    records = records.filter((r) => { 
                        return (r.warehouse && r.warehouse.name && r.warehouse.name.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1)
                        || (r.dependence && r.dependence.name && r.dependence.name.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1)
                    })
                    total = total - (length - records.length)
                }
                resolve({ records, total }) 
            })
        }
        catch(e) {
            console.log('error: ', e)
        }
        
    })
    
}

function getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || 'date'
    const sord = req.query.sord || -1
    const filter = req.query.filter
    const from = req.query.from
    const to = req.query.to
    const fromSplit = from && from != 'null' ? from.split('-') : [2017,1,1];
    const toSplit = to && to != 'null' ? to.split('-') : null
    const date1 = new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 0, 0, 0)
    const date2 = !toSplit ? new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 23, 59, 59) : new Date(parseInt(toSplit[0]), parseInt (toSplit[1]) - 1, parseInt( toSplit[2]), 23, 59, 59)
    
    getData(date1, date2, filter, page, limit, sidx, sord)
        .then(data => {
            return res
            .status(200)
            .send({ 
                done: true, 
                message: 'OK', 
                data: data,  
                code: 0
            })
        }, reason => {
            return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: reason})
        })
}
function getOne (req, res) {
    const id = req.params.id
    SimpleInventory
        .findById(id)
        .populate([
            { 
                path: 'warehouse'
            },{
                path: 'dependence'
            }, {
                path: 'user'
            },{
                path: 'takes.productType'
            }])
        .exec( (err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!record) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: record,
                        code: 0 
                    })
        })
}
function saveOne (req, res) {
    const params = req.body
    let data = params.data
    let items = []
    data.map((d) => {
        let item = Enumerable.from(items)
                        .where((w) => { return w.warehouse == d.warehouse && w.dependence == d.dependence })
                        .firstOrDefault()
        let takes = !item ? [] : item.takes
        let take = { productType: d.productType, quantity: d.quantity, date: moment(d.date, "DD-MM-YYYY HH:mm:ss")}
        takes.push(take)
        if(!item) {
            let doc = { warehouse: d.warehouse, dependence: d.dependence, takes: takes, date: moment(), user: req.user.sub };
            items.push(doc);
        }
    })
    SimpleInventory.insertMany(items, (err, docs) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'ERROR', err})
        return res.status(200).send({ done: true, code: 0, message: docs.length + ' registros ingresados' })
    })
    
}
function exportAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || '_id'
    const sord = req.query.sord || 1
    const filter = req.query.filter
    const from = req.query.from
    const to = req.query.to
    const fromSplit = from && from != 'null' ? from.split('-') : [2017,1,1];
    const toSplit = to && to != 'null' ? to.split('-') : null
    const date1 = new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 0, 0, 0)
    const date2 = !toSplit ? new Date(parseInt(fromSplit[0]), parseInt(fromSplit[1]) - 1, parseInt(fromSplit[2]), 23, 59, 59) : new Date(parseInt(toSplit[0]), parseInt (toSplit[1]) - 1, parseInt( toSplit[2]), 23, 59, 59)
    
    getData(date1, date2, filter, page, limit, sidx, sord)
        .then(data => {
            writeFileExcel(data)
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
        }, reason => {
            return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: 'Error: ' + reason})
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
        let worksheetName = 'Inventario'
        let worksheet = workbook.addWorksheet(worksheetName)

        worksheet.autoFilter = 'A1:E1';
        worksheet.columns = [
            { header: 'Dependencia', key: 'dependence', width: 20 },
            { header: 'Tipo de bodega', key: 'warehouseType', width: 30 },
            { header: 'Bodega', key: 'warehouse', width: 30 },
            { header: 'Usuario', key: 'user', width: 10 },
            { header: 'Fecha', key: 'date', width: 20 },
            { header: 'Capacidad', key: 'capacity', width: 10 },
            { header: 'Cantidad', key: 'quantity', width: 10 }
        ];
        
        let rows = []
        const border = {style:'medium', color: {argb:'00000000'}}
        const alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        //const colorAsStatus = ['FF0000FF','FF0000FF','','','']
        data.records.map((s) => { 
            let takes = s.takes;
            let lastRow = worksheet.lastRow;
            let newRowNumber = lastRow.number + 1
            
            worksheet.mergeCells('A' + newRowNumber + ':A' + (newRowNumber + takes.length - 1));
            worksheet.mergeCells('B' + newRowNumber + ':B' + (newRowNumber + takes.length - 1));
            worksheet.mergeCells('C' + newRowNumber + ':C' + (newRowNumber + takes.length - 1));
            worksheet.mergeCells('D' + newRowNumber + ':D' + (newRowNumber + takes.length - 1));
            worksheet.mergeCells('E' + newRowNumber + ':E' + (newRowNumber + takes.length - 1));

            worksheet.getCell('A' + newRowNumber).value = s.dependence.name;
            worksheet.getCell('A' + newRowNumber).alignment = alignment;

            worksheet.getCell('B' + newRowNumber).value = s.warehouse.type;
            worksheet.getCell('B' + newRowNumber).alignment = alignment;

            worksheet.getCell('C' + newRowNumber).value = s.warehouse.name;
            worksheet.getCell('C' + newRowNumber).alignment = alignment;

            worksheet.getCell('D' + newRowNumber).value = s.user.name + ' ' + s.user.surname;
            worksheet.getCell('D' + newRowNumber).alignment = alignment;

            worksheet.getCell('E' + newRowNumber).value = moment(s.date).format("DD-MM-YYYY HH:mm:ss");
            worksheet.getCell('E' + newRowNumber).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }

            takes.map((take, i) => {
                worksheet.getCell('F' + (newRowNumber + i)).value = take.productType.capacity;
                worksheet.getCell('G' + (newRowNumber + i)).value = take.quantity;
            })
            
            worksheet.getRow(newRowNumber + takes.length - 1).commit();
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
    exportAll,
    getOne,
    saveOne
}  