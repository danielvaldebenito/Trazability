'use strict'
var Enumerable = require('linq')
var list = [
    {
        id: 1,
        name: 'Jose Pérez',
        age: 18,
        admin: false
    },
    {
        id: 2,
        name: 'Luis Valdés',
        age: 31,
        admin: true
    },
    {
        id: 3,
        name: 'Ramón Fernández',
        age: 46,
        admin: false
    }
]
function getList(req, res) {
    
    return res.status(200)
                .send({
                    data: list
                })
}

function getOne (req, res) {
    var id = req.params.id
    var item = Enumerable.from(list)
                .firstOrDefault((x) => { return x.id == id })
    
    return res.status(200)
                .send({
                    data: item
                })
}

module.exports = {
    getList,
    getOne
}