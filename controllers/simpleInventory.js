'use strict'

const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const SimpleInventory = require('../models/simpleInventory')
const Enumerable = require('linq')
const moment = require('moment')

function getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || '_id'
    const sord = req.query.sord || 1
    SimpleInventory.find()
            .sort([[sidx, sord]])
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
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                
                return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: { records, total },  
                        code: 0
                    })
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
            let doc = { warehouse: d.warehouse, dependence: d.dependence, takes: takes };
            items.push(doc);
        }
    })
    SimpleInventory.insertMany(items, (err, docs) => {
        if(err) return res.status(500).send({ done: false, message: 'ERROR', err})
        return res.status(200).send({ done: true, message: docs.length + ' registros ingresados' })
    })
    
}


module.exports = {
    getAll,
    getOne,
    saveOne
}  