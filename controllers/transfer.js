'use strict'

const Transfer = require('../models/transfer')

function saveOne (req, res) {
    const body = req.body
    const licensePlate = req.body.destinationLocation
    Transfer.update({ licensePlate: licensePlate }, { active: false }, { $multi: true }, (err, raw)  => {
        if(err) return res.status(500).send({ code: -1, done: false, message: 'Error ocurrido al actualizar transferencias a no activas', err })
        
        const transfer = new Transfer({
            originDependence: body.originDependence,
            licensePlate: licensePlate,
            vehicle: body.vehicleId,
            active: true,
            documents: body.documents
        })
    
        transfer.save((err, stored) => {
            if(err) return res.status(500).send({ code: -1, done: false, message: 'Error ocurrido al guardar transferencia', err })
            if(!stored) return res.status(404).send({ code: 1, done: false, message: 'No se pudo ingresar transferencia' })
            return res.status(200)
                    .send({
                        done: true,
                        message: 'Transferencia guardada exitosamente',
                        code: 0,
                        stored,
                        body: req.body
                    })
        })
    })

    
}
function saveStation (req, res) {
    const licensePlate = req.body.originLocation
    Transfer.findOne({ licensePlate: licensePlate, active: true }, (err, transfer) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al buscar transferencia', err, code: -1})
        if(!transfer) {
            return res.status(404).send({ done: false, message: 'No existe una transferencia activa para este vehículo', code: 1})
        } else {
            const station = {
                destinyDependence: req.body.destinationDependence,
                documents: req.body.documents,
                putUp: req.body.putUp,
                putDown: req.body.putUp
            }
            Transfer.update({ _id: transfer._id }, { $push: { stations: station } }, (err, raw) => {
                if(err) return res.status(500).send({ done: false, message: 'Error al actualizar transferencia', err, code: -1})

                return res.status(200)
                        .send({
                            done: true,
                            message: 'Transferencia actualizada correctamente',
                            code: 0,
                            body: req.body
                        })
            })
        }
    })
       
}
module.exports = { saveOne, saveStation }