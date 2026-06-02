require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
    console.log("Mongo Database connected successfully");


    app.listen(process.env.PORT ,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});