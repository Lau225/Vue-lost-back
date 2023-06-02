const Router=require('@koa/router')
const express = require('express')
const router=express.Router()
const fs=require('fs')
const path=require('path')
const multer = require('@koa/multer');
const multiparty = require('multiparty');
const dbConfig=require('../api/config/dbconfig')
const users=require('../users')
const {generateToken}=require('../api/core/utils')
const auth=require('../api/middlewares/auth')
const tools=require('../api/config/for')
const res = require('express/lib/response')
const crypto = require("crypto")
const miyao = "paomiange666#";
const { log } = require('console')
const tokenRouter=new Router({
    // prefix:'token'
})
let fileName=""
// const uploadDir = path.join("D:\\hr-font-master\\public","static") 
const uploadDir = path.join("C:\\Users\\lenovo\\Desktop\\Vue-lost-font-master\\public","static") 
let storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
      cb(null, uploadDir)  //注意路径必须存在
  },
  //修改文件名称
  filename: function (req, file, cb) {
    fileName = file.originalname
    let aaa = Date.now() + '-' + file.originalname;
    fileName = aaa;
    cb(null,aaa);
  }
})

let upload = multer({ fileFilter(req, file, callback) {
  // 解决中文名乱码的问题 latin1 是一种编码格式
  file.originalname = Buffer.from(file.originalname, "latin1").toString(
    "utf8"
  );
  callback(null, true);
},storage: storage })

tokenRouter.post('/file', upload.array('file'), async (ctx,next) => {
  fileName='/static/'+fileName
  ctx.body = 'done'
})


//登陆接口
tokenRouter.post("/login", async (ctx, next) => {
  let {stuN, password}=ctx.request.body
  const str = `password=${password}$key=${miyao}`;
  let md5 = crypto.createHash("md5");
  let pwd = md5.update(str).digest("hex")
  console.log(pwd);
  let sql1 = `select * from admin where stuN='${stuN}' and password='${pwd}'`;
  const res1 = await tools.packet(sql1); 
  console.log(res1);
  let isverify=res1[0].isverify
  const token = verifyUser(stuN, pwd, res1)
  console.log(token);
    if(!token){
        ctx.body={
            errCode:1001,
            msg:'用户名或密码不正确'
        }
        return
    }
    ctx.body= {
      token,
      stuN,
      isverify
    }
});
//新增丢失物品
tokenRouter.post('/add', async (ctx, next) => {
  let status="待招领"
  let number = ctx.request.body.number
  let name= ctx.request.body.name
  let type= ctx.request.body.type
  let detail= ctx.request.body.detail
  let place=ctx.request.body.place
  let date=ctx.request.body.date
  let sql2=`select name from admin where stuN='${number}'`
  const result2 = await tools.packet(sql2);
  let pickName=result2[0].name 
  console.log(pickName);
  let sql1=`select id from lostthings order by id desc limit 1;`
  const result1 = await tools.packet(sql1);
  let result
  if(result1.length==0){
    let id=1
    let sql = `insert into lostthings values(${id},'${name}','${type}','${number}','${detail}','${fileName}','${place}','${date}','${pickName}','${status}') `
    result = await tools.packet(sql);
  }else{
    let id=result1[0].id+1
    let sql = `insert into lostthings values(${id},'${name}','${type}','${number}','${detail}','${fileName}','${place}','${date}','${pickName}','${status}') `
    result = await tools.packet(sql);
  }
  if (result != null) {
    ctx.body = {
    msg:'添加成功'
  }
  }
})
//获取拾有者的姓名
tokenRouter.post('/getName', async (ctx, next) => {
  let picker = ctx.request.body.picker
  let sql1=`select name from admin where stuN='${picker}'`
  const result1 = await tools.packet(sql1);
  if (result1 != null) {
    ctx.body = {
    result1
  }
  }
})

