function ValidationError(messageError, fields = undefined, value = undefined) {
  this.name = 'validationError';
  this.message = messageError;
  this.fields = typeof fields === 'string' ? [{ error: messageError, field: fields, value }] : fields;
}

module.exports = { ValidationError };
