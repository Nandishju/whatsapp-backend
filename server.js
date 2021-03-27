import express from "express";
import mongoose from 'mongoose';
import Messages from "./dbMessages.js";
import Pusher from "pusher"
import cors from "cors"

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1175940",
    key: "be134a202162a707608b",
    secret: "7c4316c8dd20d4b6e908",
    cluster: "ap2",
    useTLS: true
});

//middleware

app.use(express.json());
app.use(cors())

// app.use((req,res,next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-header", "*");
//     next();

// })

//DB config

const connectionUrl = `mongodb+srv://admin:8jtpg0zDzItEQLBX@cluster0.esbia.mongodb.net/whatsappdb?retryWrites=true&w=majority`
mongoose.connect(connectionUrl, {
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db = mongoose.connection

db.once('open', () => {
    console.log("DB Connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log("A change occured", change);

    if (change.operationType === 'insert')  {
        const messageDetails = change.fullDocument;
        pusher.trigger('messages', 'inserted' ,{
            name:messageDetails.name,
            message:messageDetails.message,
            timeStamp:messageDetails.timeStamp,
            received:messageDetails.received
        });

    }
        else {
            console.log('Error triggering Pusher')
        }
    });
});


//api routes
app.get('/' , (req,res)=>res.status(200).send("hello world"));

app.get("/messages/details", (req,res) => {
    Messages.find((err,data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post("/messages/new", (req,res) => {
    const dbMessages = req.body;

    Messages.create(dbMessages, (err,data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data);
        }
    });
});


//listen

app.listen(port, ()=> console.log(`Listening the localhost backend:${port}`))