'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
var PriceList = require('../models/priceList')
var Price = require('../models/price')
var ProductType = require('../models/productType');
function getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const sidx = req.query.sidx || '_id'
    const sord = req.query.sord || 1
    //const distributor = req.params.distributor
    const city = req.query.city
    const region = req.query.region
    PriceList.find(region ? city ? { city: city, region: region }: { region: region }: {})
            .sort([[sidx, sord]])
            .populate('items.productType')
            .paginate(page, limit, (err, records, total) => {
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
                        total: total,
                        code: 0
                    })
                
                
            })
}
function getOne (req, res) {
    var id = req.params.id
    PriceList
        .findById(id)
        .populate('items.productType')
        .exec( (err, record) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en la petición'})
            if(!record) return res.status(404).send({ done: false, code: 1, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        record,
                        code: 0
                    })
        })
}
function saveOne (req, res) {

    let priceList = new PriceList()
    const params = req.body
    priceList.name = params.name
    priceList.region = params.region
    priceList.city = params.city
    priceList.items = params.items
    
    priceList.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, code: 1, message: 'No ha sido posible guardar el registro' })
        
        return res
            .status(200)
            .send({ 
                done: true, 
                message: 'Registro guardado exitosamente', 
                stored: stored,
                code: 0
            })
    
    })
}
function updateOne(req, res) {
    const id = req.params.id
    const update = req.body
    PriceList.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en la petición', error: err})
        if(!updated) return res.status(404).send({ done: false, code: 1, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro modificado exitosamente', 
                    updated,
                    code: 0
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    PriceList.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, code: 1, message: 'No se pudo eliminar el registro' })
        
        return res
        .status(200)
        .send({ 
            done: true, 
            message: 'Registro eliminado', 
            deleted,
            code: 0
        })
    })
}

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne
}  
