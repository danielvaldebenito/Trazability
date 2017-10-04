'use strict'


function OKMovement (req, res) {
    return res.status(200).send({ done: true, code: 0, message: 'Transacción realizada correctamente'})
}

module.exports = { OKMovement }