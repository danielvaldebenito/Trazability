'use strict'
var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var FolioRank = require('../models/folioRank')
var Folio = require('../models/folio')
var config = require('../config')

function getAll (req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var distributor = req.params.distributor

    FolioRank
        .find({ distributor: distributor })
        .sort([[sidx, sord]])
        .paginate(page, limit, (err, records, total) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', err })
            if(!records) return res.status(404).send({ done: false, code: 1, message: 'No se encontró datos' })
            return res.status(200).send({done: true, code: 0, message: 'OK', data: { records, total }})
        })
}
function getOne (req, res) {
    var id = req.params.id

    FolioRank
        .findById(id)
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', err })
            if(!record) return res.status(404).send({ done: false, code: 1, message: 'No se encontró datos' })
            return res.status(200).send({done: true, code: 0, message: 'OK', data: record})
        })
}
function saveOne (req, res) {
    var body = req.body
    var start = body.start
    var end = body.end
    var distributor = body.distributor
    FolioRank.findOne({ distributor: distributor, $or: [ 
        { 
            start: { $gte: start, $lte: end } 
        },
        {
            end: { $gte: end, $lte: start }
        } 
    ] })
        .exec((err, found) => {
            if(err) return res.status(500).send({done: false, code: -1, message: 'Ha ocurrido un error', err})
            if(!found) {
                var folioRank = new FolioRank({
                    distributor: body.distributor,
                    start: start,
                    end: end
                });
                folioRank.save((err, saved) => {
                    var ok = start
                    for (var i = start; i <= end; i++) { 
                        var folio = new Folio ({
                            number: i,
                            folioRank: saved._id
                        })
                        folio.save((e, f) => { 
                            if(e) return res.status(500).send({ done: false, message: 'Ocurrió un error', error: e})  
                            FolioRank.update({_id: folioRank._id}, { $push: { folios: f }}, {safe: true, upsert: true, new : true}, (e, fr) => {
                                if(e) return res.status(500).send({done: false, code: -1, message: 'Ha ocurrido un error', err: e})
                                ok++
                                if(ok == end) {
                                    return res.status(200).send({done: true, code: 0, message: 'El rango de folios fue ingresado exitosamente', stored: saved})
                                }
                            })
                        })    
                    }
                })
                
            } else {
                return res.status(200).send({done: false, code: 1, message: 'El rango indicado incluye folios ya ingresados al sistema. Revise por favor'})
            }
        })
}

function deleteOne(req, res){
    var id = req.params.id
    FolioRank.findByIdAndRemove(id, (err, deleted) => {
        if(err) return res.status(500).send({ done: false, message: 'Error al eliminar el registro' })
        if(!deleted) return res.status(404).send({ done: false, message: 'No se pudo eliminar el registro' })
        var folios = Folio.find({ folioRank: deleted._id })
                            .remove((err, delFolios) => {
                                if(err) return res.status(500).send({ done: false, code: -1, message: 'No fue posible borrar los folios'})
                                return res
                                    .status(200)
                                    .send({ 
                                        done: true, 
                                        message: 'Registro eliminado', 
                                        deleted 
                                    })
                            })
        
    })
}

module.exports = {
    getAll, getOne, saveOne, deleteOne
}