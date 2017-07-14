'use strict'
var config = require('../config');
var fs = require('fs')
var Vehicle = require('../models/vehicle')
var Dependence = require('../models/dependence')
var mongoose = require('mongoose')
// .../api/select/vehicleTypes
function getvehicleTypes (req, res) {
    var types = config.entitiesSettings.vehicle.types;
    return res
        .status(200)
        .send({
            data: types
        })
}
function initialDataToDevice(req, res) {
    var distributor = req.params.distributor;
    var reasons = config.entitiesSettings.order.reasons;
    var paymentMethods = config.entitiesSettings.sale.paymentMethods;

    return res
            .status(200)
            .send({
                done: true,
                code: 0,
                data: {
                    reasons,
                    paymentMethods
                },
                message: 'OK'
            })
}

function getCountryData (req, res) {
    var data = JSON.parse(fs.readFileSync('./pais.json'))
    return res.status(200).send({data})
}
function getVehiclesToAsign (req, res) {
    var distributor = req.params.distributor;
    var type = req.query.type;
    Vehicle.find( type ? { type: type } : {})
        .populate ({ 
            path: 'warehouse',
            populate: { 
                path: 'dependence',
                populate: {
                    path: 'distributor',
                    match: distributor ? { '_id': distributor } : {}
                }
            }
        })
        .exec ((err, data) => {
            if(err) return res.status(500).send({ code : -1, done: false, message: 'Ha ocurrido un error', error: err })
            if(!data) return res.status(404).send({ code : 1, done: false, message: 'Error. La consulta no obtuvo datos'})

            res.status(200)
                .send({
                    done: true, 
                    message: 'OK',
                    data: data,
                    code: 0
                })
        })
}
function getDependences (req, res) {
    var distributor = req.query.distributor;
    Dependence.find(distributor ? { distributor: distributor }: {})
        .exec((err, data) => {
            if(err) return res.status(500).send({ code : -1, done: false, message: 'Ha ocurrido un error', error: err })
            if(!data) return res.status(404).send({ code : 1, done: false, message: 'Error. La consulta no obtuvo datos'})
                console.log('dependence', data)
            res.status(200)
                .send({
                    done: true, 
                    message: 'OK',
                    data: data,
                    code: 0
                })
        })
}
module.exports = {
    getvehicleTypes,
    initialDataToDevice,
    getCountryData,
    getVehiclesToAsign,
    getDependences
}