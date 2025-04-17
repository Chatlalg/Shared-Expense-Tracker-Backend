import { createConnection } from "mysql2";

const connection_instance = () => {
    return createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
    })
}

export default connection_instance;