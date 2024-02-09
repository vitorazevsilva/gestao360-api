const { validator } = require('validator');
const { ValidationError } = require('../utils/Errors');

module.exports = (/* app */) => {
  const errors = [];
  const signup = (data) => {
    if (!data.personal.name) errors.push('personal.name');
    if (!data.personal.email) errors.push('personal.email');
    if (!data.personal.password) errors.push('personal.password');
    if (!data.enterprise.name) errors.push('enterprise.name');
    if (!data.enterprise.email) errors.push('enterprise.email');
    if (!data.enterprise.nif) errors.push('enterprise.nif');
    if (!data.enterprise.address) errors.push('enterprise.address');
    if (!data.enterprise.cp) errors.push('enterprise.cp');
    if (!data.enterprise.locality) errors.push('enterprise.locality');
    if (!data.enterprise.country) errors.push('enterprise.country');

    if (errors.length > 0) throw new ValidationError('Preencha todos os campos em falta!', errors);
  };
  return { signup };
};
