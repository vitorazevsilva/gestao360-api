/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.alterTable('email_verifications', (table) => {
  table.string('token', 6).alter();
  table.renameColumn('token', 'code');
  table.renameColumn('expires_at', 'verified_at');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.alterTable('email_verifications', (table) => {
  table.string('code', 32).alter();
  table.renameColumn('code', 'token');
  table.renameColumn('verified_at', 'expires_at');
});
