const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Movie = require('../model/movie');
const Category = require('../model/category');
const Comment = require('../model/comment');
const Auth = require('../middleware/auth');

const Index = require('../controllers/index');

/* GET home page. */
router.get('/', Index.index);


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

router.get('/admin/movie/new', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    Category.find({}, (err, categories) => {
        if(err) {
            console.log(err);
        }
        res.render('admin', {
            title: '电影后台录入页',
            categories: categories,
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
    })

});

router.get('/admin/category/new', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    res.render('category_admin', {
        title: '电影分类后台录入页',
        category: {}
    })
});

router.get('/admin/category/list', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    Category.fetch(function(err, categories) {
        if(err) {
            console.log(err);
        }
        res.render('category_list', {
            title: '电影分类列表',
            categories: categories
        });
    });
});

router.post('/admin/category', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    var _category = req.body.category;
    var category = new Category(_category);

    category.save((err, category) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/admin/category/list');
    })
});

//admin update movie
router.get('/admin/movie/update/:id', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
    var id = req.params.id;
    if(id) {
        Movie.findById(id, (err, movie) => {
            if(err) {
                console.log(err)
            }
            Category.find({}, (err, categories) => {
                if(err) {
                    console.log(err)
                }
                res.render('admin', {
                    title: '后台更新页',
                    movie: movie,
                    categories: categories
                })
            })
        })
    }
})

//新建&更新电影
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
            _movie.save((err, movie) => {   // 保存电影
                if(err) {
                    console.log(err);
                }
                res.redirect('/movie/' + movie._id);
            });
        })
    }else { //新增
        _movie = new Movie(movieObj);

        var categoryId = _movie.category;
        var categoryName = movieObj.categoryName;

        _movie.save((err, movie) => {   // 保存电影
            if(err) {
                console.log(err);
            }

            if(categoryId) {
                // 将电影保存到分类中去
                Category.findById(categoryId, (err, category) => {
                    category.movies.push(movie._id);
                    category.save((err, category) => {
                        res.redirect('/movie/' + movie._id);
                    })
                })
            }else if(categoryName) { // 自定义的分类

                var category = new Category({
                    name: categoryName,
                    movies: [movie._id]
                })

                category.save((err, category) => {
                    if(err) {
                        console.log(err)
                    }
                    console.log('===>>>category.save')
                    movie.category = category._id;
                    movie.save((err, m) => {
                        if(err) {
                            console.log(err)
                        }
                        console.log('===>>>movie.save')
                        res.redirect('/movie/' + m._id);
                    })
                })
            }
        })
    }

})

//列表页
router.get('/admin/movie/list', Auth.signinRequired, Auth.adminRequired, (req, res, next) => {
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

// 查询  分页
router.get('/results', Index.search);

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