//获取物品
tokenRouter.get("/getthing", async (ctx) => {
  let sql1 = `select * from lostthings where status='待招领' or status='招领中'`;
  const lostthings = await tools.packet(sql1);
  console.log(lostthings);
  let addressList=[]
  lostthings.forEach(item => {
    addressList.push(item.address)
  })
  console.log(addressList);
  for (const key in addressList) {
    let address=addressList[key]
    let sql=`select count(*) as count from comments where address='${address}'`
    const result = await tools.packet(sql);
    console.log(result);
    lostthings[key].comments=result[0].count
  }
  ctx.body= {
    lostthings
    }
})
//获取评论
tokenRouter.post("/getComment", async (ctx) => {
  let address = ctx.request.body.address
  let sql1 = `select comment,pickerName from comments where address='${address}'`
  const result = await tools.packet(sql1);
  console.log(result);
  if(result!=null){
    ctx.body= {
      result
    }
  }else if(result==[]){
    console.log(11111);
    ctx.body={
      msg:"暂无评论"
    }
  }
})
// 添加评论
tokenRouter.post("/sendComment", async (ctx) => {
  let address = ctx.request.body.address
  let number=ctx.request.body.number
  let comments=ctx.request.body.comments
  let sql2=`select name from admin where stuN='${number}'`
  const result2 = await tools.packet(sql2);
  let pickerName=result2[0].name
  console.log(pickerName);
  let sql1=`select id from comments order by id desc limit 1;`
  const result1 = await tools.packet(sql1);
  let result
  if(result1.length==0){
    let id=1
    let sql =  `insert into comments values(${id},'${comments}','${pickerName}','${address}') `
    result = await tools.packet(sql);
  }else{
    let id=result1[0].id+1
    let sql =  `insert into comments values(${id},'${comments}','${pickerName}','${address}') `
    result = await tools.packet(sql);
  }
  console.log(result);
  if(result!=null){
    ctx.body={
      msg:"发表成功"
    }
  }
})

//验证用户名和密码
function verifyUser(stuN,password,res1){
    const index=res1.findIndex(user=>{
        return user.stuN===stuN&&user.password===password
    })
    const user=res1[index]
    if(!user){
        return undefined
    }
    else{
        const token=generateToken(user.id,auth.USER)
        return token
    }
}

//修改实名认证
tokenRouter.post("/updateid", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let sql = `update admin set isverify=1 where stuN=${stuN}`

  const result = await tools.packet(sql);
  ctx.body= {
        result
    }
})

//获得个人信息
tokenRouter.post("/getadmin", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let sql = `select * from admin where stuN='${stuN}'`
  const result = await tools.packet(sql);
  ctx.body= {
        result
    }
})

//修改个人档案
tokenRouter.post("/updatefile", async (ctx, next) => {
  let phone=ctx.request.body.phone
  let stuN=ctx.request.body.stuN
  let sql = `update admin set phone='${phone}' where stuN='${stuN}'`
  const result = await tools.packet(sql);
  if(result!=null){
    ctx.body= {
      msg:"修改成功"
  }
  }
  
})

//获取已发布物品
tokenRouter.post("/getpublished", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let sql = `select * from lostthings where number='${stuN}'`
  const result = await tools.packet(sql);
  ctx.body= {
        result
    }
})

//通过id获得物品
tokenRouter.post("/getdetail", async (ctx, next) => {
  let id=ctx.request.body.id
  let sql = `select * from lostthings where id='${id}'`
  const result = await tools.packet(sql);
  ctx.body= {
        result
    }
})

//修改已发布的物品
tokenRouter.post("/updatepublished", async (ctx, next) => {
  let number = ctx.request.body.number
  let name= ctx.request.body.name
  let type= ctx.request.body.type
  let detail= ctx.request.body.detail
  let place=ctx.request.body.place
  let date=ctx.request.body.date
  let sql = `update lostthings set place='${place}',date='${date}',detail='${detail}',type='${type}' where number='${number}' and name='${name}'`
  const result = await tools.packet(sql);
  if(result!=null){
    ctx.body= {
      msg:"修改成功"
  }
  }
})

