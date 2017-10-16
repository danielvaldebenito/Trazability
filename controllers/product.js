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
    Product.findOne({ nif: nif }, (err, product) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar producto', err})
        if(!product) 
            return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe ' + nif})
        
        Stock
            .findOne({ product: product._id })
            .populate('warehouse')
            .exec((err, stock) => {
                if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar stock del producto', err})
                if(!stock) return res.status(404).send({ done: false, code: 1, message: 'El producto existe pero no se encuentra en ninguna bodega existente'})
                if(!stock.warehouse) return res.status(404).send({ done: false, code: 1, message: 'No se encontró bodega'})
                MovementItem
                    .find({ product: product._id })
                    .populate({
                        path: 'movement',
                        populate: {
                            path: 'transaction'
                        },
                        populate: {
                            path: 'warehouse',
                            populate: { path: 'dependence' }
                        }
                    })
                    .limit(limit)
                    .exec((err, movs) => {
                        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar los moviemientos del producto', err})
                        if(!movs) return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe'})
                        
                        var promise = getWarehouseByType(stock.warehouse._id)
                        promise
                        .then(res => {
                            return res.status(200)
                            .send({
                                done: true, 
                                code: 0,
                                message: 'OK',
                                data: {
                                    product,
                                    movs,
                                    stock,
                                    res
                                }
                            })
                        })
                        .catch(reason => {
                            return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener bodega por tipo', reason})
                        })
                        
                })
        })
    })


}

function getWarehouseByType(id) {
    //const types = config.entitiesSettings.warehouse.types
    //types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
    // let p = new Promise((resolve, reject) => {
    //     try {
    //         Warehouse.findById(id, (err, wh) => {
    //             if(err) reject(err)
    //             else {
    //                 const type = wh.type
    //                 console.log('type', type)
    //                 switch (type) {
    //                     case types[0]: 
    //                         Vehicle.findOne({ warehouse: id }, (err, vehicle) => {
    //                             if (err) {
    //                                 console.log(err);
    //                                 reject(err)
    //                             }
                                
    //                             if(!vehicle) reject ('No se encontró vehículo para la bodega de tipo vehículo')
    //                             console.log('vehicle', vehicle)
    //                             return resolve(vehicle)
    //                         })
    //                     break;
    //                     case types[1]: 
    //                         Address.findOne({ warehouse: id }, (err, address) => {
    //                             if(err) {
    //                                 console.log(err);
    //                                 reject(err)
    //                             }
                                
    //                             if(!address) reject('No se encontró dirección para la bodega de tipo dirección')
    //                             resolve(address)
    //                         })
    //                     break;
    //                     case types[2]: 
    //                         Store.findOne({ warehouse: id }, (err, store) => {
    //                             if(err) {
    //                                 console.log(err);
    //                                 reject(err)
    //                             }
                                
    //                             if(!store) reject('No se encontró almacén para la bodega de tipo almacén')
    //                             resolve(store)
    //                         })
    //                     break;
    //                     case types[3]: 
    //                         Decrease.findOne({ warehouse: id }, (err, decrease) => {
    //                             if(err) {
    //                                 console.log(err);
    //                                 reject(err)
    //                             }
                                
    //                             if(!decrease) reject('No se encontró bodega de mermas para la bodega de tipo mermas')
    //                             resolve(decrease)
    //                         })
    //                     break;
    //                     case types[4]: 
    //                         InternalProcess.findOne({ warehouse: id }, (err, internalProcess) => {
    //                             if(err) {
    //                                 console.log(err);
    //                                 reject(err)
    //                             }
                                
    //                             if(!internalProcess) reject('No se encontró bodega de procesos internos para la bodega de tipo procesos internos')
    //                             resolve(internalProcess)
    //                         })
    //                     break;
    //                     default: reject('El tipo de bodega no corresponde')
    //                 }
    //             }
    //         })
    //     } catch (err) {
    //         console.log(err);
    //         reject(err)
    //     }

        
    // })
    return new Promise((resolve) => {
        
        resolve('OK')
    })
   
}

module.exports = { getOneByNif }