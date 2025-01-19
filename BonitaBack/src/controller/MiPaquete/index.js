const createSending = require("./createSending");
const getLocations = require("./getLocations");
const getSendings = require("./getSending");
const quoteShipping = require("./quoteShipping");
const getSendingById = require("./getSendingById");
const generateApiKey = require("./generateApiKey");
const getSendingTracking = require("./getSendingTracking");
const cancelSending = require("./cancelSending");
const createDirection = require("./createDirection");

module.exports = {
  createSending,
  getLocations,
  getSendings,
  getSendingById,
  quoteShipping,
  generateApiKey,
  getSendingTracking,
  cancelSending,
  createDirection
};
