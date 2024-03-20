const router = require('express').Router();

module.exports = (app) => {
  router.post('/sign-up', (req, res, next) => {
    app.services.auth.signup(req.body)
      .then((rslt) => res.status(201).json({ message: 'Codigo enviado por email', resendID: rslt.verify.uniq_id }))
      .catch((error) => next(error));
  });

  return router;
};
