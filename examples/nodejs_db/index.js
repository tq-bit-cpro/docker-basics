const { Knex } = require('knex');
const os = require('os');
const app = require('express')();
/**
 * @type {Knex}
 */
const db = require('knex')({
	client: 'postgres',
	connection: {
		// Docker recognizes hostnames of containers mounted into the same network
		host: 'postgres',
		port: 5432,
		user: 'postgres',
		password: 'postgres',
		database: 'postgres',
	},
});

app.get('/user/create', async (req, res) => {
	await db.table('users').insert({ name: 'John Johnson' });
	return res.redirect('/');
});

app.get('/', async (req, res) => {
	const users = await db.table('users').select('*');
	const userList = users.map((user) => {
		return `<li>${user.id}: ${user.name}</li>`;
	});
	res.send(
		`<h2>Nodejs Application:</h2>
		 <ul>
			<li>Internal Host: ${os.hostname}</li>
			<li>External Host: http://localhost:8080</li>
			<li>OS Platform: ${os.platform} ${os.arch}</li>
		</ul>
		<h2>Postgres DB User</h2>
		<ul>${userList}</ul>
		<a href="/user/create">Create random user</a>
		`
	);
});

app.listen(8080, async () => {
	db.schema
		.createTableIfNotExists('users', (table) => {
			table.increments();
			table.string('name');
			table.timestamps();
		})
		.then(() => {
			console.log('Created table "users"');
		});
	console.log(`Internal Host: ${os.hostname}`);
	console.log('External Host: http://localhost:8080');
	console.log(`OS Platform: ${os.platform} ${os.arch}`);
});
