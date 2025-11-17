// api/config/sequelize-config.js
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const env = process.env.NODE_ENV || 'local';
// const envFilePath = path.resolve(__dirname, `../../.env.${env}`);
// dotenv.config({ path: envFilePath });

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
};


let dialectOptions = {};
if (env !== 'local') {
  const sslCertPath = path.resolve(__dirname, './DigiCertGlobalRootCA.crt.pem');
  dialectOptions = {
    ssl: {
      require: true,
      ca: fs.readFileSync(sslCertPath),
    },
  };
}

module.exports = {
  local: { ...baseConfig },
  live: { ...baseConfig, dialectOptions },
};
