import express from 'express';
import pg from 'pg';

const client = new pg.Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
});

client.connect();

const app = express();

const users = express.Router();

users.get('/search', async (req, res) => {
  const { firstName, lastName } = req.query;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Missing firstName or lastName' });
  }

  const queryText = `SELECT * FROM users WHERE first_name LIKE $1 AND last_name LIKE $2 ORDER BY id`;

  const query = await client.query(queryText, [`%${firstName}%`, `%${lastName}%`]);

  res.json(query.rows);
});

users.get('/:id', async (req, res) => {
  const { id } = req.params;

  const queryText = `SELECT * FROM users WHERE id = $1`;

  const query = await client.query(queryText, [id]);

  if (!query.rows.length) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(query.rows[0]);
});

app.use('/users', users);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


