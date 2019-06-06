var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  var response = require(__basedir + '/data/sentiment.json');
  res.json(response);
});

module.exports = router;
