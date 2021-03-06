(function() {
  var AuthorActivity, dir, fs, hash, input, path;

  fs = require('fs');

  path = require('path');

  dir = path.join(path.dirname(fs.realpathSync(__filename)), '../example-data');

  input = fs.readFileSync(dir + '/author/marias-run.json', 'utf8');

  hash = JSON.parse(input);

  AuthorActivity = require('./author/author-activity').AuthorActivity;

  exports.activity = new AuthorActivity(hash);

}).call(this);
