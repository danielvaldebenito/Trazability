'use strict'

const Transaction = require('../models/transaction')
function getOne (req, res) {
    const id = req.params.id
    Transaction.findById(id)
        .populate({
            path: 'movements',
            populate: {
                path: 'items',
                populate: {
                    path: 'product'
                }
            },
            populate: {
                path: 'warehouse'
            }
        })
        .exec((err, record) => {
            if(err) return res.status(500).send({ done: false, message: 'Error de sistema', code: -1, err})
            if(!record) return res.status(404).send({ done: false, code: 1, message: 'No se encontró registro'})
            return res.status(200)
                    .send({
                        done: true,
                        message: 'OK',
                        data: record,
                        code: 0
                    })
        })
}

module.exports = { getOne }