module.exports = {
    clientUrl: 'http://trazabilidad.commzgate.co/',
    country: 'Colombia',
    secretjwt: 'commzgate1548',
    daysExpToken: 30,
    autocreateDecreaseWarehouse: true,
    googleApiKey: process.env.UNIGAS_TRAZABILIDAD_GOOGLEAPIKEY || 'AIzaSyCdo5HgF-LydsGMOxv4QEuSo9G24DlfgDU',
    erpKeyAccess: 'xrwp6y1oo1q',
    sendGridApiKey: process.env.UNIGAS_TRAZABILIDAD_SENDGRIDAPIKEY || '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',
    sendGridConfig: {
        senderMail: process.env.UNIGAS_TRAZABILIDAD_SENDGRIDSENDERMAIL ||  'daniel.valdebenito@commzgate-la.com'
    },
    pushNotifications: {
        codes: [
            { id: 1, description: 'NUEVO PEDIDO', title: 'Nuevo Pedido', message: 'Usted tiene un nuevo pedido' }
        ]
    },
    database: {
        name: 'unigastrazabilidad',
        port: process.env.PORT_DATABASE || 27017,
        server: 'localhost',
        user: 'unigas',
        password: '09v9085a'
    },
    integration: {
        sessionId: '',
        username: 'sistemas@unigas.com.co.developer',
        password: 'Sagan2020$',
        imports: {
            interval: 3600000,
            start: 1,
            end: 3
        }
    },
    entitiesSettings: {
        initialDataKey: 1,
        document: {
            types: ['FACTURA', 'GUÍA DE DESPACHO', 'ORDEN DE COMPRA', 'COMODATO', 'TCO']
        },
        inventoryAdjustment: {
            reasons: ['MOTIVO 1', 'MOTIVO 2']
        },
        maintenance: {
            reasons: ['EMBELLECIMIENTO', 'ESCAPE VÁLVULA', 'ESCAPE BRIDA', 'DAÑO VÁLVULA', 'BRIDA', 'ABOLLADURA', 'BASE', 'CUERPO', 'RETORNO OK']
        },
        order: {
            types: ['ENVASADO', 'GRANEL'],
            status: ['RECIBIDO', 'ASIGNADO', 'EN RUTA', 'ENTREGADO', 'CANCELADO'],
            reasons: ['Aún tiene suministro',
                'Cilindro de otra compañía',
                'Dirección errada',
                'El usuario cancela pedido',
                'El usuario no se encuentra',
                'El usuario no tiene dinero',
                'Pedido duplicado',
                'Zona de difícil acceso',
                'Gas Natural',
                'Tanque o instalación no Aptos para suministro'
            ],
            statesErp: [
                'Pendiente de programación',
                'Notificado al Conductor',
                'Pedido Cancelado',
                'Cerrada ganada'
            ],
            eventsHistory: ['CREACIÓN', 'ASIGNACIÓN', 'EN RUTA', 'ENTREGA', 'CANCELACIÓN', 'CONFIRMACIÓN CANCELACIÓN','NO ENTREGA', 'INFORMADO', 'REASIGNACIÓN'],
            maxProductTypesForOrder: 4,
            delayCommitted: {
                value: 1,
                time: 'hour'
            }
        },
        productType: {
            types: ['ENVASADO', 'GRANEL']
        },
        sale: {
            types: ['PROGRAMADO', 'CAMPANEO'],
            paymentMethods: ['EFECTIVO', 'DÉBITO', 'CRÉDITO']
        },
        settings: {
            keys: ['Alguna Configuración', 'Otra configuración']
        },
        transaction: {
            types: ['VENTA', 'AJUSTE', 'DEVOLUCIÓN', 'MANTENCIÓN', 'CARGA', 'DESCARGA', 'TRANSFERENCIA', 'ESTACIÓN']
        },
        user: {
            roles: ['ADMIN', 'VEHÍCULO', 'OPERADOR PLANTA']
        },
        vehicle: {
            types: ['ENVASADO', 'GRANEL']
        },
        warehouse: {
            types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
        }
    }
}