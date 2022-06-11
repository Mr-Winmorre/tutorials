import { v4 as uuidv4 } from 'uuid';
import pkg from "pg";
import ww from 'ws';
const {Client} = pkg
const {WebSocket,WebSocketServer}=ww
var webSocketServer = WebSocketServer({port: (process.env.PORT || 5000)});
const clC = {
    user:"aimo",
    password:"aimo-test-db",
    host:"localhost",
    port:5432,
    database:"aimo",
}

const cl = new Client(clC)

async function createReq(p){
    await cl.connect();
    const res = await cl.query('INSERT INTO Request(id,createdOn,destination,pickUpAddress,individualId,packageId,vehicleTypeId,paymentTypeId,promoId,scheduleDate,scheduleTime,driverETA,confirmCompletedCode) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
    [uuidv4(),Date.now(),p.destination,p.pickUpAddress,p.pickUpAddress,p.individualId,p.packageId,p.vehicleTypeId,p.paymentTypeId,p.promoId,p.scheduleDate,p.scheduleTime,p.driverETA,p.confirmCompletedCode])
    cl.end();
    console.log(res)
    return res.rows;
}

const rooms ={}
webSocketServer.on('connection',function(ws){
    const uuid = uuidv4()
    // const leave = room=>{
    //     // if uuid is not in room : do nothing
    //     if(! rooms[room][uuid]) return;

    //     // if the uuid is last in the room then destroy room
    //     if(Object.keys(rooms[room]).length===1) delete rooms[room];
    //     // other wise simply room this uuid from room
    //     else delete rooms[room][uuid];
    // }

    ws.on('message',async function(data){
        // const {meta}=JSON.parse(data)s
        let pay = {
            destination:"19c64d81-58ec-4e34-9610-c77f469c6549",
            individualId:"9dd9a7a6-bebd-40f6-9715-dc2adebb9f03",
            vehicleTypeId:"cef1934d-6c27-4843-a234-97874cc3c837",
            paymentTypeId:"0bea66b0-a189-470f-88df-9607a3d089de",
            packageId:"78610ec8-9da0-4a43-8cf9-043714b24756",
            promoId:"060c4b09-0732-4d25-be0a-ab8fb3d3f777",
            scheduleDate:Date.now(),
            scheduleTime:"09:20",
            estimatedCost:90.00,
            driverETA:300.00,
            recipientPhone:"+233554550436"
        }
        var res = await createReq(pay);
            ws.send(JSON.stringify(res));
        // const {message,meta,room}=data;
        // if (meta==="join") {
        //     if(! rooms[room]) rooms[room]={}
        //     if(!rooms[room][uuid]) rooms[room][uuid]=ws;//ass to room 
        // } else if(meta==="leave") {
        //     leave(room)
        // }else if(! meta){
        //     // send message to all in the room 
        //     Object.entries(rooms[room]).forEach(([,sock])=> sock.send({message}));
        // }
    })

    ws.on("close",()=>{
        // for each room, remove the closed connections
        Object.keys(rooms).forEach(room=>leave(room));
    })
})