//删除已发布物品d
tokenRouter.post("/deletepublished", async (ctx, next) => {
  let name=ctx.request.body.name
  let time = ctx.request.body.time
  let result
  let msg
  let sql1 = `select status from lostthings where name='${name}' and date='${time}'`
  const result1 = await tools.packet(sql1);
  console.log(result1[0]);
  if (result1[0].status === "确认" || result1[0].status ==="招领中") {
    msg="已招领或招领中不能进行操作"
  }
  else {
    let sql = `DELETE FROM lostthings where name='${name}' and date='${time}'`
    result = await tools.packet(sql);
    msg="可以操作"
  }
  ctx.body= {
        msg
    }
})


//验证是否有重复发布的物品
tokenRouter.post("/verifypublished", async (ctx, next) => {
  let name=ctx.request.body.name
  let number=ctx.request.body.number
  let sql = `select * from lostthings where name='${name}' and picker='${number}'`
  const result = await tools.packet(sql);
  if(result.length==0){
    ctx.body= {
        code:200,
        msg:"可以添加数据"
    }
  }else{
    ctx.body={
      msg:"不能重复添加",
      code:400
    }
  }
})

//发布认领信息
tokenRouter.post("/sendClaim", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let thingName=ctx.request.body.thingName
  let sql3=`select * from claimthings where claimerNumber='${stuN}' and thingName='${thingName} ' and status='待招领'`
  const result3 = await tools.packet(sql3);
  console.log(stuN,thingName);
  console.log("result",result3.length);
  if(result3.length==0){
    let sql = `SELECT name from admin where stuN='${stuN}' `;
    const result = await tools.packet(sql);
    let claimerName=result[0].name
    let sql1=`select id from claimthings order by id desc limit 1`
    const result1 = await tools.packet(sql1);
    if(result1.length==0){
      let id=1
      let sql2 = `insert into claimthings values(${id},'${thingName}','${claimerName}','${stuN}','待招领') `
      let sql3 = `update lostthings set status='招领中' where  name='${thingName}'`
      const result3 = await tools.packet(sql3);
      const result2 = await tools.packet(sql2);
      ctx.body= {
        msg:"招领成功"
    }
    }else{
      let id=result1[0].id+1
      let sql2 = `insert into claimthings values(${id},'${thingName}','${claimerName}','${stuN}','待招领') `
      let sql3 = `update lostthings set status='招领中' where  name='${thingName}'`
      const result3 = await tools.packet(sql3);
      const result2 = await tools.packet(sql2);
      ctx.body= {
        msg:"招领成功"
    }
    }
  }
  else{
    ctx.body={
      msg:"不能重复招领"
    }
  }
  
  
})

//获取认领信息
tokenRouter.post("/getClaim", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let sql = `select * from claimthings where claimerNumber='${stuN}'`
  const result = await tools.packet(sql);
  
  ctx.body={
    result
  }
})

//获取全部认领信息
tokenRouter.post('/getAllClaim', async (ctx, next) => {
  let role = ctx.request.body.role
  console.log(role);
  if (role == 1 || role == 3) {
    let sql=`select * from claimthings where status='待招领'`
    const result = await tools.packet(sql);
    ctx.body={
      result
    }
  }
})

//同意招领
tokenRouter.post('/acceptClaim',async (ctx,next)=>{
  let { thingName, stuN } = ctx.request.body
  let msg
  let sql4 = `SELECT count(1) as count FROM claimthings where thingName='${thingName}' and status='确认'`
  const result4 = await tools.packet(sql4);
  if (result4[0].count != 1) {
    let sql=`update lostthings set status='确认' where  name='${thingName}'`
    const result = await tools.packet(sql);
    let sql1=`update  claimthings set status='确认' where thingName='${thingName}' and status='待招领' and claimerNumber='${stuN}'`
    const result1 = await tools.packet(sql1);
    let sql2=`select address from lostthings where name='${thingName}'`
    const result2 = await tools.packet(sql2);
    let address=result2[0].address
    let sql3=`DELETE FROM comments where address='${address}'`
    const result3 = await tools.packet(sql3);  
    let sql4 = `DELETE FROM lostthings_user where name='${thingName}' and number='${stuN}'`
    const result4 = await tools.packet(sql4);
    let sql5 = `delete from stars where name='${thingName}' and number = '${stuN}'`
    const result5 = await tools.packet(sql5);
    msg = '同意招领'
  }
  else {
    msg= '不能重复招领'
  }
  ctx.body={
    msg
  }
})

