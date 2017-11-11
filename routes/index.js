const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Movie = require('../model/movie');
const Comment = require('../model/comment');
const Auth = require('../middleware/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    Movie.fetch(function(err, movies) {
        if(err) {
            console.log(err);
        }
        res.render('index', {
            title: '首页',
            movies: movies
        });
    })
});


router.get('/movie/:id', (req, res, next) => {
    var id = req.params.id;
    Movie.findById(id, (err, movie) => {
        if(err) {
            console.log(err);
        }

        Comment
            .find({movie: id})
            .populate('from', 'name')   // 使用populate来做关联查询
            .populate('reply.from reply.to', 'name')   // 使用populate来做关联查询
            .exec((err, comments) => {
                if(err) {
                    console.log(err);
                }
                // console.log(comments);
                res.render('detail', {
                    title: '电影-' + movie.title,
                    movie: movie,
                    comments: comments
                })
            })
    })

});

router.get('/admin/movie', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
	res.render('admin', {
		title: '电影后台录入页',
        movie: {
		    _id: '',
            title: '',
            doctor: '',
            country: '',
            language: '',
            poster: '',
            year: '',
            flash: '',
            summary: ''
        }
	})
});

//admin update movie
router.get('/admin/update/:id', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    var id = req.params.id;
    if(id) {
        Movie.findById(id, (err, movie) => {
        res.render('admin', {
            title: '后台更新页',
            movie: movie
        })
    })
    }
})

//新建&更新
router.post('/admin/movie/new', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;

    if(id) {    //更新操作
        Movie.findById(id, (err, movie) => {
            if(err) {
                console.log(err);
            }
            _movie = _.extend(movie, movieObj);
            _movie.save((err, movie) => {
                if(err) {
                    console.log(err);
                }
                res.redirect('/movie/' + movie._id);
            });
        })
    }else { //新增
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });

        _movie.save((err, movie) => {
            if(err) {
                console.log(err);
            }
            res.redirect('/movie/' + movie._id);
        })
    }

})

//列表页
router.get('/admin/list', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    Movie.fetch(function(err, movies) {
        if(err) {
            console.log(err);
        }
        res.render('list', {
            title: '电影列表页',
            movies: movies
        });
    });
});

//删除
router.delete('/admin/list', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    var id = req.body.id;

    if(id) {
        Movie.remove({_id: id}, (err, movie) => {
            if(err) {
                console.log(err);
            }else {
                res.json({
                    code: 200,
                    msg: 'success'
                })
            }

        });
    }

});

//注册页面
router.get('/signup', (req, res, next) => {
    res.render('signup', {
        title: '注册'
    })
});

//登录页面
router.get('/signin', (req, res, next) => {
    res.render('signin', {
        title: '登录'
    })
});

// Comment
router.post('/admin/comment', Auth.signinRequired, (req, res, next) => {
    var _comment = req.body.comment;
    var movieId = _comment.movie;
    var comment = new Comment(_comment);

    comment.save((err, comment) => {
        if(err) {
            console.log(err);
        }
        res.redirect(`/movie/${movieId}`);
    })

});

// 用户提交评论
router.post('/user/comment', Auth.signinRequired, (req, res, next) => {
    var _comment = req.body.comment;
    var movieId = _comment.movie;

    if(_comment.cid) {  // 用户回复
        Comment.findById(_comment.cid, (err, comment) => {
            var reply = {
                from: _comment.from,
                to: _comment.tid,
                content: _comment.content
            }

            comment.reply.push(reply)

            comment.save((err, comment) => {
                if(err) {
                    console.log(err);
                }
                res.redirect(`/movie/${movieId}`);
            })
        })
    }else { // 普通的评论
        var comment = new Comment(_comment);

        comment.save((err, comment) => {
            if(err) {
                console.log(err);
            }
            res.redirect(`/movie/${movieId}`);
        })
    }



});

module.exports = router;
