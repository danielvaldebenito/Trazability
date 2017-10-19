'use strict'

const Product = require('../models/product')
const Stock = require('../models/stock')
const MovementItem = require('../models/movementItem')
const Warehouse = require('../models/warehouse')
const Vehicle = require('../models/vehicle')
const Address = require('../models/address')
const Store = require('../models/store')
const Decrease = require('../models/decrease')
const InternalProcess = require('../models/internalProcess')
const config = require('../config')

function getOneByNif (req, res) {
    const nif = req.params.nif
    const limit = req.query.limit || 10
    Product
        .findOne({ $or: [ { nif: nif }, { formatted: nif } ] })
        .populate('productType')
        .exec((err, product) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar producto', err})
            if(!product) 
                return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe ' + nif})
            
            Stock
                .findOne({ product: product._id })
                .populate('warehouse')
                .exec((err, stock) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar stock del producto', err})
                    if(!stock) return res.status(404).send({ done: false, code: 1, message: 'El producto existe pero no se encuentra en ninguna bodega existente'})
                    if(!stock.warehouse) return res.status(404).send({ done: false, code: 1, message: 'No se encontró bodega correspondiente.', product})
                    MovementItem
                        .find({ product: product._id })
                        .sort([['createdAt', -1]])
                        .populate({
                            path: 'movement',
                            options: {
                                sort: { 'type': -1 }
                            },
                            populate: [
                                {
                                    path: 'transaction'
                                },
                                {
                                    path: 'warehouse'
                                }
                            ]
                        })
                        
                        .limit(limit)
                        .exec((err, movs) => {
                            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar los moviemientos del producto', err})
                            if(!movs) return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe'})
                            
                            var promise = getWarehouseByType(stock.warehouse._id)
                            promise
                            .then(response => {
                                res.status(200)
                                .send({
                                    done: true, 
                                    code: 0,
                                    message: 'OK',
                                    data: {
                                        product,
                                        movs,
                                        stock,
                                        response
                                    }
                                })
                                
                            }, error => {
                                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener bodega por tipo', error})
                            })
                            .catch(reason => {
                                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener bodega por tipo', reason})
                            })
                            
                })
        })
    })


}

function getWarehouseByType(id) {
    const types = config.entitiesSettings.warehouse.types
    //types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
    let p = new Promise((resolve, reject) => {
        try {
            Warehouse.findById(id, (err, wh) => {
                if(err) reject(err)
                else {
                    const type = wh.type
                    switch (type) {
                        case types[0]: 
                            Vehicle.
                                findOne({ warehouse: id })
                                .populate('distributor')
                                .exec((err, vehicle) => {
                                    if (err) {
                                        console.log(err);
                                        reject(err)
                                    }
                                    
                                    if(!vehicle) reject ('No se encontró vehículo para la bodega de tipo vehículo')
                                    return resolve({ type, vehicle})
                                })
                        break;
                        case types[1]: 
                            Address
                            .findOne({ warehouse: id })
                            .populate('client')
                            .exec((err, address) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!address) reject('No se encontró dirección para la bodega de tipo dirección')
                                resolve({ type, address})
                            })
                        break;
                        case types[2]: 
                            Store
                                .findOne({ warehouse: id })
                                .populate('dependence')
                                .exec((err, store) => {
                                    if(err) {
                                        console.log(err);
                                        reject(err)
                                    }
                                    
                                    if(!store) reject('No se encontró almacén para la bodega de tipo almacén')
                                    resolve({ type, store})
                            })
                        break;
                        case types[3]: 
                            Decrease.findOne({ warehouse: id }, (err, decrease) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!decrease) reject('No se encontró bodega de mermas para la bodega de tipo mermas')
                                resolve(decrease)
                            })
                        break;
                        case types[4]: 
                            InternalProcess
                            .findOne({ warehouse: id })
                            .populate('dependence')
                            .populate('internalProcessType')
                            .exec((err, internalProcess) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!internalProcess) reject('No se encontró bodega de procesos internos para la bodega de tipo procesos internos')
                                resolve({ type, internalProcess})
                            })
                        break;
                        default: reject('El tipo de bodega no corresponde')
                    }
                }
            })
        } catch (err) {
            console.log(err);
            reject(err)
        }

        
    })
    
   return p;
}

module.exports = { getOneByNif }