require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_IP = process.env.MONGO_IP;
const MONGO_PORT = process.env.MONGO_PORT || 27017;

const db_URL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/devops?authSource=admin`;
// const db_URL = "mongodb://mongo:27017/ikemdb";

const connectWithRetry = () => {
  mongoose
    .connect(db_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("connected to DB"))
    .catch((err) => {
      console.log(err);
      setTimeout(connectWithRetry, 10000);
    });
};
connectWithRetry();

app.use(express.json());
app.enable("trust proxy");

app.get("/", (req, res) => {
  console.log("YYeah it run");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <h1>Cloud Docker Container!</h1> 
      <br /> 
      <form>
        <input type="text" name="fullname" placeholder="name" /> 
        <br /> 
        <input type="text" name="age" placeholder="age"/>
        <p><p>
        <button type="submit">Create User</button> 
      </form>
      <a href="/users"><button>See Users</button></a>
      <script>
        const form = document.querySelector("form")
        form.addEventListener("submit", async(e)=>{
          e.preventDefault();
          
          try{
            const res = await fetch("/", {
              method:"POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name:e.target.fullname.value, 
                age:e.target.age.value,
              })
            });
            const data = await res.json()
            console.log(data);
            if(!data.error){
              document.querySelector("p").textContent = "created user";
            }else{
              document.querySelector("p").textContent = "data.error";
            }
          }catch(err){
            console.log(err);
          }
        })
      </script>
    </body>
    </html>
  `);
});

app.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(users);
});

app.post("/", async (req, res) => {
  console.log(req.body);

  const user = await User.create({ ...req.body });
  res.status(201).json(user);
});

const port = process.env.PORT;

app.listen(port, () => console.log(`port running on port ${port}`));
