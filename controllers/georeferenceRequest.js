'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var GeoreferenceRequest = require('../models/georeferenceRequest')
var pushService = require('../services/push')

function getForRequest(req, res) {
    var requestId = req.params.requestId;
    GeoreferenceRequest
        .find(requestId ? { requestId: requestId } : {})
        .exec((err, records, total) => {
            if(err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
            if(!records)
                return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
            
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
    var id = req.params.id
    GeoreferenceRequest
        .findById(id)
        .exec( (err, georeferenceRequest) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!georeferenceRequest) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: georeferenceRequest,
                        code: 0 
                    })
        })
}
function saveOne (req, res) {
    
    var georeferenceRequest = new GeoreferenceRequest()
    var params = req.body
    georeferenceRequest.lat = params.lat
    georeferenceRequest.lng = params.lng
    georeferenceRequest.requestId = params.requestId
    georeferenceRequest.user = params.user
    var distributor = params.distributor;
    georeferenceRequest.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        /* SEND PUSH TO DEVICES */ 
        pushService.requestGeoreference(distributor, params.requestId);
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
    GeoreferenceRequest.findByIdAndUpdate(id, update, (err, georeferenceRequest) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!georeferenceRequest) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    data: georeferenceRequest,
                    code: 0
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    GeoreferenceRequest.findByIdAndRemove(id, (err, deleted) => {
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
    getForRequest,
    getOne,
    saveOne,
    updateOne,
    deleteOne
}  