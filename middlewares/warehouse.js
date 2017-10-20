'use strict'

const mongoose = require('mongoose')
const Warehouse = require('../models/warehouse')
const Decrease = require('../models/decrease')
const Address = require ('../models/address')
const Vehicle = require ('../models/vehicle')
const InternalProcess = require('../models/internalProcess')
const Client = require('../models/client')
const config = require('../config')
const createInternalProcessWarehouse = function(req, res, next) {
    console.log('createInternalProcessWarehouse', req.body)
    var warehouse = new Warehouse()
    warehouse.name = req.body.name
    warehouse.type = 'PROCESO_INTERNO'
    warehouse.dependence = req.body.dependence
    warehouse.save((err, wh) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}
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
        Client.findByIdAndUpdate(params.client, { $addToSet: { addresses: address } }, (err, client) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', err })
           
            next();
        })
        next ()
    })

}

/* Crea la bodega al crear una dirección en el contexto de ingresar un pedido */
var createAddressWarehouseForOrder = function(req, res, next) {
    
    const body = req.body;
    const placeId = body.placeId
    if(!placeId) { 
        const location = body.location || body.address.location;
        const city = body.city || body.address.city;
        const region = body.region || body.address.region; 
        const add = {
            location: location,
            city: city,
            region: region
        }
        Client.findByIdAndUpdate(body.client, { $addToSet: { addresses: add } }, (err, client) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', err })
            
            next();
        })
    }
    else {
        Address
        .findOne({ $or: [
            { placeId: placeId }, 
            {
                location: body.location || body.address.location,
                city: body.city || body.address.city,
                region: body.region || body.address.region,
                client: body.client
            }]})
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error al buscar placeId', error: err })
            if(record) { /* Si existe una direccion con ese placeId */
                req.body.destinyWarehouse = record.warehouse // Se envia la bodega
                req.body.address = record._id
                
                next();
            } else { // Si no se crea una bodega y la direccion, y se envía al siguiente la bodega

                let warehouse = new Warehouse()
                warehouse.name = body.location || body.address.location
                warehouse.type = 'DIRECCION_CLIENTE'
                warehouse.save((err, wh) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', error: err })
                    
                    let address = new Address()
                    address.location = body.location || body.address.location 
                    address.city = body.city || body.address.city 
                    address.region = body.region || body.address.region
                    address.client = body.client 
                    address.warehouse = wh._id
                    if(placeId != '000')
                        address.placeId = placeId
                    if(!body.coordinates) {
                        address.coordinates = {
                            lat: body.lat,
                            lng: body.lng
                        }
                    } else {
                        address.coordinates = body.coordinates
                    }  
                    address.save((err, addressSaved) => {
                        if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', err })

                        Client.findByIdAndUpdate(body.client, { $addToSet: { addresses: address } }, (err, client) => {
                            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware', err })
                           
                            req.body.destinyWarehouse = wh._id
                            req.body.address = addressSaved._id
                            next();
                        })

                        
                    })
                })
            }
        })

    }
    
}

var getWarehouseFromVehicle = function (req, res, next) {
    if(!req.body.vehicle) {
        next();
    } else {
        Vehicle.findById(req.body.vehicle, (err, veh) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en middleware al buscar bodega del vehiculo', error: err })
            if(!veh) return res.status(200).send({ done: false, code: 1, message: 'No se encontró vehículo'})
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

const getVehicleWarehouse = function (req, res, next) {
    if(!req.body.searchVehicle) {
        next();
    } else {
        const licensePlate = req.body.vehicleIsOrigin ? req.body.originLocation : req.body.destinationLocation
        Vehicle.findOne({ licensePlate: licensePlate}, (err, found) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehículo en middleware getVehicleWarehouse', err })
            if(!found) return res.status(200).send({ done: false, message: 'No se ha encontrado un vehículo con la placa: ' + licensePlate })
            req.body.vehicleId = found._id
            if(req.body.vehicleIsOrigin) {
                req.body.originWarehouse = found.warehouse
            } else {
                req.body.destinyWarehouse = found.warehouse
            }
            next()
        })
    }
    
}

const getInternalProcessWarehouse = function (req, res, next) {
    if(!req.body.searchInternalProcess) {
        next()
    } else {
        const ids = [ ]
        if(req.body.searchVehicle) {
            if(req.body.vehicleIsOrigin) {
                ids.push(req.body.destinationLocation)
            } else {
                ids.push(req.body.originLocation)
            }
        } else {
            ids.push(req.body.originLocation)
            ids.push(req.body.destinationLocation)
        }
        InternalProcess.find({ _id: { $in: ids } }, (err, founds) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar proceso interno en getInternalProcessWarehouse', err })
    
            if(!founds) return res.status(200).send({ done: false, message: 'No se ha encontrado proceso interno ' + internalProcess })
            
            if(!founds.length || founds.length == 0) return res.status(200).send({ done: false, message: 'No se encontró el proceso interno buscado'})
            const length = founds.length
            let count = 0
            founds.forEach(function(element) {
                var wh = element.warehouse

                if(element._id == req.body.originLocation)
                    req.body.originWarehouse = wh
                if(element._id == req.body.destinationLocation)
                    req.body.destinyWarehouse = wh

                count++
                if(length == count)
                {
                    next ()
                }
            }, this);        
        })
    }
}

const getWarehousesFromMovement = function (req, res, next) {
    const transactionType = req.body.transactionType
    const types = config.entitiesSettings.transaction.types
    console.log('getwarehousesfrommovement', req.body)
    switch(transactionType)
    {
        case types[3]: // mantencion
            req.body.searchInternalProcess = true
            break; 
        case types[4]: // carga
            req.body.searchInternalProcess = true
            req.body.vehicleIsOrigin = false
            req.body.searchVehicle = true
            break; 
        case types[5]: // descarga
            req.body.searchInternalProcess = true
            req.body.vehicleIsOrigin = true
            req.body.searchVehicle = true
            break; 
        case types[6]: // transferencia
            req.body.searchVehicle = true
            break;
        case types[7]: // estacion
            req.body.searchVehicle = true
            req.body.searchInternalProcess = true
            req.body.vehicleIsOrigin = true
            req.body.twice = true
            req.body.isStation = true
            break;

    }
    next()
}


module.exports = {
    createInternalProcessWarehouse,
    createAddressWarehouse,
    createVehicleWarehouse,
    createStoreWarehouse,
    createAddressFromClient,
    createAddressWarehouseForOrder,
    getWarehouseFromVehicle,
    getWarehousesFromMovement,
    getVehicleWarehouse,
    getInternalProcessWarehouse
}