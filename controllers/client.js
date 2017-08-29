'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Client = require('../models/client')
var Address = require('../models/address')
var DiscountSurcharge = require('../models/discountSurcharge')
function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var filter = req.query.filter
    Client
        //.find({ quick: undefined })
        .find()
        .populate('discountSurcharges')
        .where(filter ? {
            $or: [
                { nit: { $regex: filter, $options: 'i' } },
                { name: { $regex: filter, $options: 'i' } },
                { surname: { $regex: filter, $options: 'i' } },
                { completeName: { $regex: filter, $options: 'i' } },
                { address: { $regex: filter, $options: 'i' } },
                { city: { $regex: filter, $options: 'i' } },
                { region: { $regex: filter, $options: 'i' } },
                { email: { $regex: filter, $options: 'i' } },
                { phone: { $regex: filter, $options: 'i' } }
            ]
        } : {})
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

function getAllFromSelect(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var filter = req.query.filter
    Client.find({ quick: { $ne: true } })
        .where(filter ? {
            $or: [
                { nit: { $regex: filter, $options: 'i' } },
                { name: { $regex: filter, $options: 'i' } },
                { surname: { $regex: filter, $options: 'i' } },
                { address: { $regex: filter, $options: 'i' } },
                { city: { $regex: filter, $options: 'i' } },
                { region: { $regex: filter, $options: 'i' } },
                { email: { $regex: filter, $options: 'i' } },
                { phone: { $regex: filter, $options: 'i' } }
            ]
        } : {})
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
                    formatter: JSON.stringify(records),
                    total: total
                })


        })
}

function getOne(req, res) {
    var id = req.params.id
    Client.findById(id)
        .exec((err, client) => {
            if (err) return res.status(500).send({ done: false, message: 'Error en la petición' })
            if (!client) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro' })

            return res
                .status(200)
                .send({
                    done: true,
                    message: 'OK',
                    client
                })
        })
}
function saveOne(req, res) {
    var client = new Client()
    var params = req.body
    client.nit = params.nit
    client.name = params.name
    client.surname = params.surname
    client.phone = params.phone
    client.email = params.email
    client.address = params.address
    client.region = params.region
    client.city = params.city
    client.contact = params.contact
    client.completeName = params.surname ? params.name + ' ' + params.surname : params.name
    client.discountSurcharges = params.discountSurcharge
    client.save((err, stored) => {
        if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if (!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        return res
                    .status(200)
                    .send({
                        done: true,
                        message: 'Registro guardado exitosamente',
                        stored: stored
                    })

    })
}

function saveOneQuick(req, res) {
    var client = new Client()
    var params = req.body
    var falseNit = Math.random().toString(36).slice(2)
    client.nit = falseNit
    client.name = params.name
    client.phone = params.phone
    client.address = params.address
    client.region = params.region
    client.city = params.city
    client.quick = true
    client.save((err, stored) => {
        if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if (!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        return res
            .status(200)
            .send({
                done: true,
                message: 'Registro guardado exitosamente',
                stored: stored
            })
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    update.completeName = update.surname ? update.name + ' ' + update.surname : update.name
    Client.findByIdAndUpdate(id, update, (err, updated) => {
        if (err) return res.status(500).send({ done: false, message: 'Error en la petición' })
        if (!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro' })
        
        return res
            .status(200)
            .send({
                done: true,
                message: 'OK',
                updated
            })
    })
}
function deleteOne(req, res) {
    var id = req.params.id
    Client.findByIdAndRemove(id, (err, deleted) => {
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
function validateNit(req, res) {
    Client
        .findOne({ nit: req.params.nit })
        .exec((err, client) => {
            if (err) return res.status(500).send({ message: 'Error al validar nit', error: err })
            return res.status(200).send({ exists: client != null })
        })
}
module.exports = {
    getAll,
    getOne,
    saveOne,
    saveOneQuick,
    updateOne,
    deleteOne,
    validateNit
}  