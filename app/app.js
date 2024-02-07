const app = require('express')();
const cors = require('cors');
const consign = require('consign');
const winston = require('winston');
const { uuidv4 } = require('uuid');

app.use(cors());

app.env = process.env.NODE_ENV || 'production';

app.address = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
};

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

app.use(({ name, message, stack }, req, res, next) => {
  try {
    if (name === 'validationError') res.status(400).json({ error: message });
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