// 不同意招领
tokenRouter.post('/disagree',async (ctx,next)=>{
  let { thingName, stuN } = ctx.request.body
  console.log(thingName,stuN);
  let sql1=`update  claimthings set status='不同意' where thingName='${thingName}' and status='待招领' and claimerNumber='${stuN}'`
  const result1 = await tools.packet(sql1);
  let sql=`update lostthings set status='待招领' where  name='${thingName}'`
  const result = await tools.packet(sql);
  let sql2 = `DELETE FROM lostthings_user where name='${thingName}' and number='${stuN}'`
  const result2 = await tools.packet(sql2);
  ctx.body={
    result1
  }
})

//获取招领列表
tokenRouter.post('/getAllClaimthings', async (ctx, next) => {
  let { role } = ctx.request.body
  if (role == 1 || role == 3) {
    let sql=`select count(*) as sure from lostthings where status='确认'`
    let sql1=`select count(*) as unsure from lostthings where status='待招领'`
    const result=await tools.packet(sql)
    const result1=await tools.packet(sql1)
    ctx.body={
      result,
      result1
    }
  }
})


//获取权限
tokenRouter.post("/getPower", async (ctx, next) => {
  let stuN=ctx.request.body.stuN
  let sql = `SELECT role FROM admin where stuN='${stuN}'`;
  const result = await tools.packet(sql);
  let sql1=`select * from role where id='${result[0].role}'`
  const result1 = await tools.packet(sql1);
  console.log(result1);
  ctx.body= {
    result1
    }
})

//统计发布者和招领者的资料
tokenRouter.post('/getPublisher', async (ctx, next) => {
  let { role } = ctx.request.body
  if (role == 1 || role == 3) {
     let sql=`SELECT picker,count(*) as publish from lostthings  GROUP BY picker`
    const publish = await tools.packet(sql)
    console.log(publish);
    let claim=[]
    for (const key in publish) {
      let pickerName=publish[key].picker
      let sql1=`select claimerName,count(*) as claim from claimthings where status='确认' and claimerName='${pickerName}'`
      const result1=await tools.packet(sql1)
      result1[0].claimerName=pickerName
      claim.push(result1[0])
    }
    console.log(claim);
    ctx.body={
      publish,
      claim
    }
  }
 
})

//回复内容
tokenRouter.post("/reply", async (ctx, next) => {
  let stuN=ctx.request.body.stuN //评论人的学号
  let comment=ctx.request.body.comment//评论信息
  let pickerName=ctx.request.body.pickerName//要回复的回复人的名字
  let sql=`select name from admin where stuN='${stuN}'`
  const result = await tools.packet(sql);
  let name=result[0].name //评论人的名字
  let thingname=ctx.request.body.thingName //物品名称
  console.log(thingname);
  let value=ctx.request.body.value
  let sql1=`select id from replycomments order by id desc limit 1`
  const result1 = await tools.packet(sql1);
  if(result1.length==0){
    let id=1
    let sql2=`insert into replycomments values(${id},'${comment}','${pickerName}','${name}','${value}','${thingname}') `
    const result2 = await tools.packet(sql2);
    ctx.body= {
      msg:"回复成功"
  }
  }else{
    let id=result1[0].id+1
    let sql2=`insert into replycomments values(${id},'${comment}','${pickerName}','${name}','${value}','${thingname}') `
    const result2 = await tools.packet(sql2);
    ctx.body= {
      msg:"回复成功"
  }
}
})

