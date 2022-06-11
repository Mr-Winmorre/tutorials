

const express = require('express')
// const websocket =  require('ws')
var webSocketServer = new (require('ws')).Server({port: (process.env.PORT || 5000)});
var websockets = {};
webSocketServer.on('connection',function (ws,req){
    ws.upgradeReq = req;
    // console.log(ws)
    var userId =  parseInt(ws.upgradeReq.url.substr(1),10)
    websockets[userId] = ws;
    console.log(`websockets  ${websockets}`)
    console.log('connected: ' + userId + ' in ' + Object.getOwnPropertyNames(websockets))
    // Forward message
    // Receive [toUserId, text]  eg. [2, "hello you there"]

    // send [fromUserId, text]  eg. [1, "Hello world"]
    ws.on('message', function(message){
        console.log('received from ' + userId + ': ' + message)
        var messageArray =  JSON.parse(message)
        var toUserWebSocket = websockets[messageArray[0]]
        if (toUserWebSocket) {
            console.log('sent to ' + messageArray[0] + ': ' + JSON.stringify(messageArray))
            messageArray[0] = userId;
            toUserWebSocket.send(JSON.stringify(messageArray))
        }
    })

    ws.on('close',function(){
        delete websockets[userId]
        console.log('deleted:  '+userId)
    })

})