const {
  matches, isEmail, isStrongPassword, isVAT, isPostalCode, isAlpha, isMobilePhone, isURL,
} = require('validator');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('../utils/Errors');

const getPasswdHash = (pwd) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pwd, salt);
};

module.exports = (app) => {
  const signup = async (data) => {
    const errors = [];

    if (!data.personal.name) errors.push({ error: 'O nome é um campo obrigatorio obrigatorio!', field: 'personal.name', value: data.personal.name });
    if (!data.personal.email) errors.push({ error: 'O email é um campo obrigatorio obrigatorio!', field: 'personal.name', value: data.personal.email });
    if (!data.personal.password) errors.push({ error: 'A palavra-passe é um campo obrigatorio obrigatorio!', field: 'personal.name', value: data.personal.password });
    if (!data.enterprise.name) errors.push({ error: 'O nome é um campo obrigatorio obrigatorio!', field: 'enterprise.name', value: data.enterprise.name });
    if (!data.enterprise.email) errors.push({ error: 'O email é um campo obrigatorio obrigatorio!', field: 'enterprise.email', value: data.enterprise.email });
    if (!data.enterprise.nipc) errors.push({ error: 'O NIPC(NIF/VAT) é um campo obrigatorio obrigatorio!', field: 'enterprise.nipc', value: data.enterprise.nipc });
    if (!data.enterprise.address) errors.push({ error: 'A morada é um campo obrigatorio obrigatorio!', field: 'enterprise.address', value: data.enterprise.address });
    if (!data.enterprise.cp) errors.push({ error: 'O codigo-postal é um campo obrigatorio obrigatorio!', field: 'enterprise.cp', value: data.enterprise.cp });
    if (!data.enterprise.locality) errors.push({ error: 'A localidade é um campo obrigatorio obrigatorio!', field: 'enterprise.locality', value: data.enterprise.locality });
    if (!data.enterprise.country) errors.push({ error: 'O país é um campo obrigatorio obrigatorio!', field: 'enterprise.name', value: data.enterprise.country });
    if (errors.length > 0) throw new ValidationError('Preencha todos os campos em falta!', errors);

    if (!matches(data.personal.name, /^([A-ZÀ-Ú][a-zà-ú]+\s)+[A-ZÀ-Ú][a-zà-ú]+$/g)) errors.push({ error: 'O nome inserido é invalido!', field: 'personal.name', value: data.personal.name });
    if (!isEmail(data.personal.email)) errors.push({ error: 'O email inserido é invalido!', field: 'personal.email', value: data.personal.email });
    if (!isEmail(data.enterprise.email)) errors.push({ error: 'O email inserido é invalido!', field: 'enterprise.email', value: data.enterprise.email });
    if ((!isVAT(data.enterprise.nipc, 'PT') && app.env !== 'test') || (app.env === 'test' && !matches(data.enterprise.nipc, /^\d{9}/gm))) errors.push({ error: 'O NIPC(NIF/VAT) inserido é invalido', field: 'enterprise.nipc', value: data.enterprise.nipc });
    if (!isPostalCode(data.enterprise.cp, 'PT')) errors.push({ error: 'O codigo-postal inserido é invalido!', field: 'enterprise.cp', value: data.enterprise.cp });
    if (!isAlpha(data.enterprise.locality, 'pt-PT', { ignore: '-s' })) errors.push({ error: 'A localidade inserida é invalida!', field: 'enterprise.locality', value: data.enterprise.locality });

    if (data.enterprise.telephone && !matches(data.enterprise.telephone, /^\+3512[1-9][0-9]{7}$/g)) errors.push({ error: 'O nº de telefone inserido é invalido!', field: 'enterprise.telephone', value: data.enterprise.telephone });
    if (data.enterprise.cellphone && !isMobilePhone(data.enterprise.cellphone, 'pt-PT')) errors.push({ error: 'O nº de telemovel inserido é invalido!', field: 'enterprise.cellphone', value: data.enterprise.cellphone });
    if (data.enterprise.fax && !matches(data.enterprise.fax, /^\+3512[1-9][0-9]{7}$/g)) errors.push({ error: 'O nº de Fax inserido é invalido!', field: 'enterprise.fax', value: data.enterprise.fax });
    if (data.enterprise.website && !isURL(data.enterprise.website, {
      protocols: ['http', 'https'], require_host: true, require_valid_protocol: true, validate_length: true, allow_query_components: false,
    })) errors.push({ error: 'O url do website inserido é invalido!', field: 'enterprise.website', value: data.enterprise.website });

    if (errors.length > 0) throw new ValidationError('Corrija todos os campos invalidos!', errors);

    if (!isStrongPassword(data.personal.password, {
      minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
    })) throw new ValidationError('A palavra-passe inserida não é suficientemente segura!', 'personal.password');

    if (data.personal.password !== data.personal.confirmPassword) throw new ValidationError('As palavras-passe não coincidem!', 'personal.confirmPassword');

    // TODO Create validation email e nif on db

    const personalData = {
      ...data.personal,
      password: getPasswdHash(data.personal.password),
      created_by: data.personal.name,
      updated_by: data.personal.name,
    };
    delete personalData.confirmPassword;

    const personalDB = await app.db('users').insert(personalData, '*');
    personalData.id = personalDB[0].id;

    const enterpriseData = {
      ...data.enterprise,
      owner: personalData.id,
      created_by: personalData.name,
      updated_by: personalData.name,
    };

    const enterpriseDB = await app.db('enterprises').insert(enterpriseData, '*');
    enterpriseData.id = enterpriseDB[0].id;
    console.log('%cauth.js line:69 personalData', 'color: #007acc;', enterpriseDB);
  };
  return { signup };
};
