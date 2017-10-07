'use strict'

const Transfer = require('../models/transfer')

function validateTransfer (req, res, next) {
    const licensePlate = req.body.originLocation
    Transfer.findOne({ licensePlate: licensePlate, active: true }, (err, transfer) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar transferencia', err, code: -1})
        if(!transfer) {
            return res.status(200).send({ done: false, message: 'No existe una transferencia activa para este vehículo', code: 1})
        }
        next();
    })
}

module.exports = { validateTransfer }