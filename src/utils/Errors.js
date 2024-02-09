function ValidationError(messageError, fields = undefined) {
  this.name = 'validationError';
  this.message = messageError;
  this.fields = fields;
}

module.exports = { ValidationError };
