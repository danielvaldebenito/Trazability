/*name: { type: String, unique: true, required: true },
    points:*/
'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var ProductType = require('../models/productType')

function getAll(req, res) {
    var page = req.params.page || 1
    var limit = req.param.limit || 200
    var sidx = req.params.sidx || '_id'
    var sord = req.params.sord || 1
    ProductType
        .find()
        .sort([[sidx, sord]])
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
                    data: records, 
                    total: total
                })
            
            
        })
}
function getOne (req, res) {
    var id = req.params.id
    ProductType.findById(id)
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!record) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        record 
                    })
        })
}
function saveOne (req, res) {
    var params = req.body
    var productType = new ProductType()
    productType.name = params.name
    productType.description = params.description
    productType.weight = params.weight
    productType.tare = params.tare
    productType.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        // Creating decrease warehouse
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    stored: stored,
                })        
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    ProductType.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    updated 
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    ProductType.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro eliminado', 
                    deleted 
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
