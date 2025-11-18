import express from 'express';
import pg from 'pg';

const masterClient = new pg.Client({
  host: process.env.POSTGRES_MASTER_HOST || 'postgres-master',
  port: parseInt(process.env.POSTGRES_MASTER_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'myuser',
  password: process.env.POSTGRES_PASSWORD || 'mypassword',
  database: process.env.POSTGRES_DB || 'mydatabase',
});

// default to Docker service names, fallback to localhost for local development
const defaultReplicaHosts = process.env.DOCKER_ENV
  ? 'postgres-replica-1:5432,postgres-replica-2:5432'
  : 'localhost:5433,localhost:5434';

const replicaHosts = (process.env.POSTGRES_REPLICA_HOSTS || defaultReplicaHosts).split(',');

const replicaPools = replicaHosts.map((hostPort, index) => {
  const [host, port] = hostPort.split(':');

  return new pg.Pool({
    host: host.trim(),
    // not the best way but it's ok for now
    port: parseInt(port?.trim() || (5433 + index)),
    user: process.env.POSTGRES_USER || 'myuser',
    password: process.env.POSTGRES_PASSWORD || 'mypassword',
    database: process.env.POSTGRES_DB || 'mydatabase',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
});

// round-robin replica selection
let replicaIndex = 0;

function getReplicaPool() {
  const pool = replicaPools[replicaIndex];

  replicaIndex = (replicaIndex + 1) % replicaPools.length;

  return pool;
}

/**
 * sql query function that routes based on read/write flag
 * readOnly: true = route to replica pool
 * readOnly: false = route to master
 */
async function query(text, params = [], options = { readOnly: true }) {
  if (options.readOnly) {
    const pool = getReplicaPool();

    return await pool.query(text, params);
  }

  return await masterClient.query(text, params);
}

masterClient.connect().catch(err => {
  console.error('Failed to connect to master:', err);
  process.exit(1);
});

// testing replica connections with a simple query
Promise.all(replicaPools.map((pool, index) =>
  pool.query('SELECT 1').then(() => {
    console.log(`Replica ${index + 1} connected`);
  }).catch(err => {
    console.error(`Failed to connect to replica ${index + 1}:`, err);
  })
));

const app = express();

const users = express.Router();

users.get('/search', async (req, res) => {
  const { firstName, lastName } = req.query;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Missing firstName or lastName' });
  }

  const queryText = `SELECT * FROM users WHERE first_name LIKE $1 AND last_name LIKE $2 ORDER BY id`;

  try {
    const result = await query(queryText, [`%${firstName}%`, `%${lastName}%`], { readOnly: true });

    res.json(result.rows);
  } catch (error) {
    console.error('Error reading from replica:', error);
    res.status(500).json({ error: 'Database read error' });
  }
});

users.get('/:id', async (req, res) => {
  const { id } = req.params;

  const queryText = `SELECT * FROM users WHERE id = $1`;

  try {
    const result = await query(queryText, [id], { readOnly: true });

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error reading from replica:', error);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.use('/users', users);

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('Master connection: ready for writes');
  console.log(`Replica pools: ${replicaPools.length} configured for reads`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    masterClient.end();
    replicaPools.forEach((pool, index) => {
      pool.end(() => {
        console.log(`Replica pool ${index + 1} closed`);
      });
    });
    process.exit(0);
  });
});


