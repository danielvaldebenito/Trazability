'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var User = require('../models/user')
var Warehouse = require('../models/warehouse')
var UserWarehouse = require ('../models/userWarehouse')
var Distributor = require('../models/distributor')
var config = require('../config')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var distributor = req.params.distributor
    var match = distributor ? { '_id': distributor } : {}
    UserWarehouse
            .find()
            .sort([[sidx, sord]])
            .populate({ path: 'warehouse', model: Warehouse })
            .populate({ 
                path: 'user', 
                model: User, 
                populate: { 
                    path: 'distributor', 
                    model: Distributor,
                    match: match
                } 
            })
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'Bodegas Usuario Total', 
                        data: records,
                        total: total
                    })  
                
            })
}

function getForUser(req, res) {
    var page = req.params.page || 1
    var limit = req.params.limit || 200
    var sidx = req.params.sidx || '_id'
    var sord = req.params.sord || 1
    var user = req.params.user

    UserWarehouse
            .find({ user: user })
            .sort([[sidx, sord]])
            .populate({ path: 'warehouse', model: Warehouse })
            .populate({ path: 'user', model: User })
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                
                var options = { path: 'user.distributor', model: Distributor }
                UserWarehouse.populate(records, options, (errr, userwhs) => {
                    return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'Bodegas de un usuario', 
                        data: userwhs,
                        total: total
                    })  
                })
                
            })
}

function getForWarehouse(req, res) {
    var page = req.params.page || 1
    var limit = req.params.limit || 200
    var sidx = req.params.sidx || '_id'
    var sord = req.params.sord || 1
    var warehouse = req.params.warehouse

    UserWarehouse
            .find({ warehouse: warehouse })
            .sort([[sidx, sord]])
            .populate({ path: 'warehouse', model: Warehouse })
            .populate({ path: 'user', model: User })
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                
                var options = { path: 'user.distributor', model: Distributor }
                UserWarehouse.populate(records, options, (errr, userwhs) => {
                    return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'Usuarios de una bodega', 
                        data: userwhs,
                        total: total
                    })  
                })
                
            })
}

function getOne (req, res) {
    var id = req.params.id
    UserWarehouse.findById(id)
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
    
    var userWarehouse = new UserWarehouse()
    var params = req.body
    userWarehouse.user = params.user
    userWarehouse.warehouse = params.warehouse
    userWarehouse.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        // Creating decrease warehouse
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
    UserWarehouse.findByIdAndUpdate(id, update, (err, updated) => {
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
    UserWarehouse.findByIdAndRemove(id, (err, deleted) => {
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
    getForUser,
    getForWarehouse,
    getOne,
    saveOne,
    updateOne,
    deleteOne
}  
