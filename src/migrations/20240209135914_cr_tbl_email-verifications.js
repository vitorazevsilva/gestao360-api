/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('email_verifications', (table) => {
  table.integer('user_id').references('id').inTable('users');
  table.string('token', 32);
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('expires_at');
  table.smallint('verified').defaultTo(0);
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('users_enterprises');
