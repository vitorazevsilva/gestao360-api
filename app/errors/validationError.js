module.exports = function ValidationError(messageError, inputs = []) {
  this.name = 'validationError';
  this.message = messageError;
  this.inputs = inputs || [];
};
