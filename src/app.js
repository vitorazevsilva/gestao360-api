const app = require('express')();
const cors = require('cors');
const consign = require('consign');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const DiscordTransport = require('winston-discord-webhook');
const knex = require('knex');

const knexFile = require('../knexfile');

const webhookUrls = {
  test: 'https://discord.com/api/webhooks/1204584965715787846/HdKedRXuzhslWB74aIGkQHBxbbTiJq7OH8wgsbQVpqjdXW4l7-nZ4hafGPZcKhpz4J2d',
  development: 'https://discord.com/api/webhooks/1204586195913277511/Gba9znB4Oz3HAAzePktorU9rKpqulkWCdXc09PFaRG_JKFAxfyXWbpAx5tCXJEdYVbbB',
  stage: 'https://discord.com/api/webhooks/1205526293504991282/bmHh2Ukpq48RduSKZJd2gYT2Tq9Gft6Mq6brtzbyoDT69_9PyggsY3wMeM2ySLZI3umq',

};

app.use(cors());

app.env = process.env.NODE_ENV || 'production';

app.secret = process.env.MY_SECRET || '8e57747e-a7b3-4719-8e98-fc821fde55fc';

app.address = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
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
    new DiscordTransport({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json({ space: 1 }),
      ),
      webhook: webhookUrls[app.env],
      mode: 'hybrid',
      colors: new Map([
        ['info', '#32a852'],
        ['warn', '#f2aa4b'],
        ['error', '#fa1f14'],
      ]),
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
      host: app.address.host,
      port: app.address.port,
      environment: app.env,
      secure: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      time_now: `${String(date.getFullYear())}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours(),
      ).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0',
      )}:${String(date.getSeconds()).padStart(2, '0')}`,
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
      res.status(500).json({ id, error: 'System Error!' });
    }
  } catch (err) {
    next();
  }
});
app.use((req, res) => res.status(404).json({ error: 'Pedido Desconhecido!' }));

module.exports = app;
