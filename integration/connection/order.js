'use strict'

const soap = require('soap')
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
const createOrderWsdl = __dirname + '/../wsdl/creaPedido_ws.wsdl'
const loginService = require('../connection/login')

function createOrder(order, algo) {
    if(!order) return
    console.log({order, algo})
    const p = new Promise(function(resolve, reject) {
    
        soap.createClient(createOrderWsdl, function(err, client) {
            if(err) throw new Error(err);
            const sHeader = { SessionHeader: { sessionId: '00D0x000000CnMC!AQ4AQPxySff64PP_fFOTdeQAVItyl3ZgRDQlS0Tqbqwo7rOpmw6g483FT4dbhc1OhKwhNa0t.VPvb5.W9FVhMxsv8FaPIxzZ' }};
            client.addSoapHeader(sHeader, '', 'tns', '')
            
            const args = {
                clienteExiste: 'NO',
                tipoCuenta: '',
                nombreCliente: order.client.name,
                apellidosCliente: order.client.surname,
                tipoDocumentoCta: order.client.nit,
                noDocumento: 'Registrado',
                idSalesforceCta: null,
                direccionCta: order.address.location,
                departamentoCta: order.address.region, // CAPS
                ciudadCta: order.address.city, // caps
                TelefonoCta: order.client.phone,
                noPedidoBO: order.orderNumber,
                tipoPedido: order.type,
                POS: order.device ? order.device.pos : '', // esn
                placaVehiculo: order.vehicle ? order.vehicle.licensePlate : '',
                Producto1: order.items[0].productType.code,
                CantidadProducto1: order.items[0].quantity,
                ValorUnitarioP1: order.items[0].price,
                ValorNegociableP1: order.items[0].negotiable,
                TotalP1: 0,
                Producto2: order.items[1] ? order.items[1].productType.code : '',
                CantidadProducto2: order.items[1] ? order.items[1].quantity : 0,
                ValorUnitarioP2: order.items[1] ? order.items[1].price : 0,
                ValorNegociableP2: order.items[1] ? order.items[1].negotiable : 0,
                TotalP2: 0,
                Producto3: order.items[2] ? order.items[2].productType.code : '',
                CantidadProducto3: order.items[2] ? order.items[2].quantity : 0,
                ValorUnitarioP3: order.items[2] ? order.items[2].price : 0,
                ValorNegociableP3: order.items[2] ? order.items[2].negotiable : 0,
                TotalP3: 0,
                Producto4: order.items[3] ? order.items[3].productType.code: '',
                CantidadProducto4: order.items[3] ? order.items[3].quantity : 0,
                ValorUnitarioP4: order.items[3] ? order.items[3].price : 0,
                ValorNegociableP4: order.items[3] ? order.items[3].negotiable : 0,
                TotalP4: 0,
                Importe: 0,
                Observacion: 'Sin observaciones'
            }
            
            client.creaPedido_mtd(JSON.stringify(args), (created) => console.log('respuesta wsdl', created))
        });

    });

    return p;

}

module.exports = { createOrder }