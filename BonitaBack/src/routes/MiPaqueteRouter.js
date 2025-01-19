const { Router } = require('express');
const getLocations = require('../controller/MiPaquete/getLocations');
const quoteShipping = require('../controller/MiPaquete/quoteShipping');
const createSending = require('../controller/MiPaquete/createSending');
const  getSendings  = require('../controller/MiPaquete/getSending');
const getSendingById = require('../controller/MiPaquete/getSendingById');
const generateApiKey = require('../controller/MiPaquete/generateApiKey');
const router = Router();

router.get('/locations', getLocations);
router.post('/quote', quoteShipping);
router.post('/create-sending', createSending);
router.post('/sending', getSendings);
router.post('/sendings/:id', getSendingById);
router.post('/generate-api-key', generateApiKey);

module.exports = router;