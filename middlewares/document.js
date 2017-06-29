'use strict'

var mongoose = require('mongoose')
var Document = require('../models/document')
var createDocument = function(req, res, next) {
    var document = new Document()
    document.type = req.body.typeDocument
    document.folio = req.body.folio
    document.save((err, doc) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.document = doc._id
        next();
    })
}

module.exports = {
    createDocument
}