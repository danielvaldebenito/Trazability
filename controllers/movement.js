'use strict'

const Transaction = require('../models/transaction')
const Movement = require('../models/movement')
const MovementItem = require('../models/movementItem')

// TODO: DESARROLLAR!!!!!!!!

function sectorization (req, res) {
    const body = req.body
    const origin = body.origin
    const destiny = body.destiny
    const nifs = body.nifs
    const type = body.type
    let transaction = new Transaction({
        type: type,
        movements: [
            new Movement({
                type: 'S',
                user: req.user.username,
                warehouse: origin,
                // transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
                items: [{ type: Schema.Types.ObjectId, ref: 'MovementItem' }]
            }),
            new Movement({

            })
        ]
    })

}