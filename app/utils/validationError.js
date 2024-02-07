module.exports = function ValidationError(messageError) {
  this.name = 'validationError';
  this.message = messageError;
};
