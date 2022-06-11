import express,{Express} from 'express';
import morgan from 'morgan';
import routes from './src/routes/posts.route';
import http from 'http';
import WebSocket, {WebSocketServer} from 'ws';

const router:Express = express();

// for logging
router.use(morgan("dev"));
// parse the request
router.use(express.urlencoded({extended:false}));
// takes care of json data
router.use(express.json())

// rules of our api

router.use((req,res,next)=>{
    // set CORS policy
    res.header("Access-Control-Allow-Origin","*");
    // set the cors headers
    res.header("Access-Control-Allow-Headers",'origin, X-Requested-With,Content-Type,Accept,Authorization');
    // set the cors method headers
    if (req.method==='OPTIONS') {
        res.header('Access-Control-Allow-Methods','GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
})

// Routes
router.use('/',routes);

// Error handling

router.use((req,res,next)=>{
    const error = new Error("Not found");
    return res.status(404).json({
        message:error.message
    });
})

// server 
const httpServer = http.createServer(router)
const wssGen =new  WebSocketServer({server:httpServer})
const wssChat = new WebSocketServer({server:httpServer})
const Port:any = process.env.PORT ?? 6060;
httpServer.listen(Port,()=>console.log(`The server is running on port ${Port}`));
