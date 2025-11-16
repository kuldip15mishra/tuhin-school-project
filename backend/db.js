const { Pool } = require("pg");
const DATABASE_URL = "postgresql://tuhin:2U1nqodIM1jW7o5ugf3rVsI83MICOCrk@dpg-d4ch40c9c44c738qjcr0-a.oregon-postgres.render.com/aluminidb"

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
