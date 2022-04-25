const mongoose = require('mongoose')


const connect_db = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/graphql_db")
        console.log("mongodb connected successfully")
    } catch (error) {
        console.log(error)
    }
}

module.exports = connect_db