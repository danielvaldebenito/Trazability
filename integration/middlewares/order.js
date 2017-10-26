'use strict'

const mongoose = require('mongoose')
const Warehouse = require('../../models/warehouse')
const Address = require('../../models/address')
const Vehicle = require ('../../models/vehicle')
const Client = require('../../models/client')
const ProductType = require('../../models/productType')
const config = require ('../../config')
const NodeGeocoder = require('node-geocoder')
const Device = require('../../models/device')
const Distributor = require('../../models/distributor')
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: config.googleApiKey,
    formatter: null
}
var geocoder = NodeGeocoder(options)

var getProductType = function (req, res, next) {
    var items = req.body.items
    
    if(!items) next()
    else {
        var total = items.length
        items.forEach(function(element, index) {
            var productCode = element.productCode
            ProductType.findOne({ code: productCode })
                        .exec((err, pt) => {
                            if(err) return res.status(500).send({ done: false, message: 'Ocurrió un error al buscar producto '})
                            if(!pt) return res.status(404).send({ done: false, message: 'El producto no existe ' + productCode })
                            req.body.items[index].productType = pt._id
                            total--
                            if(total == 0) {
                                return next()
                            }
                        })
        }, this);
    }
    
}
var getVehicleFromLicensePlate = function (req, res, next) {
    
    var licensePlate = req.body.licensePlate
    if(!licensePlate) next()
    else {
        Vehicle.findOne({ licensePlate: licensePlate })
                .exec((err, vehicle) => {
                    if(vehicle) {
                        req.body.vehicle = vehicle._id
                        req.body.originWarehouse = vehicle.warehouse
                    }
                    next()
                })
    }
}
var firstValidate = function (req, res, next) {
    var params = req.body
    if(!params.type) {
        return res.status(500).send({ done: false, message: 'Debe indicar un tipo de orden'})
    } else if(!params.client.nit) {
        return res.status(500).send({ done: false, message: 'Debe indicar nit del cliente'})
    } else if (!params.items || !params.items.length) {
        return res.status(500).send({ done: false, message: 'Debe entregar al menos 1 ítem'})
    }
    next()
}
const getDeviceFromPos = function (req, res, next) {
    let params = req.body
    if (!params.pos) return next();
    Device.findOne({ pos: params.pos }, (err, device) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar pos'})
        if(!device) return next();
        req.body.device = device._id
        return next();
    })    
}
const getDistributorByNit = function (req, res, next) {
    let params = req.body
    if(!params.distributorNit) return next();
    Distributor.findOne({ nit: params.distributorNit}, (err, distributor) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar distribuidor', err})
        if(!distributor) return next()
        req.body.distributor = distributor._id
        next();
    })
}
module.exports = {
    firstValidate,
    getProductType,
    getVehicleFromLicensePlate,
    getDeviceFromPos,
    getDistributorByNit
}