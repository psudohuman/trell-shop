const express = require('express')
const api = express()
const PORT = 4000
const clientConfigResponse = require('./ClientConfig_GETResponse')
const getInstallBannersResponse = require('./getInstallBanners')

api.get('/', (req, res)=> {
    res.send("Welcome")
})
api.get('/ClientConfig', (req,res)=> {
    res.status(200).json(clientConfigResponse)
})

api.get('/getInstallBanners', (req,res)=> {
    res.status(200).json(getInstallBannersResponse)
})

api.get('/getNavivationREST', (req,res)=> {
    res.status(200).json(clientConfigResponse)
})
api.listen(PORT, ()=> console.log(clientConfigResponse))

// const express = require('express');
// const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');
// const expressGraphQL = require('express-graphql').graphqlHTTP;

// const app = express()

// const authors = [
//     {id: 01, name:'J.k Rowling'},
//     {id: 02, name:'J.R.R Towlkien'},
//     {id: 03, name:'Brent Weeks'}
// ]

// const books = [
//     {id:01, name: 'Harry Potter and the Chamber of Secrets'},
//     {id:02, name: 'Harry Potter and the Prisoner of Azkaban'},
//     {id:03, name: 'Harry Potter and the Goblet of Fire', authorId: 1},
//     {id:04, name: 'The fellowship of the Ring', authorId: 2},
//     {id:05, name: 'The Two Towers', authorId: 2},
//     {id:06, name: 'The Return of the King', authorId: 2},
//     {id:07, name: 'The Way of Shadows', authorId: 3},
//     {id:08, name: 'Beyond the Shadows', authorId: 3}
// ]

// const BookType = new GraphQLObjectType({
//     name: 'Book',
//     description: 'This represents a book written by an author',
//     fields: ()=> ({
//         id: { type: GraphQLNonNull(GraphQLInt) },
//         name: { type: GraphQLNonNull(GraphQLString) },
//         authorId: { type: GraphQLNonNull(GraphQLInt) }
//     })
// })

// const RootQueryType = new GraphQLObjectType ({
//     name: 'Query',
//     description: 'Root Query',
//     fields: () => ({
//         books: {
//             type: new GraphQLList(BookType),
//             description: 'List of All Books',
//             resolve: ()=> books
//         }
//     })
// })

// const schema = new GraphQLSchema ({
//     query: RootQueryType,

// })

// // const schema = new GraphQLSchema ({
// //     query: new GraphQLObjectType({
// //         name: 'HelloWorld',
// //         fields: () => ({
// //             message: {
// //                 type: GraphQLString,
// //                 resolve: ()=> 'Hello World'
// //             }
// //         })
// //     })
// // })

// app.use('/graphql', expressGraphQL({
//     schema: schema,
//     graphiql:true
// }))
// app.listen(4000., () => console.log('Server Running'))
