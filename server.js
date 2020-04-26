const ws = require('ws');
const mongoose = require('mongoose');
const Total = require('./model.js');

const mongoDB = 'mongodb://127.0.0.1:27017/talk';
mongoose.connect(mongoDB,{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.Promise    = global.Promise;

const db            = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

const wss = new ws.Server({port: 88})
wss.on('connection', function(ws){
    console.log('已连接');

    ws.on('message',function(data){
        console.log(data)
        let mes=JSON.parse(data);
        if(mes.type==='assign'){
            Total.find({name: 'room1'},function(err,result){
                if(err) return ;
                if(result.length===0) {
                    const total = new Total({
                        name: 'room1',
                        count: 0
                    });
                    total.save(function(err){
                        if(err){ return console.log('mongoose save fail')}
                        ws.send(JSON.stringify({
                            id: total.count,
                            type: 'assign'
                        }))
                        wss.clients.forEach(function(client){
                            if(client.readyState === ws.OPEN){
                                client.send(JSON.stringify({
                                    id: total.count,
                                    type: 'message',
                                    message: mes.message
                                }))
                            }
                        })
                    })
                }else{
                    const obj = result[0];
                    obj.count = obj.count + 1;
                    obj.save(function(err){
                        if(err){ return console.log('mongoose save fail')}
                        ws.send(JSON.stringify({
                            id: obj.count,
                            type: 'assign'
                        }))
                        wss.clients.forEach(function(client){
                            if(client.readyState === ws.OPEN){
                                client.send(JSON.stringify({
                                    id: obj.count,
                                    type: 'message',
                                    message: mes.message
                                }))
                            }
                        })
                    })
                }
            })
        }else if(mes.type === 'message'){
            wss.clients.forEach(function(client){
                if(client.readyState === ws.OPEN){
                    client.send(JSON.stringify(mes))
                }
            })
        }else{
            console.log('message err')
        }
    })
})