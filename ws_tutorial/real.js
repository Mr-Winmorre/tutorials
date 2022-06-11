import {child, getDatabase,push,ref,set, update,runTransaction,equalTo,query,onValue,onChildAdded} from 'firebase/database'
import {initializeApp} from 'firebase/app'
import {WebSocketServer} from 'ws'
import cs from 'cassandra-driver'
import {parse,stringify} from 'flatted';

const { Client,auth,ExecutionProfile,consistency,DCAwareRoundRobinPolicy } = cs;
// var webSocketServer = new (require('ws')).Server({port: (process.env.PORT || 5000)});
var server = new WebSocketServer({port:(process.env.PORT || 5000)})
const realtimeDbUrl = "https://aimo-bd00d-default-rtdb.firebaseio.com/"
// const cassandra = require('cassndra-driver')

// set up cassandra 
const authProvidder = new auth.PlainTextAuthProvider("cassandra","cassandra")

// const driverProfile = new ExecutionProfile('driver-profile',{
    // consistency:consistency.localQuorum,
    // loadBalancing:new DCAwareRoundRobinPolicy('us-west'),
//     readTimeout:50000,
//     serialConsistency:consistency.localSerial
// })

// const chatProfile = new ExecutionProfile('chat-profile',{
    // consistency:consistency.localOne,
    // loadBalancing: new DCAwareRoundRobinPolicy('us-west'),
//     readTimeout:50000,
//     serialConsistency:consistency.localSerial
// })

// const roomsProfile = new ExecutionProfile('room-profile',{
    // consistency:consistency.localQuorum,
    // loadBalancing:new DCAwareRoundRobinPolicy('us-west'),
//     readTimeout:50000,
//     serialConsistency:consistency.localSerial
// })

// const connectionProfile = new ExecutionProfile('connection-profile',{
    // consistency:consistency.localQuorum,
    // loadBalancing:new DCAwareRoundRobinPolicy('us-west'),
//     readTimeout:50000,
//     serialConsistency:consistency.localSerial
// })

// const defaultProfile = new ExecutionProfile('default', {
//     consistency: consistency.one,
//     readTimeout: 50000
//   })

const cassandra = new Client({
    contactPoints: ['0.0.0.0:9042','0.0.0.0:9043','0.0.0.0:9044'],
    localDataCenter:'datacenter1',
    keyspace: "aimo",
    applicationName:"aimo",
    applicationVersion:"version 1.0.0",
    authProvider:authProvidder
    // profiles:[defaultProfile,driverProfile,chatProfile,roomsProfile,connectionProfile]

})


const createKeySpace = async (keyspaceName,ws)=>{
    let query = `CREATE KEYSPACE ${keyspaceName} WITH REPLICATION = {'class':'NetworkTopologyStrategy','replication_factor':2}`
    cassandra.execute(query).then(result=>{
        console.log(`keyspacce created successfully ${result}`)
        console.log(consistency)
        ws.send("keyspace created successfully")
    }).catch(err=>{
        console.log(`Error occured creating keyspace ${err}`)
    })
}

// create type profile
const createTypeProfile = (ws)=>{
    let query = `CREATE TYPE profile(
       firstName text,
       lastName text,
       profilePicture text,
       city text,
       gender text, 
    )`

    cassandra.execute(query).then(result=>{
        console.log(`profile type created successfully ${result}`)
        ws.send(`profile type created successfully ${result}`)
    }).catch(err=>{
        console.log(`Error occured ${err}`)
        ws.send(`Error occured ${err}`)
    })
}

const createAccountSummaryType=(ws)=>{
    let query =`CREATE TYPE accountSummary(
        rating int,
        totalTrips int,
        totalDistanceTravelled double
    )`

    cassandra.execute(query).then(result=>{
        console.log(`Type created successfully ${result}`)
        ws.send(`Type created successfully ${result}`)
    }).catch(err=>{
        console.log(`Error occured creating ${err}`)
        ws.send(`Error occured creating ${err}`)
    })
}

// create table or column family
const createDriversTable = async (ws)=>{
    let query = `CREATE TABLE drivers(
        driverId text,
        status text,
        phone varint,
        lat double,
        lng double,
        dist float,
        vehicleSpeed float,
        profile frozen<profile>,
        accountSummary frozen<accountSummary>,
        destLat double,
        destLng double,
        eta varint,
        PRIMARY KEY ((status),driverId,phone)
    ) WITH compaction={'class':'SizeTieredCompactionStrategy'}`

    cassandra.execute(query).then(result=>{
        console.log(`driver table created successfully ${result}`)
        ws.send(`driver table created successfully ${result}`)
    }).catch(err=>{
        console.log(`Error occured creating drivers table ${err}`)
        ws.send(`Error occured creating drivers table ${err}`)
    })
}

