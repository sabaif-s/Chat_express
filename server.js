
const express= require("express");
const http=require("http");

const app=express();
const server=http.createServer(app);

const {Server}=require("socket.io");

const io= new Server(server, {
    cors:{
        origin:"*",
    }
})


io.on("connection",(socket)=>{
    console.log("User is connected with :",socket.id);
    socket.on("client_ready",(data)=>{
        console.log(data);
    })
})

server.listen(3001,()=>{
    console.log("server is running on port 3001");
});