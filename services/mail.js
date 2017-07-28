var config = require('../config')
var helper = require('sendgrid').mail;
var fromEmail = new helper.Email(config.sendGridConfig.senderMail, 'Unigas');
var sg = require('sendgrid')(config.sendGridApiKey);

function sendMail (to, subject, temp, name) {
    var toEmail = new helper.Email(to);
    var content = new helper.Content('text/html', `
            <img src="http://www.unigas.com.co/sites/default/files/logo_unigas_home_200px_76px.png">
            <h3>Hola ${name}</h3>
            <h5>Te hemos enviado tu contraseña temporal:</h5>
            <p>${temp}</p>
            <h5>Ingresa al sistema con tu nombre de usuario y esta contraseña. Luego crea tu propia contraseña</h5>
            <hr>
            <small>No respondas este correo, es sólo informativo</small>
        `)
    var mail = new helper.Mail(fromEmail, subject, toEmail, content);
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });
    sg.API(request, function (error, response) {
        if (error) {
            console.log('Error response received');
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
}

module.exports = { sendMail}