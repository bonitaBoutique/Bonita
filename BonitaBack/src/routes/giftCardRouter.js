const  Router  = require('express');
const { createGiftCard, getGiftCardBalance, deleteGiftCardsByEmail } = require('../controller/Caja/createGiftCard');
//const { getGiftCardBalance } = require('../controller/Caja/getGiftCardBalance');
const router = Router();

router.post('/createGift', createGiftCard);
router.get('/balance/:buyer_email', getGiftCardBalance);
router.delete('/delete/:buyer_email', deleteGiftCardsByEmail);

module.exports = router;