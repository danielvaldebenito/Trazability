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

/* Crea un cliente (1) */
var findClient = function(req, res, next)
{
    var body = req.body
    
    var nit = body.document
    Client.findOne({ nit: nit })
          .exec((err, client) => {
            //if(err) return res.status(500).send({ done: false, message: 'Ocurrió un error al buscar cliente en nuestra base de datos', err })    
            if(client) {
                req.body.client = client._id
                next ()
            } else {
                var c = new Client()
                c.nit = nit;
                c.phone = body.phone;
                c.address = body.address;
                c.region = body.region;
                c.city = body.city;
                c.quick = true;
                c.save((err, stored) => {
                    if(stored) {
                        req.body.client = stored._id 
                    } 
                    next ()
                })
            }
          })
}
/**
 * Busca coordenadas de una dirección
 * Retorna: req.body.placeId, req.body.coordinates (lat, lng)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var findCoord = function(req, res, next) {
    
    var body = req.body
    var address = req.body.address
    var region = req.body.region
    var city = req.body.city
    var country = config.country;
    var completeAddress = `${address}, ${city}, ${region}, ${country}`
    geocoder.geocode(completeAddress)
        .then(res => {
            console.log(res)
            var data = res[0]
            req.body.coordinates = {
                lat: data.latitude,
                lng: data.longitude
            }
            req.body.placeId = data.extra.googlePlaceId
            next()
        })
        .catch(err => {
            console.log(err)
            next()
        })
}

var getProductType = function (req, res, next) {
    var items = req.body.items
    
    if(!items) next()
    else {
        items.forEach(function(element, index) {
            var productCode = element.productCode
            ProductType.findOne({ code: productCode })
                        .exec((err, pt) => {
                            if(err) return res.status(500).send({ done: false, message: 'Ocurrió un error al buscar producto '})
                            if(!pt) return res.status(404).send({ done: false, message: 'El producto no existe ' + productCode })
                            req.body.items[index].productType = pt._id
                            next()
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
                    }
                    next()
                })
    }
}

module.exports = {
    findClient,
    findCoord,
    getProductType,
    getVehicleFromLicensePlate
}