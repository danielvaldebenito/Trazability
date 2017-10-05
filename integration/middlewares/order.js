'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../../models/warehouse')
var Address = require('../../models/address')
var Vehicle = require ('../../models/vehicle')
var Client = require('../../models/client')
var ProductType = require('../../models/productType')
var config = require ('../../config')
var NodeGeocoder = require('node-geocoder')
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
                                next()
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
                        req.body.distributor = vehicle.distributor
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
module.exports = {
    firstValidate,
    getProductType,
    getVehicleFromLicensePlate
}