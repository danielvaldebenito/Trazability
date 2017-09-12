'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../models/warehouse')
var Decrease = require('../models/decrease')
var Address = require ('../models/address')
var Vehicle = require ('../models/vehicle')
/* Crea la bodega al crear una dirección */
var createAddressWarehouse = function(req, res, next) {
    console.log('createAddressWarehouse', req.body)
    var warehouse = new Warehouse()
    warehouse.name = req.body.location
    warehouse.type = 'DIRECCION_CLIENTE'
    warehouse.save((err, wh) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}
var createAddressFromClient = function (req, res, next) {
    console.log('createAddressFromClient', req.body)
    var address = new Address()
    var params = req.body
    address.location = params.address
    address.client = params.client
    address.warehouse = params.warehouse
    address.coordinates = params.coordinates
    address.save((err, add) => {
        if(err) return res.status(500).send({ message: 'Error en middleware al crear dirección', error: err })
        if(!add) return res.status(500).send({ message: 'Error en middleware al crear dirección'})
        next ()
    })

}

/* Crea la bodega al crear una dirección en el contexto de ingresar un pedido */
var createAddressWarehouseForOrder = function(req, res, next) {
    
    var body = req.body;
    console.log('createAddressWarehouseForOrder', body)
    var placeId = body.placeId;
    if(!placeId) { next() }
    else {
        Address
        .findOne({ placeId: placeId })
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al buscar placeId', error: err })
            if(record) { /* Si existe una direccion con ese placeId */
                req.body.destinyWarehouse = record.warehouse // Se envia la bodega
                req.body.address = record._id
                next();
            } else { // Si no se crea una bodega y la direccion, y se envía al siguiente la bodega
                var warehouse = new Warehouse()
                warehouse.name = req.body.address
                warehouse.type = 'DIRECCION_CLIENTE'
                warehouse.save((err, wh) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', error: err })
                       
                    var address = new Address()
                    address.location = body.address
                    address.city = body.city
                    address.region = body.region
                    address.client = body.client
                    address.warehouse = wh._id
                    address.coordinates = body.coordinates
                    address.placeId = body.placeId
                    address.coordinates = {
                        lat: body.lat,
                        lng: body.lng
                    }
                    address.save((error, addressSaved) => {
                        req.body.destinyWarehouse = wh._id
                        req.body.address = addressSaved._id
                        next();
                    })
                })
            }
        })

    }
    
}
var getWarehouseFromVehicle = function (req, res, next) {
    console.log('getWarehouseFromVehicle', req.body)
    if(!req.body.vehicle) {
        next();
    } else {
        Vehicle.findById(req.body.vehicle, (err, veh) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware al buscar bodega del vehiculo', error: err })
            if(!veh) return res.status(404).send({ done: false, code: 1, message: 'Error en middleware al buscar bodega del vehiculo'})
            req.body.originWarehouse = veh.warehouse;
            next()
        })
    }
}
var createVehicleWarehouse = function(req, res, next) {
    console.log('createVehicleWarehouse', req.body)
    var warehouse = new Warehouse()
    warehouse.name = req.body.licensePlate
    warehouse.dependence = req.body.dependence
    warehouse.type = 'VEHÍCULO'
    warehouse.save((err, wh) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}

var createStoreWarehouse = function(req, res, next) {
    console.log('createStoreWarehouse', req.body)
    var warehouse = new Warehouse()
    warehouse.name = 'Almacén ' + req.body.name
    warehouse.dependence = req.body.dependence
    warehouse.type = 'ALMACÉN'
    warehouse.save((err, wh) => {
        if(err) {
            console.log(err)
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}




module.exports = {
    createAddressWarehouse,
    createVehicleWarehouse,
    createStoreWarehouse,
    createAddressFromClient,
    createAddressWarehouseForOrder,
    getWarehouseFromVehicle
}