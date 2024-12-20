require('dotenv').config();

module.exports = {
    DB_USER : process.env.DB_USER,
    DB_PASSWORD : process.env.DB_PASSWORD,
    DB_NAME : process.env.DB_NAME,
    DB_HOST : process.env.DB_HOST,
    DB_PORT : process.env.DB_PORT,
  DB_DEPLOY: process.env.DB_DEPLOY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  WOMPI_EVENT_KEY: process.env.EVENTS_SECRET_KEY,
  USERNAME: process.env.USERNAME,
  ACCESS_KEY: process.env.ACCESS_KEY,
  PORT: process.env.PORT,
  PARTNER_ID: process.env.PARTNER_ID,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  WOMPI_PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY,
  WOMPI_PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY,
  WOMPI_INTEGRITY_SECRET: process.env.WOMPI_INTEGRITY_SECRET,
  WOMPI_EVENT_KEY: process.env.WOMPI_EVENT_KEY,
  TAXXA_EMAIL: process.env.TAXXA_EMAIL,
  TAXXA_PASSWORD: process.env.TAXXA_PASSWORD
};
