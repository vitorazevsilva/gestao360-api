const router = require('express').Router();

module.exports = (app) => {
  router.post('/sign-up', (req, res, next) => {
    app.services.auth.signup(req.body)
      .then((rslt) => res.status(201).json({ message: 'Codigo enviado por email', resendID: rslt.verify.uniq_id }))
      .catch((error) => next(error));
  });

  router.post('/resend', (req, res, next) => {
    app.services.auth.resend(req.body.uniq_id)
      .then((rslt) => res.status(200).json({ message: 'Codigo reenviado por email', resendID: rslt.uniq_id }))
      .catch((error) => next(error));
  });

  return router;
};
