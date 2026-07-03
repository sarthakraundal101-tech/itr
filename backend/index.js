// console.log("hello world");
//here all the backend import lies
const express = require("express");
const morgan = require("morgan");
//give me dummy data for testing crud operations via all postman methods
const dummyData = [
  { id: 1, name: "John", age: 30 },
  { id: 2, name: "Jane", age: 25 },
  { id: 3, name: "Bob", age: 35 },
];




const server = express();
server.use(express.json()); //this is used to parse the json data from the request body
server.use(morgan("dev")); //this is used to log the request and response details in the console




server.get("/", (req, res) => {
  res.send("hello world");
})

// /get /post /put /delete /patch this are the main methods of the express server
server.post("/test", (request,response)=>{
    const{name,age}=request.body; 
    response.json({message:`hello ${name} your age is ${age}`})
})

server.get("/test", (request,response)=>{ 
   const queryReq = request.query; //this is used to get the query parameters from the request
   const paramReq = request.params; //this is used to get the route parameters from the request
   const bodyReq = request.body; //this is used to get the body parameters from the request

   console.log("queryReq", queryReq);
   console.log("paramReq", paramReq);
   console.log("bodyReq", bodyReq);
   
    response.status(200).json({ message: "hello world" });
})

// endpoint for query parameters
server.get("/query", (request,response)=>{
    const queryReq = request.query; 
    response.json({message:`hello ${queryReq.name} your age is ${queryReq.age}`})
}  )

// endpoint for route parameters
server.get("/route/:name/:age", (request,response)=>{
    const paramReq = request.params; 
    response.json({message:`hello ${paramReq.name} your age is ${paramReq.age}`})
}  )        

// endpoint for body parameters
server.post("/body", (request,response)=>{
    const bodyReq = request.body; 
    response.json({message:`hello ${bodyReq.name} your age is ${bodyReq.age}`})
})


server.listen(3000, () => {
  console.log("server is running on port 3000");
})
