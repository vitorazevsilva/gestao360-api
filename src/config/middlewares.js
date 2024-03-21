const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_MS || 30 * 60 * 1000,
  limit: process.env.RATE_LIMIT || 100,
  message: {
    error: 'Demasiados pedidos, tente novamente mais tarde!',
  },
  legacyHeaders: false,
  standardHeaders: 'draft-7',
});

module.exports = (app) => {
  app.use(limiter);
  app.use(bodyParser.json());
};
