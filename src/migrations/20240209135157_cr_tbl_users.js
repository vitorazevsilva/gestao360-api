/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('name', 255);
  table.string('email', 255).unique();
  table.string('password', 60);
  table.smallint('active').defaultTo(0);
  table.string('created_by', 255).nullable();
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.string('updated_by', 255);
  table.timestamp('updated_at').defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('users');
