'use strict'

const Stock = require('../models/stock')
const Product = require('../models/product')
function getByNif(req, res) {
    const nif = req.params.nif
    Product.findOne({ nif: nif })
        .exec((err, product) => {
            if(err) return res.status(500).send({ done: false, message: 'Error al buscar un producto con el nif ' + nif, err, code: -1})
            
            if(!product) return res.status(404).send({ done: false, message: 'No existe producto con el NIF ' + nif, code: 1})
            
            Stock.find({ product: product._id })
                .populate('product')
                .populate('warehouse')
                .exec((err, stock) => {
                    if(err) return res.status(500).send({ done: false, message: 'Error al buscar stock para el nif ' + nif, err, code: -1})
                    
                    if(!stock) return res.status(404).send({ done: false, message: 'No existe stock para el NIF ' + nif, code: 1})
                    
                    return res.status(200)
                            .send({
                                done: true,
                                code: 0,
                                message: 'OK',
                                data: stock
                            })
                })
        })
}

module.exports = { getByNif }