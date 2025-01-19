const  Router  = require('express');
const { handleMipaqueteWebhook } = require('../controller/handleMipaqueteWebhook');

const router = Router();

router.post('/mipaquete-webhook', handleMipaqueteWebhook);

 


module.exports = router;