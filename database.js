require('dotenv').config();
const config = {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};
if (process.env.DATABASE_URL) {
  config.url = process.env.DATABASE_URL;
  config.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
} else {
  config.host     = process.env.DB_HOST;
  config.port     = parseInt(process.env.DB_PORT) || 5432;
  config.database = process.env.DB_NAME;
  config.username = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}
module.exports = { development: config, test: config, production: config };
```
→ Click **Commit**

### 3. Create `.sequelizerc` in root
Click **Add file** → **Create new file** → type:
```
.sequelizerc
