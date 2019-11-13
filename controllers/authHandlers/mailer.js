const sendgrid = require('@sendgrid/mail');


const sendMailTo = async options => {
    // set the api key for sendgrid
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    // 1. send the email
    await sendgrid.send(options);
}

module.exports = sendMailTo;
