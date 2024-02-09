const router = require('express').Router();

module.exports = (app) => {
  router.post('/sign-up', (req, res, next) => {
    app.services.auth.signup(req.body)
      .then((user) => res.status(202).json(user))
      .catch((error) => next(error));
  });
  return router;
};
