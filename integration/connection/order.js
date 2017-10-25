'use strict'

const soap = require('soap')
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
const createOrderWsdl = __dirname + '/../wsdl/creaPedido_ws.wsdl'
const loginService = require('../connection/login')

function createOrder(order, sessionId) {
    const p = new Promise(function(resolve, reject) {
    
        soap.createClient(createOrderWsdl, function(err, client) {
            if(err) throw new Error(err);
            const sHeader = { SessionHeader: { sessionId: sessionId }};
            client.addSoapHeader(sHeader, '', 'tns', '')
            
            const args = {
                clienteExiste: 'NO',
                tipoCuenta: 'Cuenta Empresas',
                nombreCliente: order.client.name,
                apellidosCliente: order.client.surname,
                tipoDocumentoCta: 'Cédula de ciudadanía',
                noDocumento: order.client.nit,
                idSalesforceCta: null, // 0010x000002IS9y
                direccionCta: order.address.location ? order.address.location.toUpperCase() : '',
                departamentoCta: order.address.region ? order.address.region.toUpperCase() : '', // SIN TILDES
                ciudadCta: order.address.city ? order.address.city.toUpperCase() : '', // SIN TILDES
                TelefonoCta: order.client.phone,
                noPedidoBO: order.orderNumber.toString(),
                tipoPedido: order.type == 'ENVASADO' ? 'Cilindro Individual' : 'Granel',
                POS: order.device ? order.device.esn : '', // esn * para pruebas usar pos006
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
            let list = [];
            list.push(args)
            const send = {
                invoiceList: list
            }
            client.creaPedido_mtd({ strIdPedido: JSON.stringify(send)}, (err, respuesta) => {
                console.log({err, respuesta})
            });
        }); 

    });

    return p;

}

function replaceTildes(str) {
    str.replace('á', 'a')
        .replace('é', 'e')
        .replace('í', 'i')
        .replace('ó', 'o')
        .replace('ú', 'u')
}
module.exports = { createOrder }