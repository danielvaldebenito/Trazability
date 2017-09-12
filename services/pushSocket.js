'use strict'

var io = require('socket.io')(3549)

// Namespaces
var ordersNsp = io.of('/orders')

ordersNsp.on('connection', (socket) => {
  console.log('Socket connected', socket.id)
  var distributor = socket.request._query.distributor;
  if(distributor) {
    socket.join(distributor)
  }
  
})

function send(namespace, room, tag, data) {
  console.log('sending push notification', { namespace, room, tag, data })
  io.of(namespace).in(room).emit(tag, data)
}
module.exports = io;
module.exports = { send }

