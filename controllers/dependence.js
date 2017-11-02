'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var Dependence = require('../models/dependence')
var Warehouse = require('../models/warehouse')
var Decrease = require ('../models/decrease')
var Distributor = require('../models/distributor')
var config = require('../config')

function getAll(req, res) {
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || '_id'
    var sord = req.query.sord || 1
    var filter = req.query.filter
    var distributor = req.params.distributor
    Dependence
            .find( distributor ? { distributor : distributor } : {})
            .where ( filter ? { name: { $regex: filter, $options: 'i' } }: {})
            .where({ virtual: { $ne: true }})
            .sort([[sidx, sord]])
            .populate({ path: 'distributor', model: Distributor, match: { _id: distributor } })
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
    Dependence.findById(id)
        .exec( (err, dependence) => {
            if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
            if(!dependence) return res.status(404).send({ done: false, message: 'No se pudo obtener el registro'})

            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        dependence 
                    })
        })
}
function saveOne (req, res) {
    
    var dependence = new Dependence()
    var params = req.body
    dependence.name = params.name
    dependence.address = params.address
    dependence.email = params.email
    dependence.phone = params.phone
    dependence.isPlant = params.isPlant
    dependence.distributor = params.distributor
    dependence.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        // Creating decrease warehouse
        if(config.autocreateDecreaseWarehouse)
        {
            var warehouse = new Warehouse()
            warehouse.name = params.name + ' - MERMAS'
            warehouse.dependence = stored._id
            warehouse.type = 'MERMAS'
            warehouse.save((errr, wh) => {
                if(errr) {
                    console.log(errr)
                    return res.status(500).send({ done: false, message: 'Ha ocurrido un error al crear la bodega de tipo MERMA', error: errr })
                }
                var decrease = new Decrease()
                decrease.warehouse = wh._id
                decrease.save((errrr, dc) => {
                    if(errrr) {
                        console.log(err)
                    }
                    return res
                            .status(200)
                            .send({ 
                                done: true, 
                                message: 'Registro guardado exitosamente', 
                                stored: stored,
                                mermas: wh,
                                decrease: dc
                            })
                })
                
            })
        }
        else
        {
            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'Registro guardado exitosamente', 
                        stored: stored,
                        warehouse: null
                    })
                    .end()
        }
        
    })
}
function updateOne(req, res) {
    var id = req.params.id
    var update = req.body
    Dependence.findByIdAndUpdate(id, update, (err, updated) => {
        if(err) return res.status(500).send({ done: false, message: 'Error en la petición'})
        if(!updated) return res.status(404).send({ done: false, message: 'No se pudo actualizar el registro'})
        
        return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'Registro actualizado exitosamente', 
                    updated 
                })
    })
}
function deleteOne(req, res){
    var id = req.params.id
    Dependence.findByIdAndRemove(id, (err, deleted) => {
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
function getWarehousesOfOne (req, res) {
    const dependence = req.params.id
    Warehouse.find({ dependence: dependence })
        .exec((err, warehouses) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
            return res.status(200).send({ done: true, message: 'OK', warehouses})
        })
}
module.exports = {
    getAll,
    getOne,
    saveOne,
    updateOne,
    deleteOne,
    getWarehousesOfOne
}  
