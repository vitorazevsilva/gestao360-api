module.exports = function ValidationError(messageError, keys = []) {
  this.name = 'validationError';
  this.message = messageError;
  this.keys = keys || [];
};
