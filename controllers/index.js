/**
 * Created by huwl on 2017/11/12.
 */

const Movie = require('../model/movie');
const Category = require('../model/category');

exports.index = function(req, res) {
    Category.find({})
        .populate({path: 'movies', options: {limit: 10}})
        .exec((err, categories) => {
            if(err) {
                console.log(err);
            }
            res.render('index', {
                title: '首页',
                categories: categories
            });
        })
}

// 搜索
exports.search = function(req, res) {
    var catId = req.query.cat;
    var q = req.query.q;
    var page = req.query.page ? parseInt(req.query.page, 10) : 1;
    var pageSize = 2;
    var index = (page - 1) * pageSize;

    if(catId) { // 分类搜索
        Category
            .find({
                _id: catId
            })
            .populate({
                path: 'movies',
                select: 'title poster',
                // options: {
                //     limit: pageSize,
                //     skip: index
                // }
            })
            .exec((err, categories) => {
                if(err) {
                    console.log(err);
                }
                var category = categories[0] || {};
                var movies = category.movies || [];
                var results = movies.slice(index, index + pageSize);

                res.render('results', {
                    title: '搜索列表页面',
                    keyword: category.name,
                    movies: results,
                    query: 'cat=' + catId,
                    currentPage: page,
                    pageSize: pageSize,
                    totalPage: Math.ceil(movies.length / pageSize)
                });
            })
    }else { // 搜索框的搜索
        Movie.find({
            title: new RegExp(q + ".*", 'i')
        }).exec((err, movies) => {
            if(err) {
                console.log(err);
            }
            var results = movies.slice(index, index + pageSize);

            res.render('results', {
                title: '搜索列表页面',
                keyword: q,
                movies: results,
                query: 'q=' + q,
                currentPage: page,
                pageSize: pageSize,
                totalPage: Math.ceil(movies.length / pageSize)
            });
        })
    }
}
