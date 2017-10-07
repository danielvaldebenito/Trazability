'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Distributor = require('../models/distributor')
var User = require('../models/user')
var config = require('../config')
var mail = require('../services/mail')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '-intern'
    var sord = req.query.sord || 1
    var filter = req.query.filter
    var l = parseInt(limit)
    Distributor.find({ intern: false })
            .where(filter ? {
                $or: [
                    { name: { $regex: filter, $options: 'i' } },
                    { nit: { $regex: filter, $options: 'i' } },
                    { phone: { $regex: filter, $options: 'i' } },
                    { contact: { $regex: filter, $options: 'i' } }
                ] 
            }:
                 
            {})
            .sort([[sidx, sord]])
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
    Distributor.findById(id)
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
    
    var distributor = new Distributor()
    var params = req.body
    distributor.name = params.name
    distributor.nit = params.nit
    distributor.email = params.email
    distributor.contact = params.contact
    distributor.phone = params.phone
    distributor.image = params.image
    distributor.intern = false
    distributor.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        // Creating decrease warehouse
        const random = Math.random().toString(36).slice(2)
        const user = new User({
            name: params.name,
            surname: '',
            email: params.email,
            username: params.nit,
            tempPassword: random,
            isAdmin: true,
            distributor: stored._id,
            roles: ['ADMIN']
        })
        user.save((err, stored) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar usuario', error: err })
            if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro de usuario' })
            
            mail.sendMail(user.email,
                'Trazabilidad - Contraseña Temporal',
                random,
                params.name)

            return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro guardado exitosamente', 
                    stored: stored,
                })   
        })
             
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Distributor.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    updated 
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Distributor.findByIdAndRemove(id, (err, deleted) => {
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

module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne
}  
