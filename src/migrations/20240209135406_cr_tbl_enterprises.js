/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('enterprises', (table) => {
  table.increments('id').primary();
  table.string('name', 255);
  table.string('email', 255);
  table.integer('nipc', 9);
  table.string('address', 255);
  table.string('cp', 8);
  table.string('locality', 255);
  table.string('country', 255);
  table.string('website', 255).nullable();
  table.string('telephone', 16).nullable();
  table.string('cellphone', 16).nullable();
  table.string('fax', 16).nullable();
  table.integer('owner').references('id').inTable('users');
  table.string('created_by', 255);
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.string('updated_by', 255);
  table.timestamp('updated_at').defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('enterprises');
