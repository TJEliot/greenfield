var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : 'ec2-107-21-236-219.compute-1.amazonaws.com',
    port     : '5432',
    user     : 'cbynyfyzqijang',
    password : '8c6297aa7776b22a621ccd662335336cc9425d6e6af1522f0e865c78c0c14190',
    database : 'd5ho0tp7qdq1dd',
    charset  : 'utf8'
  }
});

// connect with database selected
knex.schema.createTableIfNotExists('users', function (table) {
  table.string('username');
  table.string('password');
  table.string('name');
  table.string('email');
  table.increments('id');
  table.timestamps('created_at');
  table.timestamps('last_login');
  table.string('age');
  table.string('profilepic');
  table.string('biography');
  table.string('name');
})
.then(function() {
 });
var DB = require('bookshelf')(knex);

module.exports.DB = DB;


