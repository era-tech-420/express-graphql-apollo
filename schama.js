const {ApolloServer,gql} = require('apollo-server-express')

const users = [
    {id:1,name:'a',age:10},
    {id:2,name:'b',age:20},
    {id:3,name:'c',age:30},
    {id:4,name:'d',age:40},
]


const typeDefs= gql`

    type User{
        id:Int,
        name:String,
        age:Int
    }

    type Query{
        hello: String,
        users: [User]
    }

    type Mutation{
        createUser(name:String!,age:Int!): User,
        deleteUser(id:Int): Boolean,
        updateUser(id:Int!,name:String,age:Int): Boolean,
    }
`

const resolvers = {
    Query:{
        hello: ()=> "hello world",
        users: ()=> users
    },
    Mutation:{
        createUser: (parent,args)=>{
            const {name,age} = args
            const user = {id: users.length+1,name,age}
            users.push(user)
            return user
        },
        deleteUser:(parent,args)=>{
            const userIndex = users.findIndex(user=> user.id == args.id)
            let response = false
            if(userIndex!= -1){
                users.splice(userIndex,1)
                response = true
            }
            return response;
        },
        updateUser: (parent,args)=>{
            const userIndex = users.findIndex(user=> user.id == args.id)

            let response = false
            if(userIndex!= -1){
                if(args.name){
                    users[userIndex].name = args.name
                    response = true
                }
                if(args.age){
                    users[userIndex].age = args.age
                    response = true
                }
            }
            return response;
        }
    }
}


module.exports = {
    typeDefs,
    resolvers
}