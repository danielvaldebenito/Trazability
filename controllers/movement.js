'use strict'


function OKMovement (req, res) {
    return res.status(500).send({ done: true, code: 0, message: 'Transacción realizada correctamente', body: req.body})
}

module.exports = { OKMovement }