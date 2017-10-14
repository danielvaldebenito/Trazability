'use strict'

const Product = require('../models/product')
const Stock = require('../models/stock')
const MovementItem = require('../models/movementItem')

function getOneByNif (req, res) {
    const nif = req.params.nif
    const limit = req.query.limit || 10
    Product.findOne({ nif: nif }, (err, product) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar producto', err})
        if(!product) 
            return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe ' + nif})
        
        Stock.findOne({ product: product._id }, (err, stock) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar stock del producto', err})
            if(!stock) return res.status(500).send({ done: false, code: -1, message: 'El producto existe pero no se encuentra en ninguna bodega existente'})

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
                .exec((err, movs) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar los moviemientos del producto', err})
                    if(!movs) return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe'})
                
                    return res.status(200)
                            .send({
                                done: true, 
                                code: 0,
                                message: 'OK',
                                data: {
                                    product,
                                    movs,
                                    stock
                                }
                            })

                })
        })
    })


}

module.exports = { getOneByNif }