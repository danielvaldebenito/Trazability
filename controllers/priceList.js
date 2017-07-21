'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
var PriceList = require('../models/priceList')
var Price = require('../models/price')
var ProductType = require('../models/productType');
function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var distributor = req.params.distributor

    PriceList.find({ distributor: distributor })
            .sort([[sidx, sord]])
            .populate({ 
                path: 'items',
                model: Price,
                populate: {
                    path: 'productType',
                    model: ProductType
                }
            })
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
        .populate({ 
            path: 'items',
            model: Price,
            populate: {
                path: 'productType',
                model: ProductType
            }
        })
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

    var priceList = new PriceList()
    var params = req.body
    priceList.name = params.name
    priceList.distributor = params.distributor
    var items = JSON.parse(req.body.items)
    items.forEach(i => {
        var price = new Price({
            priceList: priceList._id,
            productType: i.productType,
            price: i.price
        })
        priceList.items.push (price);
        price.save((errr, priceStored) => {
            if(errr) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al guardar item', error: errr })
            
        }) 
    })
    priceList.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, code: 1, message: 'No ha sido posible guardar el registro' })
        
        PriceList
            .findById(stored._id)
            .populate({ 
                path: 'items',
                model: Price,
                populate: {
                    path: 'productType',
                    model: ProductType
                }
            })
            .exec((err, pl) => {
                if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al guardar', error: err })
                
                return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    stored: pl,
                    code: 0
                })
        })
        
    
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    var items = JSON.parse(update.items);
    update.items = null;
    items.forEach(i => {
        Price.findByIdAndUpdate(i.itemId, { price: i.price }, (e, itemUpdated) => {
            if(e) return res.status(500).send({ done: false, code: -1, message: 'Error en la petición', error: err})
            
        })
    })
    PriceList.findByIdAndUpdate(id, {name: update.name}, (err, updated) => {
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
        
        Price.find({ priceList: deleted._id })
            .remove((errr, deletedPrices) => {
                if(errr) return res.status(500).send({ done: false, code:-1, message: 'Error al eliminar el item del registro' })
                if(!deletedPrices) return res.status(404).send({ done: false, code: 1, message: 'No se pudo eliminar el item del registro' })
                
                return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro eliminado', 
                    deleted,
                    code: 0
                })

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
