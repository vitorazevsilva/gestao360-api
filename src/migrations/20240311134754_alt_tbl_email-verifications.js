/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.alterTable('email_verifications', (table) => {
  table.string('uniq_id', 36).unique();
  table.timestamp('verified_at');
  table.string('token', 6).alter();
  table.renameColumn('token', 'code');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.alterTable('email_verifications', (table) => {
  table.dropColumn('uniq_id');
  table.dropColumn('verified_at');
  table.string('code', 32).alter();
  table.renameColumn('code', 'token');
});
