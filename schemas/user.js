/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String
    },
    password: String,

    //0 normal user
    //1 verified user
    //2 professonal user

    //>10 admin
    //>50 super admin
    role: {
        type: Number,
        default: 0
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
UserSchema.pre('save', function(next) {
    var user = this;
    if(this.isNew) {    //是否是新增加的数据
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else {
        this.meta.updateAt = Date.now();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if(err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if(err) {
                return next(err);
            }
            user.password = hash;
            next();
        })
    })
    // next();  //此处不能有next  是个坑
})

//添加一些静态方法，这些方法只有在被model实例化后才起作用
UserSchema.statics = {
    fetch: function(cb) {
        return this.find().sort('meta.update').exec(cb);
    },
    findById: function(id, cb) {
        return this.findOne({_id: id}).exec(cb);
    }
}

//增加实例方法
UserSchema.methods = {
    comparePassword: function(password, cb) {
        bcrypt.compare(password, this.password, (err, isMatch) => {
            if(err) {
                return cb(err);
            }
            cb(null, isMatch);
        })
    }
}

module.exports = UserSchema;
