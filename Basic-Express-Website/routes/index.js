var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', text: 'Hello' });
});

router.get('/index/:text', function(req, res, next) {
  res.render('index', { title: 'Express', text: req.params.text });
});

module.exports = router;