//获取所有回复
tokenRouter.post("/getreply", async (ctx, next) => {
  let thingname=ctx.request.body.thingname
  let sql = `SELECT * FROM replycomments where thingname='${thingname}'`;
  const result = await tools.packet(sql);
  console.log(result[0]);
  ctx.body= {
    result
    }
})

// 获取物品全部细节
tokenRouter.post("/allDetail", async (ctx, next) => {
  let { role } = ctx.request.body
  if (role == 1 || role == 3) {
  // 招领的次数
    let sql = `select thingName,count(1) as zhaolingcishu from claimthings GROUP BY thingName`;
    const total = await tools.packet(sql);
    let sql1 = `select thingName,count(1) as disagree from claimthings where status="不同意" GROUP BY thingName `
    const disagree = await tools.packet(sql1);
    
    ctx.body = {
      total,disagree
    }  
  }
  
})

tokenRouter.post("/register", async (ctx, next) => {
  let { stuN, name, pwd, classes, college, phone } = ctx.request.body
  let sql2 = `select count(1) as one from admin where stuN = '${stuN}'`
  const str = `password=${pwd}$key=${miyao}`;
  let md5 = crypto.createHash("md5");
  let PWD = md5.update(str).digest("hex")
  let msg;
  const result2 = await tools.packet(sql2);
  console.log(result2[0].one);
  if (result2[0].one == 0) {
      let sql1=`select id from admin order by id desc limit 1;`
      const result1 = await tools.packet(sql1);
      let result;
      if(result1.length==0){
        let id=1
        let sql = `insert into admin values(${id},'${stuN}','${PWD}','${name}','0','${phone}','${classes}','${college}','2') `
        result = await tools.packet(sql);
      }else{
        let id=result1[0].id+1
        let sql = `insert into admin values(${id},'${stuN}','${PWD}','${name}','0','${phone}','${classes}','${college}','2') `
        result = await tools.packet(sql);
      }
      msg="注册成功"
  }
  else {
    msg="账号重复"
  }
  ctx.body = {
    msg
  }
})


// 获取所有用户的信息
tokenRouter.post("/getAllAdmin", async (ctx, next) => {
  // 招领的次数
  let sql = `select * from admin`;
  let role = ctx.request.body.role
  if (role == 1) {
   const total = await tools.packet(sql);
    let list = total
    for (const key in list) {
      if (list[key].role == "1") {
        list[key].role = "超级管理员"
      } else if (list[key].role == "3") {
        list[key].role = "管理员"
      }else if (list[key].role == "2") {
        list[key].role = "普通用户"
      }
    }
    console.log(list);
    ctx.body = {
      list
    } 
  }
})


// 用户授权
tokenRouter.post("/emPower", async (ctx, next) => {
  let { stuN, role } = ctx.request.body
  if (role == "管理员") {
    let sql = `update admin set role = 1 where stuN = '${stuN}'`
    const result1 = await tools.packet(sql);
  } else if (role == "普通用户") {
    let sql1 = `update admin set role = 3 where stuN=${stuN}`;
    const result2 = await tools.packet(sql1);
  }
  ctx.body = {
    msg:'授权完成'
  }
})

// 用户撤权
tokenRouter.post("/downPower", async (ctx, next) => {
  let { stuN } = ctx.request.body
  let sql = `update admin set role = 2 where stuN = '${stuN}'`
  const result1 = await tools.packet(sql);
  ctx.body = {
    msg:'撤权完成'
  }
})

// 招领信息
tokenRouter.post('/zhaoling', async (ctx, next) => {
  let status="招领中"
  let number = ctx.request.body.number
  let name= ctx.request.body.name
  let detail= ctx.request.body.detail
  let sql1=`select id from lostthings_user order by id desc limit 1;`
  const result1 = await tools.packet(sql1);
  let result
  if(result1.length==0){
    let id=1
    let sql = `insert into lostthings_user values(${id},'${name}','${detail}','${number}','${status}','${fileName}') `
    result = await tools.packet(sql);
  }else{
    let id=result1[0].id+1
    let sql = `insert into lostthings_user values(${id},'${name}','${detail}','${number}','${status}','${fileName}') `
    result = await tools.packet(sql);
  }
  if (result != null) {
    ctx.body = {
    msg:'添加成功'
  }
  }
})

