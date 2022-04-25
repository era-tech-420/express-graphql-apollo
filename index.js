const express = require('express')
const res = require('express/lib/response')
const app = express()
const PORT=5000
const {ApolloServer} = require('apollo-server-express')
const {resolvers,typeDefs} = require('./schama')



app.get("/",(req,res)=>{
    return res.send("Home page")
})



const startApolloServer = async()=>{
    const server = new ApolloServer({typeDefs, resolvers})
    await server.start()

    server.applyMiddleware({app,path:"/graphql"})

    console.log(`apollo server is running at http://localhost:${PORT}${server.graphqlPath}`)
}

startApolloServer()

app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`)
})