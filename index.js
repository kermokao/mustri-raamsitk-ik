const express = require("express")
const app = express()

const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) =>{

    fs.readFIle("./tasks", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        } 

        const tasks = data.split("\n")   
        res.render("index", {tasks:tasks})
    }); 
})
 

app.listen(3001, () => {
    console.log("Example app is started at http://localhost:3001")
 })   
