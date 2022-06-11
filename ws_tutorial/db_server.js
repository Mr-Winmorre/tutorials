import pkg from "pg";
const {Client} = pkg
var server = new (require('ws')).Server({port: (process.env.PORT || 5000)});

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
    [uuid4(),Date.now(),p.destination,p.pickUpAddress,p.pickUpAddress,p.individualId,p.packageId,p.vehicleTypeId,p.paymentTypeId,p.promoId,p.scheduleDate,p.scheduleTime,p.driverETA,p.confirmCompletedCode])
    cl.end();
    console.log(res)
    return res.rows;
}

server.on('connect',(ws)=>{
  ws.send('Connected successfully')

  ws.on('message',async (data)=>{
      const {meta}=JSON.parse(data)
      switch (meta) {
          case 'test_create':
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
            break;
      
          default:
              break;
      }
  })
} )