// 对比招领信息 
tokenRouter.post("/searchMine", async (ctx, next) => {
  let { number,thingName } = ctx.request.body
  let sql = `select * from lostthings where name = '${thingName}'`
  const result = await tools.packet(sql);
  let old = result[0];
  let sql1 = `select * from lostthings_user where name = '${thingName}' and number = '${number}'`
  const result1 = await tools.packet(sql1);
  let New = result1[0];
  ctx.body = {
    old,New
  }
})

// 获取名字和权限
tokenRouter.post("/abab", async (ctx, next) => {
  let { stuN } = ctx.request.body
  let sql = `select name,role from admin where stuN = '${stuN}'`
  const result = await tools.packet(sql);
  ctx.body = {
    result
  }
})

// 删除回复 delReply
tokenRouter.post("/delReply", async (ctx, next) => {
  let { value, thingname, name } = ctx.request.body.obj
  console.log(value,thingname,name);
  let sql = `DELETE FROM replycomments where thingname='${thingname}' and value='${value}' and name='${name}'`
  let result = await tools.packet(sql);
  ctx.body = {
    msg:"删除回复成功"
  }
})

// 删除评论 delComment
tokenRouter.post("/delComment", async (ctx, next) => {
  let { comment,pickerName } = ctx.request.body.obj
  let sql = `DELETE FROM comments where pickerName='${pickerName}' and comment='${comment}'`
  let result = await tools.packet(sql);
  let sql1 = `DELETE FROM replycomments where comment='${comment}' and pickerName='${pickerName}'`
  let result1 = await tools.packet(sql1);
  ctx.body = {
    msg:"删除评论成功"
  }
})

// 收藏物品
tokenRouter.post("/stars", async (ctx, next) => {
  let { address, date, detail, name, picker, place, status, type ,number} = ctx.request.body.obj
  let {stuN} = ctx.request.body
  let sql1=`select id from stars order by id desc limit 1;`
  const result1 = await tools.packet(sql1);
  let result
  if(result1.length==0){
    let id=1
    let sql = `insert into stars values(${id},'${name}','${type}','${stuN}','${detail}','${address}','${place}','${date}','${picker}','${status}','${number}')`
    result = await tools.packet(sql);
  }else{
    let id=result1[0].id+1
    let sql = `insert into stars values(${id},'${name}','${type}','${stuN}','${detail}','${address}','${place}','${date}','${picker}','${status}','${number}')`
    result = await tools.packet(sql);
  }
  ctx.body = {
    msg:"收藏成功"
  }
})

//获取收藏的物品
tokenRouter.post("/getstars", async (ctx, next) => {
  let { stuN } = ctx.request.body
  let sql1=`select * from stars where number = '${stuN}' and (status = '待招领' or status = '招领中')`
  const result1 = await tools.packet(sql1);
  ctx.body = {
    result1
  }
})

// 显示收藏的物品
tokenRouter.post("/showList", async (ctx, next) => {
  let { stuN } = ctx.request.body
  let sql1=`select * from lostthings where status = '待招领' or status = '招领中'`
  const lostthings = await tools.packet(sql1);
  let sql2 = `select * from stars where number='${stuN}'`
  const stars = await tools.packet(sql2);
  ctx.body = {
   lostthings,stars
  }
})

// 取消收藏 
tokenRouter.post("/unstars", async (ctx, next) => {
  let {name } = ctx.request.body.obj
  let {stuN } = ctx.request.body
  let sql1=`DELETE FROM stars where name='${name}' and number='${stuN}'`
  const lostthings = await tools.packet(sql1);
  ctx.body = {
   msg:"取消收藏成功"
  }
})


