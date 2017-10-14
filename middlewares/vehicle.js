'use strict'

const Vehicle = require('../models/vehicle')
const Device = require('../models/device')
const User = require('../models/user')
function getVehicleFromDevice (req, res, next) { // And Get User
    const device = req.body.device
    if(!device) return next();
    Device.findById(device, (err, dev) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar dispositivo', err, code: -1})
        if(!dev) return res.status(404).send({ done: false, message: 'No exite dispositivo', code: 1})
        if(!dev.user) return res.status(404).send({ done: false, message: 'No hay usuario asociado al dispositivo', code: 1 })
        User.findById(dev.user, (err, user) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar usuario', err, code: -1})
            if(!user) return res.status(404).send({ done: false, message: 'No hay un usuario en línea asociado al dispositivo', code: 1 })
            if(!user.vehicle) {
                return next();
            }
            Vehicle.findById(user.vehicle, (err, vehicle) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehículo', err, code: -1})
                if(!vehicle) return res.status(404).send({done: false, message: 'No existe vehículo asociado al dispositivo', code: 1})

                req.body.vehicle = vehicle._id
                req.body.originWarehouse = vehicle.warehouse
                req.body.userName = user.name && user.surname ? user.name + ' ' + user.surname : ''

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