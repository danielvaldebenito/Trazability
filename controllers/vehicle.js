'use strict'

const path = require('path')
const mongoose = require('mongoose')
const pagination = require('mongoose-pagination')
const User = require('../models/user')
const Vehicle = require('../models/vehicle')
const Transfer = require('../models/transfer')
const Warehouse = require('../models/warehouse')
const Dependence = require('../models/dependence')
const Distributor = require('../models/distributor')
const config = require('../config')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var distributor = req.params.distributor
    var filter = req.query.filter;
    Vehicle
        .find(filter ?  { "licensePlate": { "$regex": filter, "$options": "i" } } : {})
        .where(distributor ? { distributor: distributor } : {})
        .sort([[sidx, sord]])
        .populate({
            path: 'warehouse',
            model: Warehouse,
            populate: {
                path: 'dependence',
                model: Dependence
            }
        })
        .populate('user')
        .populate('distributor')
        .paginate(page, limit, (err, records, total) => {
            if(err)
                return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
            if(!records)
                return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
            
            return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    data: records, 
                    total: total
                })
            
            
        })
}
function getOne (req, res) {
    var id = req.params.id
    Vehicle.findById(id)
        .populate('warehouse')
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!record) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        record 
                    })
        })
}
function saveOne (req, res) {

    var vehicle = new Vehicle()
    var params = req.body
    vehicle.licensePlate = params.licensePlate
    vehicle.trademark = params.trademark
    vehicle.capacity = params.capacity
    vehicle.type = params.type
    vehicle.warehouse = params.warehouse
    vehicle.user = params.user
    vehicle.distributor = params.distributor
    vehicle.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        if(params.user) {
            User.findByIdAndUpdate(params.user, { vehicle: stored._id }, (err, updatedUser) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar usuario seleccionado', error: err })
            })
            Vehicle.update(
                { user: params.user, _id: { $ne: stored._id }}, 
                { user: undefined }, 
                { multi: true }, 
                (err, raw) => {
                    if(err) console.log(err)
                    console.log('raw', raw)
            })
        }
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    stored: stored,
                })        
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Vehicle.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Error en la petición', error: err})
        if(!updated) return res.status(404).send({ done: false, code: 1, message: 'No se pudo actualizar el registro'})
        if(update.user) {
            User.findByIdAndUpdate(update.user, { vehicle: updated._id }, (err, updatedUser) => {
                if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar usuario seleccionado', error: err })
            })
            Vehicle.update(
                { user: update.user, _id: { $ne: updated._id }}, 
                { user: undefined }, 
                { multi: true }, 
                (err, raw) => {
                    if(err) console.log(err)
                    console.log('raw', raw)
            })
        }
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro editado exitosamente', 
                    data: updated,
                    code: 0
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Vehicle.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })
        
        return res
            .status(200)
            .send({ 
                done: true, 
                message: 'Registro eliminado', 
                deleted 
            })
        
    })
}

function validateForLicensePlate(req, res) {
    const licensePlate = req.params.licensePlate
    const transfer = req.query.transfer
    Vehicle.findOne({ licensePlate: licensePlate })
        .exec((err, vehicle) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehículo', code: -1, err})
            if(!vehicle) return res.status(404).send({ done: false, message: 'No existe vehículo con la placa: ' + licensePlate, code: 1})
            
            if(transfer) {
                Transfer.findOne({ licensePlate: licensePlate, active: true })
                    .exec((err, transfer) => {
                        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar transferencia', code: -1, err})
                        if(!transfer) return res.status(404).send({ done: false, message: 'No existe transferencia activa para la placa: ' + licensePlate, code: 1})
                        
                        return res.status(200).send({ done: true, message: 'Vehículo existe', vehicle, transfer, code: 0})
                    })
            } else {
                return res.status(200).send({ done: true, message: 'Vehículo existe', vehicle, code: 0})
            }
        })
}

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne,
    validateForLicensePlate
}  
