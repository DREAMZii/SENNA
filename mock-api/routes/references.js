var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  var response = require(__basedir + '/data/references.json');
  res.json(response);
});

module.exports = router;
