'use strict'

const soap = require('soap')
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
const createOrderWsdl = __dirname + '/../wsdl/cambioEtapaPedido_ws.wsdl'
const loginService = require('../connection/login')

function createOrder(order) {
    if(!order) return
    const p = new Promise(function(resolve, reject) {
        soap.createClient(apiWSDL, function(err, client) {
            if(err) throw new Error(err);
            
            const args = {
                clienteExiste: 'SI',
                tipoCuenta: 'Cuenta campaneo',
                nombreCliente: 'Francisco',
                apellidosCliente: 'Otarola Jimenez',
                tipoDocumentoCta: 'Cédula de ciudadanía',
                noDocumento: 'Registrado',
                idSalesforceCta: null,
                direccionCta: 'Calle 10 Carrera 15 #20',
                departamentoCta: 'CUNDINAMARCA', // CAPS
                ciudadCta: 'BOGOTÁ', // caps
                TelefonoCta: '2917720',
                noPedidoBO: '??',
                tipoPedido: 'Granel',
                POS: '',
                placaVehiculo: 'AAA000',
                Producto1: 'K9',
                CantidadProducto1: 1,
                ValorUnitarioP1: 3500,
                ValorNegociableP1: 3460,
                TotalP1: 425580,
                Producto2: 'K15',
                CantidadProducto2: 2,
                ValorUnitarioP2: 3500,
                ValorNegociableP2: 3460,
                TotalP2: 425580,
                Producto3: 'K9',
                CantidadProducto3: 3,
                ValorUnitarioP3: 3500,
                ValorNegociableP3: 3460,
                TotalP3: 425580,
                Producto4: 'K9',
                CantidadProducto4: 4,
                ValorUnitarioP4: 3500,
                ValorNegociableP4: 3460,
                TotalP4: 425580,
                Importe: 1213161,
                Observacion: 'Sin observaciones'
            }
            
            client.creaPedido_mtd({strPedido: JSON.stringify(args)}, (err, res) => console.log('respuesta wsdl', err, res))
        });

    });

    return p;

}

module.exports = { createOrder }