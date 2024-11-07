const express = require('express');
const router = express.Router();
const statService = require('../lib/service/statService');

router.get('/', (req, res) => {
    console.log('/stat/');
    statService.stat(req, res);

});

module.exports = router;