'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Georeference = require('../models/georeference')
var GeoreferenceRequest = require('../models/georeferenceRequest')
var Device = require('../models/device')
var Vehicle = require('../models/vehicle')
var distance = require('google-distance-matrix');
var config = require('../config')
distance.key(config.googleApiKey);
distance.units('metric');

function getForRequest(req, res) {
    var requestId = req.params.requestId
    // Buscando la request
    GeoreferenceRequest
        .findOne({ requestId: requestId })
        .exec((err, georeq) => {
            if(err)
                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
            if(!georeq)
                return res.status(404).send({ done: false, code: 1, message: 'Error al obtener los datos' })
            
            var lat = georeq.lat;
            var lng = georeq.lng;
            var from = lat + ',' + lng;
            var origins = [];
            origins.push(from);
            // Busca las georeferencias obtenidas despues de esa request
            Georeference
                .find({ requestId: requestId })
                .exec((err, geos) => {
                    if(err)
                        return res.status(500).send({ done: false, code: -2, message: 'Ha ocurrido un error', error: err})
                    if(!geos)
                        return res.status(404).send({ done: false, code: 2, message: 'Error al obtener los datos' })
                    
                    var destinations = [];
                    geos.forEach(g => {
                        destinations.push(g.lat + ',' + g.lng);
                    })
                    if(!destinations || destinations.length == 0) {
                        return res
                                .status(200)
                                .send({ 
                                    done: true, 
                                    code: 1, 
                                    message: 'No se pudo recoger georeferencias' 
                                })
                    }
                    // Obtiene las distancias de cada georeferencia recogida, en relación con la georeferencia del request
                    distance.matrix(origins, destinations, function (err, distances) {
                        if (err) {
                            return res.status(500).send({ done: false, code: -3, message: 'Ha ocurrido un error', error: err})
                        }
                        if(!distances) {
                            return res.status(404).send({ done: false, code: 3, message: 'Error al obtener los datos' })
                        }
                        var minor = 999999999999;
                        var minorDistanceDevice;
                        var minorText = ''
                        if (distances.status == 'OK') {
                            for (var i=0; i < origins.length; i++) {
                                for (var j = 0; j < destinations.length; j++) {
                                    var origin = distances.origin_addresses[i];
                                    var destination = distances.destination_addresses[j];
                                    if (distances.rows[0].elements[j].status == 'OK') {
                                        var mts = distances.rows[i].elements[j].distance.value;
                                        var text = distances.rows[i].elements[j].distance.text;
                                        if(minor > mts) {
                                            minor = mts;
                                            minorDistanceDevice = geos[i];
                                            minorText = text
                                        }    
                                    }
                                    // Fin del ciclo.
                                    if(i == origins.length - 1 && j == destinations.length - 1) {
                                        
                                        if(minorDistanceDevice) {
                                            Vehicle
                                                .findById(minorDistanceDevice.vehicle)
                                                .exec ((err, veh) => {
                                                    return res
                                                    .status(200)
                                                    .send({ 
                                                        done: true, 
                                                        code: 1, 
                                                        data: { minor, minorDistanceDevice, minorText, veh }, 
                                                        message: 'OK' 
                                                    })
                                                })
                                        } else {
                                            return res
                                                .status(200)
                                                .send({ 
                                                    done: true, 
                                                    code: 1, 
                                                    message: 'No hay vehículos a menor distancia' 
                                                })
                                        }
                                        
                                        
                                    }
                                }
                                
                            }
                        }
                        
                    });
                })
            
            
        })
            

}
function getOne (req, res) {
    var id = req.params.id
    Georeference
        .findById(id)
        .exec( (err, georeference) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!georeference) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: georeference,
                        code: 0 
                    })
        })
}
function saveOne (req, res) {
    
    var georeference = new Georeference()
    var params = req.body
    georeference.lat = params.lat
    georeference.lng = params.lng
    georeference.requestId = params.requestId
    georeference.device = params.device
    georeference.vehicle = params.vehicle
    georeference.save((err, stored) => {
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
    Georeference.findByIdAndUpdate(id, update, (err, georeference) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!georeference) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    data: georeference,
                    code: 0
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Georeference.findByIdAndRemove(id, (err, deleted) => {
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