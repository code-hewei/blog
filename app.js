var express = require("express");
var app = express();

var template = require('art-template');
var artTemRenderEngine = require('express-art-template');
var fs = require('fs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
app.use(flash());
app.use(session({
    secret:'mylogin',
    resave:true,
    saveUninitialized:true,
    rolling:true,
    cookie:{
        maxAge:1000*60*60
    },
    store: new MongoStore({
        // 连接数据库
        url:'mongodb://127.0.0.1/login'
    })
}));


//创建一个数据库
mongoose.connect('mongodb://127.0.0.1:27017/login',{useNewUrlParser:true},(err)=>{
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
    }
})


// var Schema = mongoose.Schema;
 var Schema = mongoose.Schema;

 //定义字段
var userSchema = new Schema({
      username:String,
      password:String
});

//定义表
var MyLogin = mongoose.model('login',userSchema);

//注册
app.get('/regist',(req,res)=>{
    // console.log(req.flash('error').toString());
    // 从flash暂存器中取出 error 的值
    var error = req.flash('error').toString();
    res.render('regist',{error});
});
app.post('/regist',(req,res)=>{
    User.findOne({username:req.body.username},(err,data)=>{
        if (data) {
            // res.send('用户名已被抢注');
            // 在flash暂存器中添加一个 error 信息
            req.flash('error','用户名已被抢注');
            res.redirect('/regist')
        } else {
            // 对密码进行MD5加密
            req.body.password = md5(req.body.password);
            var user = new User(req.body);
            // console.log(user);
            user.save(err=>{
                res.redirect('/login');
            });
        }
    });
});

// 登录
app.get('/login',(req,res)=>{
    var error = req.flash('error').toString();
    res.render('login',{error});
});
app.post('/login',(req,res)=>{
    User.findOne({username:req.body.username},(err,user)=>{
        if (!user) {
            // res.send('用户名不存在');
            req.flash('error','用户名不存在');
            res.redirect('/login');
        } else {
            if (md5(req.body.password) == user.password) {
                // 每次登录时，在session对象中添加user，user会被自动的保存或者更新到session中
                req.session.user = user;
                res.redirect('/');
            } else {
                // res.send('密码错误');
                req.flash('error','密码错误');
                res.redirect('/login');
            }
        }
    });
});

// 退出登录
app.get('/logout',(req,res)=>{
    req.session.user = null;
    res.redirect('/');
});






app.listen(3000,()=>{
    console.log('node running');
});
