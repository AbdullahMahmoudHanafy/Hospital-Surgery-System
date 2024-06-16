import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: "localhost",
    database: "surgery",
    port: 5432,
    user: "surgery",
    password: "12345"
})

export default pool;