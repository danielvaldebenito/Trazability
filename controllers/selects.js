'use strict'
var config = require('../config');
var fs = require('fs')
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


module.exports = {
    getvehicleTypes,
    initialDataToDevice,
    getCountryData
}