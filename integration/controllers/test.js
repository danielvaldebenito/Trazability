'use strict'

function testget(req, res) {
    res.status(200).send({ done: true, code: 0, message: 'Método GET correcto' });
}
function testpost(req, res) {
    var data = req.body
    console.log(data);
    res.status(200).send({ done: true, code: 0, message: 'Método POST correcto', data: data });
}

module.exports = { 
    testget, testpost
}