const express = require('express');
const router = express.Router();
const statService = require('../lib/service/statService');

router.get('/', (req, res) => {
    console.log('/stat/');
    statService.stat(req, res);

});

router.get('/monthly', (req, res) => {
    console.log('/stat/monthly');
    statService.monthly(req, res);
});

router.get('/region', (req, res) => {
    console.log('/stat/region');
    statService.region(req, res);
});

module.exports = router;