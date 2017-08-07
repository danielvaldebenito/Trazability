'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Address = require('../models/address')
var Client = require('../models/client')
var Warehouse = require('../models/warehouse')
var ObjectId = mongoose.Types.ObjectId

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var clientId = req.query.client
    Address.find(clientId ? { client: clientId } : {})
            .sort([[sidx, sord]])
            .populate({ path: 'warehouse'})
            .populate({ path: 'client', model: Client })
            .paginate(page, limit, (err, records, total) => {
                if(err)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
                if(!records)
                    return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
                
                Client.findById(clientId, (err, client) => {
                    return res
                        .status(200)
                        .send({ 
                            done: true, 
                            message: 'OK', 
                            data: { records, total },  
                            code: 0
                        })
                })
                
            })
            

}
function getOne (req, res) {
    var id = req.params.id
    Address.findById(id)
        .populate({ path: 'client'})
        .exec( (err, address) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!address) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: address,
                        code: 0 
                    })
        })
}
function saveOne (req, res) {
    
    var address = new Address()
    var params = req.body
    console.log(params)
    address.location = params.location
    address.client = params.client
    address.warehouse = params.warehouse
    address.coordinates = params.coordinates
    address.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    data: stored,
                    code: 0
                })
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Address.findByIdAndUpdate(id, update, (err, address) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!address) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    data: address,
                    code: 0
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Address.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro eliminado', 
                    data: deleted,
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