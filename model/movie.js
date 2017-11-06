/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie');
var db = mongoose.createConnection('localhost', 'film');

var Movie = db.model('Movie', MovieSchema);

module.exports = Movie;
