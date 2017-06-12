module.exports = {
    secretjwt: 'commzgate1548',
    daysExpToken: 30,
    database: {
        name: 'trazability',
        port: process.env.PORT_DATABASE || 27017,
        server: 'localhost'
    },
    entitiesNames: {
        distributor: {
            singular: 'contratista',
            plural: 'contratistas',
            gender: 'F'
        },
        zone: {
            singular: 'zona',
            plural: 'zonas',
            gender: 'F'
        },
        user: {
            singular: 'usuario',
            plural: 'usuarios',
            gender: 'M'
        },
        dependence: {
            singular: 'local de venta',
            plural: 'locales de venta',
            gender: 'M'
        },
        warehouse: {
            singular: 'almacén',
            plural: 'almacenes',
            gender: 'M',
            types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACEN', 'MERMAS', 'PROCESO_INTERNO']
        },
        transaction: {
            singular: 'transacción',
            plural: 'transacciones',
            gender: 'F',
            types: ['VENTA', 'AJUSTE', 'DEVOLUCIÓN']
        },
        order: {
            singular: 'pedido',
            plural: 'pedidos',
            gender: 'M',
            types: ['ENVASADO', 'GRANEL'],
            status: ['RECIBIDO', 'ASIGNADO A VEHÍCULO', 'RECIBIDO EN RUTA', 'ENTREGADO', 'NO ENTREGADO']
        },
        sale: {
            singular: 'venta',
            plural: 'ventas',
            gender: 'F',
            types: ['POR PEDIDO', 'CAMPANEO'],
            paymentMethods: ['EFECTIVO', 'DÉBITO', 'CRÉDITO']
        }
        
    }
}