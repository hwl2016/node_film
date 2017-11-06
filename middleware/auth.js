/**
 * Created by huwl on 2017/7/22.
 */

//登录
exports.signinRequired = function(req, res, next) {
    var user = req.session.user;
    if(!user) {
        return res.redirect('/signin');
    }
    next();
};

exports.adminRequired = function(req, res, next) {
    var user = req.session.user;
    if(user.role <= 10) {
        return res.redirect('/signin');
    }
    next();
};
