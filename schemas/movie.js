/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var MovieSchema = new Schema({
    doctor: String,
    title: String,
    language: String,
    country: String,
    summary: String,
    flash: String,
    poster: String,
    year: Number,
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

//每次保存操作之前都要执行该方法
MovieSchema.pre('save', function(next) {
    if(this.isNew) {    //是否是新增加的数据
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else {
        this.meta.updateAt = Date.now();
    }
    next();
})

//添加一些静态方法，这些方法只有在被model实例化后才起作用
MovieSchema.statics = {
    fetch: function(cb) {
        return this.find().sort('meta.update').exec(cb);
    },
    findById: function(id, cb) {
        return this.findOne({_id: id}).exec(cb);
    }
}

module.exports = MovieSchema;
