const {ApolloServer,gql} = require('apollo-server-express')
const User = require('./models/User')

const typeDefs= gql`

    type User{
        id:ID,
        name:String,
        age:Int
    }

    type Query{
        hello: String,
        users: [User]
    }

    type Mutation{
        createUser(name:String!,age:Int!): User,
        deleteUser(id:ID): Boolean,
        updateUser(id:ID!,name:String,age:Int): Boolean,
    }
`

const resolvers = {
    Query:{
        hello: ()=> "hello world",
        users: async ()=> {
            const users = await User.find({})
            return users
        }
    },
    Mutation:{
        createUser: async (parent,args)=>{
            const {name,age} = args
            const user = await User.create({
                name:name,
                age:age
            })
            return user
        },
        deleteUser:async(parent,args)=>{
           let response = false
           const user_deleted = await User.findByIdAndDelete(args.id)
           if(user_deleted){
                response = true
           } 
           return response
        },
        updateUser: async(parent,args)=>{
            const updated_data = {}
            if(args.name){
                updated_data['name'] = args.name
            }
            if(args.age){
                updated_data['age'] = args.age
            }

            const user_updated = await User.findByIdAndUpdate(args.id, updated_data)
            let response = false
            if(user_updated){
                response = true
            }
            return response
        }
    }
}


module.exports = {
    typeDefs,
    resolvers
}