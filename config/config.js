const dotenv = require('dotenv');
const path = require('path');

// Determine the environment and set the correct .env file
const env = process.env.NODE_ENV || 'local';
const envFilePath = path.resolve(__dirname, `../.env.${env}`);
dotenv.config({ path: envFilePath });

// Export the configuration for sequelize-cli
module.exports = {
  [env]: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
};
