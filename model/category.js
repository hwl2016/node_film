/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var CategorySchema = require('../schemas/Category');
// var db = mongoose.createConnection('localhost', 'film');

var Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