const createConnectionTable = async (ws)=>{
    let query = `CREATE TABLE IF NOT EXISTS userConnections (
        userId text,
        phone varint,
        connection text,
        creationDate timestamp,
        PRIMARY KEY ((userId),creationDate)
    ) WITH compaction={'class':'LeveledCompactionStrategy'} AND CLUSTERING ORDER BY (creationDate DESC)`

    cassandra.execute(query).then(result=>{
        console.log(`user connections table created successfully ${result}`)
        ws.send(`user connections table created successfully ${result}`)
    }).catch(err=>{
        console.log(`Error occured creating user connections table ${err}`)
        ws.send(`Error occured creating user connections table ${err}`)
    })
}

const createMessagesType=async (ws)=>{
    let query = `CREATE TYPE messages (
        frm varint,
        msg text,
        creationDate timestamp
    )`

    cassandra.execute(query).then(rs=>{
        console.log(`Type messages created ${rs}`)
        ws.send(`Type messages created ${rs}`)
    }).catch(err=>{
        console.log(`Error occured creating type message ${err}`)
        ws.send(`Error occured creating type message ${err}`)
    })
}

const createChatTable = async (ws)=>{
    let query = `CREATE TABLE chats (
        roomId text,
        creationDate timestamp,
        participants map<text,text>,
        messages list<frozen <messages>>,
        PRIMARY KEY ((roomId),creationDate)
    ) WITH CLUSTERING ORDER BY (creationDate DESC)`

    cassandra.execute(query).then(result=>{
        console.log(`Chat table created successfully ${result}`)
        ws.send(`Chat table created successfully ${result}`)
    }).catch(err=>{
        console.log(`Error creating chat table ${err}`)
        ws.send(`Error creating chat table ${err}`)
    })
}


