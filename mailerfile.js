// Update with your config settings.

// Access Mail Box: https://ethereal.email/login

module.exports = {

  test: {
    pool: process.env.SMTP_POOL || false,
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_TLS || true, // use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PWD,
    },
  },
  stage: {
    pool: process.env.SMTP_POOL || false,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_TLS || true, // use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PWD,
    },
  },

};
