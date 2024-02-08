// const secureRouter = require('express').Router();

module.exports = (app) => {
  /* NO SECURE */
  // app.use('/auths', app.routes.auths);

  /* SECURE */

  // secureRouter.use('/', app.routes.secures);

  /* SET SECURE */
  // app.use('/secure', app.config.passport.authenticate(), secureRouter);
};