const insertIntoDriversTable =async(params,ws)=>{
    let query = `INSERT INTO drivers (driverId,status,phone,lat,lng,dist,vehicleSpeed,profile,accountSummary,destLat,destLng,eta) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    cassandra.execute(query,params,{prepare:true}).then(result=>{
        console.log(`Insertion to drivers table successful ${result}`)
        ws.send(`Insertion to drivers table successful ${result}`)
    }).catch(err=>{
        console.log(`Error occured trying to insert into drivers table ${err}`)
        ws.send(`Error occured trying to insert into drivers table ${err}`)
    })
}

const addParticipantToChat = (paticipant,roomId,ws)=>{
    let query = `UPDATE chats SET participants = ${paticipant} + participants WHERE roomId=${roomId}`
    cassandra.execute(query,{prepare:true}).then(result=>{
        console.log(`Participant added successfully to chat${result}`)
        ws.send(`Participant added successfully to chat${result}`)
    }).catch(err=>{
        console.log(`Error occured adding participant to chat ${err}`)
        ws.send(`Error occured adding participant to chat ${err}`)
    })
}

const addMessageToChat = async (message,roomId,ws)=>{
    let query = `UPDATE chats SET messages=messages + ${message} WHERE roomId= ${roomId}`
    cassandra.execute(query,{prepare:true}).then(result=>{
        console.log(`Message added to chat successful ${result}`)
        ws.send(`Message added to chat successful ${result}`)
    }).catch(err=>{
        console.log(`Error occured tyring to add message ${err}`)
        ws.send(`Error occured tyring to add message ${err}`)
    })
}

const insertIntoChatsTable = async (params,ws)=>{
    let query = `INSERT INTO chats (roomId,creationDate,participants,messages) VALUES (?,toTimestamp(now()),?,?)`
    cassandra.execute(query,params,{prepare:true}).then(result=>{
        console.log(`Inserted into chats successfully ${result}`)
        ws.send(`Inserted into chats successfully ${result}`)
    }).catch(err=>{
        ws.send(`error Occured inserting into chats ${err}`)
    })
}

const insertIntoConnectionsTable = async (params,ws)=>{
    let query = `INSERT INTO userConnections (userId,phone,connection,creationDate) VALUES(?,?,?,toTimestamp(now()))`
    cassandra.execute(query,params,{prepare:true}).then(result=>{
        console.log(`data inserted into user connections successfully ${result}`)
        ws.send(`data inserted into user connections successfully ${result}`)
    }).catch(err=>{
        console.log(`Error occured inserting into user connections table ${err}`)
        ws.send(`Error occured inserting into user connections table ${err}`)
    })
} 
// set up firebase realtime db
const firebaseConfig = {
    apiKey: "AIzaSyAbcmtaccgHfjGX5mtlVFFZWIcsN6LDctA",
    authDomain: "aimo-bd00d.firebaseapp.com",
    databaseUrl: realtimeDbUrl,
    projectId: "aimo-bd00d",
    storageBucket: "aimo-bd00d.appspot.com",
    messagingSenderId: "657993458583",
    appId: "1:657993458583:web:b94fc8607b3f0fa1765ad2",
    measurementId: "G-1TD4LQ3HCX"
  };

  const app = initializeApp(firebaseConfig)
//   get data base
 let db = getDatabase(app)
  

async function writeDriverData(paylaod){
    set(ref(db,"driver/"),paylaod).then(()=>{
        console.log("successful")
    }).catch((error)=>{
        console.log(error)
    })
}

async function updateData(payload,driverId){
    // get a post key
    const key = push(child(ref(db),'driver')).key
    const updates = {}
    updates['driver'+key]=payload
    //try this too
    updates['driver'+driverId+key]=payload 

    return update(ref(db),updates)
}

async function transactionalUpdate(driverId,lat,lng){
    const driverRef = ref(db,'driver/'+driverId);
    return runTransaction(driverRef,(d)=>{
        if (d) {
            d.lat=lat;
            d.lng=lng;
        }
        console.log(d)

        return d;
    })
}


//   async function getDrivers(payload) {
//     let dbRef =  db.ref("driver")
//     let drivers = []
//     dbRef.on("child_added").then(async (snapshot)=>{
//         console.log(snapshot.val())
//         let data = snapshot.val();
//         let filteredByVehicle = await compareVehicle(data,payload.data.VehicleType)
//         // if the result is zero notify user that ther are no vehicles matching the requested vehicle atm
//         let filteredByStatus =await filteredByVehicle.filter(compareStatus)
//         // if the result data is empty notify user 
//         let updateDistance =await filteredByStatus.forEach((el)=>{
//             el.dist = calculateShortestDistance(el.lat,el.lng,el.destLat,el.destLng)
//         })

//         // filter by shortest distance
//         let filteredByDistance= await getDriverWithShortest(updateDistance,maxDistant)
//         filteredByDistance.forEach((dr)=>{drivers.push(dr)})
//     }).catch((error)=>{
//         console.log(`Error occured :  ${error}`)
//     })
//     return drivers;
// }

server.on("connection",(ws)=>{
    console.log("connected succesfully")
    // createKeySpace("aimo",ws)
    cassandra.connect();
    // console.log(ws)
    
            
    ws.send("connected successfully")

    ws.on('message',async (data)=>{

        var {meta}=JSON.parse(data)
        console.log(meta)
        
        switch (meta) {
            case 'add_chat':
                const part = {'123abc':JSON.stringify(ws)}
                const message= {
                    frm:"'123abc",
                    msg:"Hello you can say anything",
                    creationDate: Date.now()
                }
                const params = ['100',part,[message]]
                insertIntoChatsTable(params,ws)
                break;
            case 'create_types':
                createAccountSummaryType(ws)
                createMessagesType(ws)
                createTypeProfile(ws)
                break;
            case 'create_tables':
                createChatTable(ws);
                createConnectionTable(ws);
                createDriversTable(ws);
                break;
            
            case 'add_driver':
                const accountSum = {
                    rating:500,
                    totalTrips:100,
                    totalDistanceTravelled:10098.30
                }
                const profile = {
                    firstName:"Jason",
                    lastName:"Winmorre",
                    profilePicture:"https://images.pexels.com/photos/11129005/pexels-photo-11129005.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                    city:"Accra",
                    gender:"Male"
                }
                const param = ["1mjdn","AVAILABLE","+233554550436",-0.46782,3.78653,undefined,30.0,profile,accountSum,undefined,undefined,undefined]
                insertIntoDriversTable(param,ws)
                break;
            case 'add_connection':
                var m = stringify(ws)
                const payload=['joy100','+233505588063',m]
                insertIntoConnectionsTable(payload,ws)
                break;
            case 'get_driver':
                const query = `SELECT * FROM drivers`
                cassandra.execute(query).then(res=>{
                    console.log(res)
                    ws.send(JSON.stringify(res.rows))
                }).catch(err=>{
                    console.log(err)
                    ws.send(`Error occured ${err}`)
                })
                break;
            default:
                break;
        }
       
            // let dbRef = db.ref("driver")
            // let payload = {
            //     "driverId":"098466ldnauhd",
            //     "status":"Busy",
            //     "phone":"+23350550436",
            //     "lat":-0.8792848,
            //     "lng":5.0098,
            //     "dist": null,
            //     "vehicleSpeed":null,
            //     "profile":{
            //         "firstName":"Kinto",
            //         "lastName":"Team",
            //         "profilePicture":"",
            //         "city":"Accra",
            //         "gender":"Female"
            //     },
            //     "vehicleType":"MotoCycle",
            //     "accountSummary":{
            //         "rating":500,
            //         "totalTrips":10,
            //         "totalDistanceTravelled":90
            //     },
            //     "destLat":"",
            //     "destLng":" ",
            //     "eta":""
            // }
            // dbRef.set(payload,(err)=>{
            //     console.log(err)
            //     ws.send(JSON.stringify(err+"Added successfully"))
            // })
        
    })
})