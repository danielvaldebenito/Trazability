'use strict'

const Vehicle = require('../models/vehicle')

function getVehicleFromLicensePlate (req, res, next) {
    const licensePlate = req.body.licensePlate
    Vehicle.findOne({ licensePlate: licensePlate }, (err, vehicle) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar vehiculo', err, code: -1})
        req.body.vehicle = vehicle._id
        next();
    })
}

module.exports = { getVehicleFromLicensePlate }