'use strict'
const mongoose = require('mongoose')
const InternalProcess = require('../models/internalProcess')
const Warehouse = require('../models/warehouse')
const Dependence = require('../models/dependence')
function getAll (req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var filter = req.query.filter
    var distributor = req.params.distributor
    InternalProcess
        .find()
        .populate({
            path: 'warehouse',
            populate: {
                path: 'dependence',
                match: {
                    distributor: distributor
                }
            }
        })
        .populate({
            path: 'dependence',
            match: {
                distributor: distributor
            }
        })
        .populate('internalProcessType')
        .where(filter ? { name: {  $regex: filter, $options: 'i' } } : {})
        .sort([[sidx, sord]])
        .paginate(page, limit, (err, records, total) => {
            if (err)
                return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err })
            if (!records)
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
function getByDependence(req, res) {
    const dependence = req.params.dependence
    InternalProcess.find({dependence: dependence})
        .populate({
            path: 'warehouse', 
            populate: { 
                path: 'dependence'
            } 
        })
        .populate('internalProcessType')
        .exec((err, records) => {
            if(err) return res.status(500).send({done: false, code: -1, message: 'Ha ocurrido un error', err})
            
            return res.status(200).send({done: true, records, code: 0, message: 'OK'}) 
        })
}
function getByDependenceAndTypes(req, res) {
    const dependence = req.params.dependence
    const types = req.params.types
    const typesArr = types? types.split(',') : []
    InternalProcess.find({dependence: dependence, internalProcessType: { $in: typesArr }})
        .populate({
            path: 'warehouse', 
            populate: { 
                path: 'dependence'
            } 
        })
        .populate('internalProcessType')
        .exec((err, records) => {
            if(err) return res.status(500).send({done: false, code: -1, message: 'Ha ocurrido un error', err})
            
            return res.status(200).send({done: true, records, code: 0, message: 'OK'}) 
        })
}
function getOne (req, res) {
    const id = req.params.id
    InternalProcess.findById(id)
        .populate({
            path: 'warehouse',
            populate: 'dependence'
        })
        .exec((err, found) => {
            if(err) return res.status(500).send({done: false, code: -1, message: 'Ha ocurrido un error', err})
            if(!found) return res.status(404).send({ code: 1, message: 'No se encontró registro', done: false})
            return res.status(200).send({done: true, record: found, code: 0, message: 'OK'}) 
        })
}
function saveOne(req, res) {

    var name = req.body.name;
    var type = req.body.type;
    var dependence = req.body.dependence
    var warehouse = req.body.warehouse
    InternalProcess
        .findOne({name: name })
        .populate({ path: 'warehouse', match: {dependence: dependence }})
        .exec((error, ip) => {
            if(ip) {
                Warehouse.findByIdAndRemove(warehouse, (err, removed) => {
                    return res.status(200)
                        .send({
                            done: false,
                            message: `Ya existe un proceso llamado ${name} para la dependencia`,
                            code: 1 
                        })
                })
                
            } else {
                var internalProcess = new InternalProcess({
                    name: name,
                    warehouse: warehouse,
                    internalProcessType: type,
                    dependence: dependence
                })
                internalProcess.save((err, stored) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ocurrió un error al guardar proceso interno', err, code: -1})
                    if(!stored)
                        return res.status(404).send({ done: false, message: 'No se pudo guardar', code: 1 })
                    else
                        return res.status(200)
                                .send({
                                    done: true,
                                    message: 'Proceso interno guardado exitosamente',
                                    code: 0,
                                    stored
                                })
                })
            }
        })
}

function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    update.internalProcessType = update.type
    InternalProcess
    .findOne({name: update.name, _id: { $ne: id } })
    .populate({ path: 'warehouse', match: {dependence: update.dependence }})
    .exec((error, ip) => {
        if(ip) {
            return res.status(200)
            .send({
                done: false,
                message: `Ya existe otro proceso llamado ${update.name} para la dependencia`,
                code: 1 
            })
            
        } else {
            InternalProcess.findByIdAndUpdate(id, update, (err, updated) => {
                if (err) return res.status(500).send({ done: false, message: 'Error en la petición' })
                if (!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro' })
                Warehouse.findByIdAndUpdate(updated.warehouse, { name: update.name }, (err, wh) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
                    return res
                    .status(200)
                    .send({
                        done: true,
                        message: 'OK',
                        updated
                    })
                })
                
            })
        }
    })
    
}
function deleteOne(req, res) {
    var id = req.params.id
    InternalProcess.findByIdAndRemove(id, (err, deleted) => {
        if (err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if (!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })

        return res
            .status(200)
            .send({
                done: true,
                message: 'Registro eliminado',
                deleted
            })
    })
}

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne,
    getByDependence,
    getByDependenceAndTypes
}