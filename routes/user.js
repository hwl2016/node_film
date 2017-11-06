const express = require('express');
const router = express.Router();
const _ = require('lodash');
const User = require('../model/user');
const Auth = require('../middleware/auth');

//用户注册
router.post('/signup', (req, res, next) => {
    var _user = req.body.user;

    User.find({name: _user.name}, (err, user) => {  //先查询一下看看是否已经有了已存在的用户名
        if(err) {
            console.log(err);
        }
        if(user.length != 0) {
            return res.redirect('/signin');
        }else {
            var user = new User(_user);
            user.save((err, user) => {
                if(err) {
                    console.log(err);
                }
                console.log(user);
                res.redirect('/');
            })
        }
    })

});

//用户登录
router.post('/signin', (req, res, next) => {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;

    User.findOne({
        name: name
    }, (err, user) => {
        if(err) {
            console.log(err);
        }
        if(!user) {
            return res.redirect("/signup");
        }
        user.comparePassword(password, (err, isMatch) => {
            if(err) {
                console.log(err);
            }
            if(isMatch) {
                req.session.user = user;
                return res.redirect("/");
            }else {
                console.log('Password is not matched');
                return res.redirect("/signin");
            }
        })

    })


});

//用户登出
router.get('/logout', (req, res, next) => {
    delete req.session.user;
    res.redirect('/');
});

//用户列表页
router.get('/list', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    User.fetch(function(err, users) {
        if(err) {
            console.log(err);
        }
        res.render('userList', {
            title: '用户列表页',
            users: users
        });
    });
});

module.exports = router;
