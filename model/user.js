/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var UserSchema = require('../schemas/user');
var db = mongoose.createConnection('localhost', 'film');

var User = mongoose.model('User', UserSchema);

module.exports = User;
