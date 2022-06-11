// import { v4 as uuidv4 } from 'uuid';
var webSocketServer = new (require('ws')).Server({port: (process.env.PORT || 5000)});

function noop(){}

 function heartbeat() {
    this.isAlive = true;
}

var rooms = {}

const paramExist = (data)=>{
    try {
        if ('meta' in data && 'roomId' in data && 'clientId' in data && 'message' in data) {
            return true;
        } else {
            return false;
        }
        
    } catch (error) {
        throw error;
    }
}

const roomExist= (roomId)=>{
    // check if room exist
    if (roomId in rooms) {
        return true;
    } else {
        return false;
    }
}

const insideRoomDataExist=(arr,data)=>{
    var status = false;
    for(var i=0;i<arr.length;i++){
        if(data in arr[i]){
            status = true;
            break;
        }
    }
    return status;
}

const clientExistInRoom = (roomId,ws,clientId)=>{
    var status = false;
    const data = rooms[roomId]
    for(var i=0;i<data.length;i++){
        var temp=data[i]
        for(const obj in temp){
            if(clientId==obj){
                status = true;
                break;
            }
        }
    }
    return status;
}

const createRoom = (data,ws)=>{
    try {
        var {roomId,clientId}=data;
        const status = roomExist(roomId);
        if(status){
            ws.send(JSON.stringify({
                'message':'room already exist',
                'status':0
            }));
        }else{
            rooms[roomId]=[];
            var obj={}
            obj[clientId]=ws;
            rooms[roomId].push(obj);
            ws['roomId']=roomId;
            ws['clientId']=clientId;
            ws['admin']=true;

            ws.send(JSON.stringify({
                'message':'room created successfully',
                'status':1
            }))
        }
    } catch (error) {
        ws.send(JSON.stringify({
            'message':'There was some problem in creating a room' + error,
            'status':0
        }))
    }
}

// join room
const joinRoom = (data,ws)=>{
    try {
        var {roomId,clientId}=data;
        // check if room exist or not
        const roomExist = roomId in rooms;
        if (! roomExist) {
            ws.send(JSON.stringify({
                'message':'check room id',
                'status':0
            }))
            return;
        }
        const inRoom = clientExistInRoom(roomId,ws,clientId)
        if (inRoom){
            ws.send(JSON.stringify({
                'message':'you are already in a room',
                "status":0
            }))
        }else{
            var obj={}
            obj[clientId]=ws;
            rooms[roomId].push(obj)
            ws['roomId']=roomId;
            ws['clientId']=clientId;
            ws.send(JSON.stringify({
                'message':'Joined successfully',
                'status':1
            }));
        }
        
    } catch (error) {
        ws.send(JSON.stringify({
            'message':'there was a problem in joining a room'+error,
            'status':0
        }))
    }
}

// send message
const sendMessage = (data,ws,Status=null)=>{
    try {
        var {roomId,message,clientId}=data;
        // check whether room exist
        const roomExist = roomId in rooms;
        if (!roomExist){
            ws.send(JSON.stringify({
                'message':'check room id',
                'status':0
            }));
            return;
        }

        // check if client is in room or not
        const clientExist = clientExistInRoom(roomId,ws,clientId);
        if (!clientExist) {
            ws.send(JSON.stringify({
                'message':'You are not allowed to send message',
                'status':0
            }))
            return;
        }
        const obj= rooms[roomId];
        for(var i=0;i<obj.length;i++){
            var temp =obj[i];
            for(var innerObj in temp){
                var wsClientId = temp[innerObj];
                if(ws !== wsClientId){
                    wsClientId.send(JSON.stringify({
                        'message':message,
                        'status':Status?Status:1
                    }));
                }
            }
        }
    } catch (error) {
        ws.send(JSON.stringify({
            'message':"There was some problem in sending the message",
            'status':0
        }))
    }
}

const leaveRoom = (ws,data)=>{
    try {
        const {roomId}=data;
    const roomExist = roomId in rooms

    if (roomExist){
        ws.send(JSON.stringify({
            'message':'check room id',
            'status':0
        }))

        return;
    }

    if ('admin' in ws) {
        data['message']="Admin left the room.";
        sendMessage(data,ws,Status=2);
        delete rooms[ws.roomId];
        return;
    } else {
        lst_obj = rooms[roomId];
        var index=null;
        for(var i=0;r<lst_obj.length;i++){
            var temp_obj = lst_obj[i]
            for(var key in temp_obj){
                var temp_inside = temp_obj[key]
                if('admin' in temp_inside){
                    temp_inside.send(JSON.stringify({
                        'message':'Sombody left the room',
                        'status':3
                    }))
                }
                if (ws==temp_inside) {
                    index=i
                }
            }
        }
        if(index !=null){
            rooms[roomId].splice(index,1);
            console.log(rooms[roomId].length);
        }
     }
    } catch (error) {
        ws.send(JSON.stringify({
            'message':'There was some problem',
            'status':0
        }))
    }
}

const available_room = (ws)=>{
    try {
        var available_room_id = [];
        for(var i in rooms){
            available_room_id.push(parseInt(i))
        }
        ws.send(JSON.stringify({
            'rooms':available_room_id,
            'status':4
        }))
    } catch (error) {
        ws.send(JSON.stringify({
            'message':'there was some problem ---- ',
            'status':0
        }))
    }
}

webSocketServer.on('connection',function connection(ws){
    try {
        ws.on('message',(receivedData)=>{
            var data = JSON.parse(receivedData)
            const error = paramExist(data)
            if (!error) {
                ws.send(JSON.stringify({
                    'message':'check params',
                    'status':0
                }))
                return;
            }

            var {roomId,meta}=data;
            switch (meta) {
                case "create_room":
                    createRoom(data,ws);
                    console.log(rooms)
                    break;
                case "join_room":
                    joinRoom(data,ws)
                    console.log(rooms)
                    break;
                case "send_message":
                    sendMessage(data,ws)
                    console.log(rooms)
                    break;
                case "show_all_rooms":
                    ws.send(JSON.stringify({
                        'rooms':[rooms]
                    }))
                    break;
                default:
                    ws.send(JSON.stringify({
                        'message':'Unsupported meta data provided provide valid data',
                        'status':0
                    }))
                    break;
            }
        });

        ws.on('close',function(data){
            leaveRoom(ws,{roomId:ws.roomId,client:ws.clientId,message:"Leave request"})
            ws.terminate();
        })

        ws.on('pong',heartbeat);
    } catch (error) {
        ws.send(JSON.stringify({
            'status':0,
            'message':"there was some problem"+error
        }))
    }
});


const interval = setInterval(function ping(){
    var a =webSocketServer.clients;
    webSocketServer.clients.forEach(function each(ws){
        if (ws.isAlive===false){
            leaveRoom(ws,{roomId:ws.roomId,clientId:ws.clientId});
            ws.terminate();

        }
        ws.isAlive=false;
        ws.ping(noop);
    });
},50000)

const serverFree = setInterval(()=>{
    var removeKey = [];
    for(const obj in rooms){
      if(rooms[obj].length<1){
        removeKey.push(obj);
      }
    }
    for(var i =0; i<removeKey.length;i++){
      delete rooms[removeKey[i]];
    }
  },30000)