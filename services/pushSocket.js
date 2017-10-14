'use strict'

const io = require('socket.io')(3549)

// Namespaces
const ordersNsp = io.of('/orders')
const vehicleNsp = io.of('/vehicles')

ordersNsp.on('connection', (socket) => {
  console.log('Socket connected to order namespace', socket.id)
  const distributor = socket.request._query.distributor;
  if(distributor) {
    socket.join(distributor)
  }
  
})
vehicleNsp.on('connection', (socket) => {
  console.log('Socket connected to vehicle namespace', socket.id)
  const distributor = socket.request._query.distributor;
  if(distributor) {
    socket.join(distributor)
  }
})
function send(namespace, room, tag, data) {
  console.log('sending push socket', { namespace, room, tag, data })
  io.of(namespace).in(room).emit(tag, data)
}
module.exports = io;
module.exports = { send }

