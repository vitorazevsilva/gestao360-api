const app = require('./app');

app.server = app.listen(app.address.port, app.address.host, () => {
  app.logger.info(`Server is running at ${app.address.secure === true ? 'https' : 'http'}://${app.address.host}:${app.address.port}`);
});
