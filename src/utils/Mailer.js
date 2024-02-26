/* eslint-disable max-len */
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const mailerFile = require('../../mailerfile');

const ReadFile = promisify(fs.readFile);

module.exports = (app) => {
  /**
 * Envia um e-mail com um template HTML.
 * @async
 * @param {Object} options - Opções para enviar o e-mail.
 * @param {string} [options.from=process.env.MAIL_FROM] - O endereço de e-mail do remetente.
 * @param {string} options.to - O endereço de e-mail do destinatário.
 * @param {string} options.subject - O assunto do e-mail.
 * @param {string} options.template - O nome do template HTML a ser usado.
 * @param {Object} options.data - Os dados a serem usados para preencher o template.
 * @param {Array<Object>} [options.attachments] - Anexos opcionais a serem enviados com o e-mail.
 * @param {Object} [smtpServer=mailerFile[app.env]] - As configurações do servidor SMTP para enviar o e-mail.
 * @returns {Promise<Object>} Uma promessa que resolve com informações sobre o envio do e-mail.
 * @throws {Error} Se ocorrer um erro durante o envio do e-mail.
 */
  async function sendWithTemplate({
    from = process.env.MAIL_FROM || 'MEU NOVO AUTO <velma.rohan@ethereal.email>', to, subject, template, data, attachments,
  }, smtpServer = mailerFile[app.env]) {
    const ServerTransport = nodemailer.createTransport(smtpServer);

    const htmlFile = await ReadFile(path.join(__dirname, `../mails/${template}.html`), 'utf8');
    const htmlTemplate = handlebars.compile(htmlFile);
    const templateToSend = htmlTemplate(data);

    return ServerTransport.sendMail({
      from,
      to,
      subject,
      html: templateToSend,
      attachments,
    }).then((info) => info).catch((error) => new Error(error.message));
  }

  return { sendWithTemplate };
};
