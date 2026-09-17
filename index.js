const express = require("express")
const app = express()
const fs = require("fs")
const path = require("path")

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))

// Set default locals for templates
app.locals = {
    tasks: [],
    error: null
}



const readFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, "utf8", (err, data) => {
            if (err){
                console.error(err);
                reject(err);
                return;
            } 
            const tasks = JSON.parse(data)
            resolve(tasks)
        }); 
    }) 
}

app.get("/", (req, res) => {
    readFile("./tasks.json")
        .then(tasks => {
            console.log(tasks)
            res.render("index", {tasks: tasks, error: null})
        })
        .catch(err => {
            console.error(err);
            res.render("index", {tasks: [], error: null})
        })
})

app.post("/", (req, res) =>{
    let taskText = req.body.task ? req.body.task.trim() : ""
    
    if(taskText.length == 0){
        readFile("./tasks.json")
            .then(tasks => {
                res.render("index", {
                    tasks: tasks,
                    error: "Please insert correct task data"
                })
            })
            .catch(err => {
                console.error(err);
                res.render("index", {tasks: [], error: "Please insert correct task data"})
            })
        return
    }
    
    readFile("./tasks.json")
        .then(tasks => {
            let index
            if (tasks.length === 0)
            {  
                index = 1
            } else {
                index = tasks[tasks.length-1].id + 1;
            }

            const newTask = {
                "id": index,
                "task": taskText
            }

            console.log(newTask)
            tasks.push(newTask)
            console.log(tasks)
            const data = JSON.stringify(tasks, null, 2)

            fs.writeFile("./tasks.json", data, err => {
                if (err) {
                    console.error(err);
                    return;
                } 
                res.redirect("/")
            }) 
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Unable to save task")
        })
})

app.get("/delete-task/:taskId", (req, res) => {
    let deletedTaskId = Number(req.params.taskId)
    readFile("./tasks.json")
    .then(tasks => {
        tasks.forEach((task, index) => {
            if(task.id == deletedTaskId) {
                tasks.splice(index, 1)
            }               
    })
    const data = JSON.stringify(tasks, null, 2)
    fs.writeFile("./tasks.json", data, "utf-8", err => {
        if (err) {
            return;
        }
        res.redirect("/") 
    })
   }) 
})

app.get("/edit-task/:taskId", (req, res) => {
    let taskId = Number(req.params.taskId)
    console.log("Edit route - received taskId:", taskId)
    
    readFile("./tasks.json")
        .then(tasks => {
            let foundTask = tasks.find(task => task.id == taskId)
            console.log("Edit route - found task:", foundTask)
            
            if (!foundTask) {
                return res.redirect("/")
            }
            
            res.render("edit-task", { task: foundTask, error: null })
        })
        .catch(err => {
            console.error(err)
            res.status(500).send("Unable to load task")
        })
})

app.post("/update-task", (req, res) => {
    let taskId = Number(req.body.id)
    let taskText = req.body.task ? req.body.task.trim() : ""
    
    console.log("Update route - received taskId:", taskId)
    console.log("Update route - received task text:", taskText)
    
    if (taskText.length == 0) {
        readFile("./tasks.json")
            .then(tasks => {
                let foundTask = tasks.find(task => task.id == taskId)
                res.render("edit-task", {
                    task: foundTask || { id: taskId, task: "" },
                    error: "Please insert correct task data"
                })
            })
            .catch(err => {
                console.error(err)
                res.status(500).send("Unable to load task")
            })
        return
    }
    
    readFile("./tasks.json")
        .then(tasks => {
            let itemIndex = tasks.findIndex(task => task.id == taskId)
            
            if (itemIndex === -1) {
                return res.redirect("/")
            }
            
            tasks[itemIndex].task = taskText
            const data = JSON.stringify(tasks, null, 2)
            
            fs.writeFile("./tasks.json", data, err => {
                if (err) {
                    console.error(err)
                    return
                }
                res.redirect("/")
            })
        })
        .catch(err => {
            console.error(err)
            res.status(500).send("Unable to update task")
        })
})

app.post("/clear-tasks", (req, res) => {
    const data = JSON.stringify([], null, 2)
    fs.writeFile("./tasks.json", data, "utf8", (err) => {
        if (err) {
            console.error(err)
            return res.status(500).send("Unable to clear tasks")
        }
        console.log("All tasks cleared")
        res.redirect("/")
    })
})

 
app.listen(3001, () => {
    console.log("Example app is started at http://localhost:3001")
})   
