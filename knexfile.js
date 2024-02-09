// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: '127.0.0.1',
      port: 6001,
      database: 'postgres',
      user: 'myUser',
      password: 'myPasswd',
    },
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'src/migrations/',
    },
    seeds: {
      directory: 'src/seeds/',
    },
  },
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: '127.0.0.1',
      port: 6002,
      database: 'postgres',
      user: 'myUser',
      password: 'myPasswd',
    },
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'src/migrations/',
    },
    seeds: {
      directory: 'src/seeds/',
    },
  },
  stage: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'src/migrations/',
    },
    seeds: {
      directory: 'src/seeds/',
    },
  },
};
