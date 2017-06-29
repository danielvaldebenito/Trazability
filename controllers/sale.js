'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Sale = require('../models/sale')
var Document = require('../models/document')

function getAll(req, res) {
    var page = req.params.page || 1
    var limit = req.param.limit || 200
    var sidx = req.params.sidx || '_id'
    var sord = req.params.sord || 1

    Sale.find()
            .sort([[sidx, sord]])
            .populate('document')
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
    Sale.findById(id)
        .populate('document')
        .exec( (err, record) => {
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
    
    var sale = new Sale()
    var params = req.body
    sale.coordinates = params.coordinates
    sale.done = params.done
    sale.type = params.type
    sale.paymentMethod = params.paymentMethod
    sale.transaction = params.transaction
    sale.document = params.document
    sale.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    stored: stored
                })
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Sale.findByIdAndUpdate(id, update, (err, updated) => {
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
    Sale.findByIdAndRemove(id, (err, deleted) => {
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