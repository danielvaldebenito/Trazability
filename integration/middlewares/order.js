'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../../models/warehouse')
var Address = require('../../models/address')
var Vehicle = require ('../models/vehicle')
var Client = require('../../models/client')
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
            }
            next ()
          })
}
/**
 * Busca coordenadas de una dirección
 * Retorna: req.body.placeId, req.body.coordinates (lat, lng)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var findCoord = function(req, res, next)
{
    var body = req.body
    var address = req.body.address
    var region = req.body.region
    var city = req.body.city
    var country = config.country;
    var completeAddress = `${address}, ${city}, ${region}, ${country}`
    geocoder.geocode(completeAddress)
        .then(res => {
            console.log(res)
            next()
        })
        .catch(err => {
            console.log(err)
            next()
        })
}
module.exports = {
    findClient,
    findCoord
}