const  Router  = require('express');
const { createGiftCard, getGiftCardBalance } = require('../controller/Caja/createGiftCard');
//const { getGiftCardBalance } = require('../controller/Caja/getGiftCardBalance');
const router = Router();

router.post('/createGift', createGiftCard);
router.get('/balance/:buyer_email', getGiftCardBalance);

module.exports = router;