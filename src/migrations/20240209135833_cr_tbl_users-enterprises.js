/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('users_enterprises', (table) => {
  table.integer('user_id').references('id').inTable('users');
  table.integer('enterprise_id').references('id').inTable('enterprises');
  table.primary(['user_id', 'enterprise_id']);
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('users_enterprises');
