import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: 5432,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    ssl: false
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Conectado ao banco');
        return pool;
    } catch (error) {
        console.error('Erro de conexão com o banco', error);
        throw error;
    }
};

export default connectDB;