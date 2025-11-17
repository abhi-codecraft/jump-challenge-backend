const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Determine the environment and set the correct .env file
const env = process.env.NODE_ENV || 'local';
// const envFilePath = path.resolve(__dirname, `../../.env.${env}`);
// dotenv.config({ path: envFilePath });

// // Ensure all required environment variables are set
// const requiredEnvVariables = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_DIALECT'];
// requiredEnvVariables.forEach((variable) => {
//   if (!process.env[variable]) {
//     throw new Error(`Environment variable ${variable} is not set.`);
//   }
// });

let dialectOptions = {};

if (env !== 'local') {
  // Only include SSL config in non-local environments
  const sslCertPath = path.resolve(__dirname, './fullchain.pem');
  dialectOptions = {
    ssl: {
      require: true,
      ca: fs.readFileSync(sslCertPath), // Read the certificate file
    }
  };
}

// Create a new Sequelize instance using the environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || 'admin',
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone: '+00:00',
    dialectOptions,
  }
);

module.exports = sequelize;
