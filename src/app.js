require('dotenv').config();
const app = require('express')();
const cors = require('cors');
const consign = require('consign');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');

const knexFile = require('../knexfile');

app.use(cors());

app.env = process.env.NODE_ENV || 'production';
if (!process.env.MY_SECRET) throw new Error('Env. MY_SECRET is required');
if (!process.env.MAIL_FROM) throw new Error('Env. MAIL_FROM is required');
app.secret = process.env.MY_SECRET;

app.address = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
  hostname: process.env.HOSTNAME || `http://localhost:${process.env.PORT}`,
  secure: process.env.SSL || false,
};

app.db = knex(knexFile[app.env]);

app.logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.json({ space: 1 }),
    }),
    new winston.transports.File({
      level: 'error',
      filename: `./logs/${app.env}.log`,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json({ space: 1 }),
      ),
    }),
  ],
});

consign({ cwd: 'src', verbose: false })
  .include('./config/middlewares.js')
  .include('./services')
  .include('./routes')
  .include('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  const date = new Date();
  res.status(200).json({
    message: 'Welcome to Gestão 360',
    server_info: {
      hostname: app.address.hostname,
      host: app.address.host,
      port: app.address.port,
      secure: app.address.secure,
      environment: app.env,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      time_now: `${String(date.getFullYear())}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours(),
      ).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0',
      )}:${String(date.getSeconds()).padStart(2, '0')}`,
      commit: process.env.RENDER_GIT_COMMIT || undefined,
    },
  });
});

app.use(({
  name, message, fields, stack,
}, req, res, next) => {
  try {
    if (name === 'validationError') res.status(400).json({ error: message, fields });
    else {
      const id = uuidv4();
      app.logger.error(`${id}:${name}\n${message}\n${stack}`);
      res.status(500).json({ id, error: `Ocorreu um erro interno no servidor. Por favor, entre em contacto com o suporte técnico e forneça o seguintes id: ${id}` });
    }
  } catch (err) {
    next();
  }
});
app.use((req, res) => res.status(404).json({ error: 'Pedido Desconhecido!' }));

module.exports = app;
