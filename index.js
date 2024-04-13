const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const allroutes = require('./routes/auth.js')

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Setting up cors(when we give requests (FE<=>BE) it should work without any problems)
app.use(cors({
    origin : "*",  //(we are allowing accept the request from FE if given)
    credentials : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}))

// Routes
app.use("/", allroutes)

// DB connected
mongoose.connect('mongodb+srv://aswinannalath:aswinanna@cluster0.euhk3kw.mongodb.net/Star_Labs', )   //{useNewUrlParser: true, useUnifiedTopology: true}
.then(() => {console.log("Connected to database")})
.catch((error) => {console.log("Error connecting to database",error)})


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});