'use strict'

const Vehicle = require('../models/vehicle')
const Device = require('../models/device')
const User = require('../models/user')
function getVehicleFromDevice (req, res, next) {
    const device = req.body.device
    Device.findById(device, (err, dev) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar dispositivo', err, code: -1})
        if(!dev) return res.status(404).send({ done: false, message: 'No exite dispositivo', code: 1})

        User.findOne({ device: dev._id }, (err, user) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar usuario', err, code: -1})
            if(!user) return res.status(404).send({ done: false, message: 'No existe usuario asociado al dispositivo', code: 1 })

            Vehicle.findOne({ user: user._id }, (err, vehicle) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehículo', err, code: -1})
                if(!vehicle) return res.status(404).send({done: false, message: 'No existe vehículo asociado al dispositivo', code: 1})

                req.body.vehicle = vehicle._id
                next()
            })
        })
    })
}


function getVehicleFromLicensePlate (req, res, next) {
    const licensePlate = req.body.licensePlate
    Vehicle.findOne({ licensePlate: licensePlate, disabled: { $ne: true } }, (err, vehicle) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar vehiculo', err, code: -1})
        
        if(!vehicle) return res.status(404).send({ done: false, message: 'No existe un vehículo con la placa ' + licensePlate })

        req.body.vehicle = vehicle._id
        next();
    })
}

module.exports = { getVehicleFromLicensePlate, getVehicleFromDevice }