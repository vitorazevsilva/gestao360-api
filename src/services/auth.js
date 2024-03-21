const {
  matches, isEmail, isStrongPassword, isVAT, isPostalCode, isAlpha, isMobilePhone, isURL,
} = require('validator');
const bcrypt = require('bcryptjs');
const getRandomString = require('get-random-string');
const { v5: uuidv5, validate: uuidVal } = require('uuid');
const moment = require('moment');
const { ValidationError } = require('../utils/Errors');
const { sendWithTemplate } = require('../utils/Mailer');

const getPasswdHash = (pwd) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pwd, salt);
};

const getTempCode = () => getRandomString({
  size: 6,
  config: {
    lower: false,
    upper: true,
    number: true,
    special: false,
  },
});
module.exports = (app) => {
  const signup = async (data, timeTest = false) => {
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

    if (errors.length > 0) throw new ValidationError('Corrija todos os campos inválidos!', errors);

    if (!isStrongPassword(data.personal.password, {
      minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
    })) throw new ValidationError('A palavra-passe inserida não é suficientemente segura!', 'personal.password');

    if (data.personal.password !== data.personal.confirmPassword) throw new ValidationError('As palavras-passe não coincidem!', 'personal.confirmPassword');

    let exist;

    exist = await app.db('users').where({ email: data.personal.email }).first(['email']);

    if (exist) throw new ValidationError('Email já registado no sistema!', 'personal.email', data.personal.email);

    exist = await app.db('enterprises').where({ email: data.enterprise.email }).orWhere({ nipc: data.enterprise.nipc }).first(['email', 'nipc']);

    if (exist && exist.email === data.enterprise.email) errors.push({ error: 'Email já registado no sistema!', field: 'enterprise.email', value: data.enterprise.email });
    if (exist && exist.nipc.toString() === data.enterprise.nipc) errors.push({ error: 'NIPC(NIF/VAT) já registada no sistema!', field: 'enterprise.nipc', value: data.enterprise.nipc });

    if (errors.length > 0) throw new ValidationError('Empresa já registada no sistema!', errors);

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

    const timer = timeTest ? 1500 : 300000;

    const verifyCode = getTempCode();
    const verifyId = uuidv5(personalData.email, app.secret);
    const expires = moment().add(timer - 500, 'milliseconds').toDate();

    await app.db('email_verifications').insert({
      uniq_id: verifyId,
      user_id: personalData.id,
      code: verifyCode,
      expires_at: expires,
    });
    const interval = setInterval(async () => {
      const { verified, uniq_id: uniqId, expires_at: expiresAt } = await app.db('email_verifications').where({ user_id: personalData.id }).first(['verified', 'uniq_id', 'expires_at']);
      if (verified === 0 && moment(expiresAt).isBefore(moment())) {
        await app.db('email_verifications').where({ uniq_id: uniqId }).delete();
        await app.db('enterprises').where({ id: enterpriseData.id }).delete();
        await app.db('users').where({ id: personalData.id }).delete();
        await sendWithTemplate({
          to: personalData.email,
          subject: 'Conta Cancelada por Atraso na Verificação',
          template: 'timeout_email',
          data: {
            userName: personalData.name,
            userEmail: personalData.email,
            userEnterprise: enterpriseData.name,
          },
        });

        clearInterval(interval);
      } else if (verified === 1) {
        clearInterval(interval);
      }
    }, timer);
    await sendWithTemplate({
      to: personalData.email,
      subject: 'Código de Verificação para Confirmação de E-mail',
      template: 'check_email',
      data: {
        userName: personalData.name,
        verifyCode,
        userEmail: personalData.email,
        userEnterprise: enterpriseData.name,
      },
    });
    return {
      personal: { ...personalData },
      enterprise: { ...enterpriseData },
      verify: {
        uniq_id: verifyId,
        code: verifyCode,
        expires_at: expires,
      },
    };
  };

  const resend = async (uniqId) => {
    if (!uniqId || !uuidVal(uniqId)) throw new ValidationError('ID Unico tem um formato Invalido!', 'uniq_id', uniqId);

    const info = await app.db('email_verifications')
      .join('users', 'email_verifications.user_id', '=', 'users.id')
      .join('enterprises', 'users.id', '=', 'enterprises.owner')
      .select('email_verifications.*', 'users.email as user_email', 'users.name as user_name', 'enterprises.name as enterprise_name')
      .where({ 'email_verifications.uniq_id': uniqId })
      .first();

    if (!info) throw new ValidationError('ID Unico Desconhecido!', 'uniq_id', uniqId);

    const expires = moment().add(5, 'minutes').toDate();

    await app.db('email_verifications').where({ uniq_id: uniqId }).update({
      expires_at: expires,
    });

    await sendWithTemplate({
      to: info.email,
      subject: 'Código de Verificação para Confirmação de E-mail',
      template: 'check_email',
      data: {
        userName: info.name,
        verifyCode: info.code,
        userEmail: info.email,
        userEnterprise: info.name,
      },
    });
    return {
      uniq_id: uniqId,
      code: info.code,
      expires_at: expires,
    };
  };
  return { signup, resend };
};
