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
const { log } = require('console')
const tokenRouter=new Router({
    // prefix:'token'
})
let fileName=""
const uploadDir = path.join("D:\\hr-font-master\\public","static") 
let storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
      cb(null, uploadDir)  //注意路径必须存在
  },
  //修改文件名称
  filename: function (req, file, cb) {
      fileName=file.originalname
      cb(null,file.originalname);
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
  console.log(stuN,password);
    let sql1 = `select * from admin where stuN='${stuN}' and password='${password}'`;
  const res1 = await tools.packet(sql1); 
  let isverify=res1[0].isverify
    const token=verifyUser(stuN,password,res1)
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
  let sql1 = `select * from lostthings where status='待招领'`;
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
  let stuN=ctx.request.body.stuN
  let phone=ctx.request.body.phone
  let password=ctx.request.body.password
  let sql = `update admin set phone='${phone}',password='${password}' where stuN=${stuN}`
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

//删除已发布物品
tokenRouter.post("/deletepublished", async (ctx, next) => {
  let name=ctx.request.body.name
  let time = ctx.request.body.time
  let result
  let msg
  let sql1 = `select status from lostthings where name='${name}' and date='${time}'`
  const result1 = await tools.packet(sql1);
  if (result1[0].status === "确认") {
    msg="已招领不能进行操作"
  }
  else {
    let sql = `DELETE FROM lostthings where name='${name}' and date='${time}'`
    result = await tools.packet(sql);
    msg="可以进行删除"
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
  console.log(result3);
  if(result3.length==0){
    let sql = `SELECT name from admin where stuN='${stuN}' `;
    const result = await tools.packet(sql);
    let claimerName=result[0].name
    let sql1=`select id from claimthings order by id desc limit 1`
    const result1 = await tools.packet(sql1);
    if(result1.length==0){
      let id=1
      let sql2=`insert into claimthings values(${id},'${thingName}','${claimerName}','${stuN}','待招领') `
      const result2 = await tools.packet(sql2);
      ctx.body= {
        msg:"招领成功"
    }
    }else{
      let id=result1[0].id+1
      let sql2=`insert into claimthings values(${id},'${thingName}','${claimerName}','${stuN}','待招领') `
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
tokenRouter.get('/getAllClaim',async (ctx,next)=>{
  let sql=`select * from claimthings where status='待招领'`
  const result = await tools.packet(sql);
  ctx.body={
    result
  }
})

//同意招领
tokenRouter.post('/acceptClaim',async (ctx,next)=>{
  let thingName=ctx.request.body.thingName
  let sql=`update lostthings set status='确认' where  name='${thingName}'`
  const result = await tools.packet(sql);
  let sql1=`update  claimthings set status='确认' where thingName='${thingName}' and status='待招领'`
  const result1 = await tools.packet(sql1);
  let sql2=`select address from lostthings where name='${thingName}'`
  const result2 = await tools.packet(sql2);
  let address=result2[0].address
  let sql3=`DELETE FROM comments where address='${address}'`
  const result3 = await tools.packet(sql3);
  ctx.body={
    result1
  }
})

// 不同意招领
tokenRouter.post('/disagree',async (ctx,next)=>{
  let thingName=ctx.request.body.thingName
  let sql1=`update  claimthings set status='不同意' where thingName='${thingName}'`
  const result1 = await tools.packet(sql1);
  ctx.body={
    result1
  }
})

//获取招领列表
tokenRouter.get('/getAllClaimthings',async(ctx,next)=>{
  let sql=`select count(*) as sure from lostthings where status='确认' and date like '%2023-%'`
  let sql1=`select count(*) as unsure from lostthings where status='待招领' and date like '%2023-%'`
  const result=await tools.packet(sql)
  const result1=await tools.packet(sql1)
  ctx.body={
    result,
    result1
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
tokenRouter.get('/getPublisher',async(ctx,next)=>{
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
tokenRouter.get("/allDetail", async (ctx, next) => {
  // 招领的次数
  let sql = `select thingName,count(1) as zhaolingcishu from claimthings GROUP BY thingName`;
  const total = await tools.packet(sql);
  let sql1 = `select thingName,count(1) as disagree from claimthings where status="不同意" GROUP BY thingName `
  const disagree = await tools.packet(sql1);
  
  ctx.body = {
    total,disagree
    }
})

tokenRouter.post("/register", async (ctx, next) => {
  let { stuN, name, pwd, classes, college, phone } = ctx.request.body
  let sql2 = `select count(1) as one from admin where stuN = '${stuN}'`
  let msg;
  const result2 = await tools.packet(sql2);
  console.log(result2[0].one);
  if (result2[0].one == 0) {
      let sql1=`select id from admin order by id desc limit 1;`
      const result1 = await tools.packet(sql1);
      let result;
      if(result1.length==0){
        let id=1
        let sql = `insert into admin values(${id},'${stuN}','${pwd}','${name}','0','${phone}','${classes}','${college}','2') `
        result = await tools.packet(sql);
      }else{
        let id=result1[0].id+1
        let sql = `insert into admin values(${id},'${stuN}','${pwd}','${name}','0','${phone}','${classes}','${college}','2') `
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

module.exports=tokenRouter