// 修改密码
tokenRouter.post("/changePwd", async (ctx, next) => {
  let { stuN, newpwd } = ctx.request.body
    const str = `password=${newpwd}$key=${miyao}`;
    let md5 = crypto.createHash("md5");
    let newPWD = md5.update(str).digest("hex")
    let sql2 = `update admin set password = '${newPWD}' where stuN = '${stuN}'`
    let result2 = await tools.packet(sql2);
    msg="修改密码成功"
    ctx.body = {
      msg
    }
})


// 验证旧密码 yanzheng
tokenRouter.post("/yanzheng", async (ctx, next) => {
  let { oldpwd, stuN } = ctx.request.body
  let msg;
  const str = `password=${oldpwd}$key=${miyao}`;
  let md5 = crypto.createHash("md5");
  let oldPWD = md5.update(str).digest("hex")
  let sql1=`select * from admin where stuN='${stuN}' and password = '${oldPWD}'`
  const result1 = await tools.packet(sql1);
  if (result1.length == 0) {
    msg="旧密码错误"
  }
  else if (result1.length == 1) {
    msg="验证成功"
  }
  ctx.body = {
   msg
  }
})


// 添加代找物品
tokenRouter.post('/daizhao', async (ctx, next) => {
  let status = "待招领"
  let role = ctx.request.body.role
  let name= ctx.request.body.name
  let daizhaoName= ctx.request.body.daizhaoName
  let type= ctx.request.body.type
  let detail= ctx.request.body.detail
  let place=ctx.request.body.place
  let date = ctx.request.body.date
  if (role == 1 || role == 3) {
        let sql1=`select id from daizhao order by id desc limit 1;`
      const result1 = await tools.packet(sql1);
      let result
      if(result1.length==0){
        let id=1
        let sql = `insert into daizhao values(${id},'${name}','${type}','${detail}','${fileName}','${place}','${date}','${status}','${daizhaoName}') `
        result = await tools.packet(sql);
      }else{
        let id=result1[0].id+1
        let sql = `insert into daizhao values(${id},'${name}','${type}','${detail}','${fileName}','${place}','${date}','${status}','${daizhaoName}') `
        result = await tools.packet(sql);
      }
      if (result != null) {
        ctx.body = {
        msg:'代找信息添加成功'
      }
      }
  }
})


// 获取代找信息
tokenRouter.get("/getdaizhao", async (ctx, next) => {
  let sql = `select * from daizhao`
  let result = await tools.packet(sql);
  ctx.body = {
   result
  }
})

// 获取全部列表 
tokenRouter.post("/getAllThings", async (ctx, next) => {
  let sql = `select * from daizhao`
  let role = ctx.request.body.role
  if (role == 1) {
    let result = await tools.packet(sql);
    let sql1 = `select * from lostthings where status !='确认' and status !='已下架'`
    let result1 = await tools.packet(sql1);
    ctx.body = {
    result,result1
    } 
  }
})

// 下架物品
tokenRouter.post("/Off", async (ctx, next) => {
  let { address, name, } = ctx.request.body.obj
  let Do = ctx.request.body.obj.do
  if (Do == "招领") {
    let sql = `update lostthings set status='已下架' where address='${address}' and name = '${name}'`
    let result = await tools.packet(sql);
    let sql1 = `select * from stars where address='${address}' and name = '${name}'`
    let result1 = await tools.packet(sql1);
    if (result1.length != 0) {
      let sql2 = `DELETE FROM stars where name='${name}' and address='${address}'`
      let result2 = await tools.packet(sql2);
    }
    let sql3 = `update claimthings set status='不同意' where  thingName = '${name}'`
    let result3 = await tools.packet(sql3);
  }
  else if (Do == "代找") {
   let sql1 = `DELETE FROM daizhao where name='${name}' and address='${address}'`
   let result1 = await tools.packet(sql1); 
  }
  ctx.body = {
   msg:"操作成功111"
  }
})
module.exports=tokenRouter
