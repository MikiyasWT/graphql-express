const express = require("express");
const {graphqlHTTP} = require("express-graphql")
const cors = require("cors")
const {GraphQLSchema,GraphQLObjectType,GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull} = require("graphql")


const app = express();
app.use(cors());

const authors = [
    {id:1,name:"J.K. Rowling"},
    {id:2,name:"J.R.R Tolkien"},
    {id:3,name:"Brent Wooks"},
]

const books = [
    { id:1,name:"Harry Potter and the chamber of secrets",authorId:1},
    { id:2,name:"Harry Potter and the Prisoners of Azkaban",authorId:1},
    { id:3,name:"Harry Potter and the Goblets of Fire",authorId:1},
    { id:4,name:"The Fellowship of the Ring",authorId:2},
    { id:5,name:"The Two Towers",authorId:2},
    { id:6,name:"The Return of the KIng",authorId:2},
    { id:7,name:"The way of the shadows",authorId:3},
    { id:8,name:"Beyond the shadows",authorId:3},
]


const BookType = new GraphQLObjectType({
    name:'Book',
    description:'This represents a book written by an author',
    fields: () => ({
        id:{type:new GraphQLNonNull(GraphQLInt)},
        name:{type:new GraphQLNonNull(GraphQLString)},
        authorId:{type:new GraphQLNonNull(GraphQLInt)},
        authors:{type:AuthorType,
        resolve: (book) => {
            return authors.find(author => author.id === book.authorId)
        }}
    })
})

const AuthorType = new GraphQLObjectType({
    name:'Author',
    description:'This return a list of authors',
    fields: () => ({
        id:{type:new GraphQLNonNull(GraphQLInt)},
        name:{type:new GraphQLNonNull(GraphQLString)},
        books:{
            type:new GraphQLList(BookType),
            resolve:(author) => {
               return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name:'query',
    //fields return a function that returns an object
    fields:() => ({
            book:{
                type:BookType,
                description:"only a single book",
                args:{
                    id:{type:GraphQLInt}
                },
                resolve : (parent,args) => books.find(book => book.id === args.id)
            },
            books:{
                type:new GraphQLList(BookType),
                description:"List of All books",
                resolve : () => books
            },

            author:{
                type:AuthorType,
                description:"returns a single author",
                args:{
                    id:{type:GraphQLInt}
                },
                resolve: (parents,args) => authors.find(author => author.id === args.id) 
            },
            authors:{
                type:new GraphQLList(AuthorType),
                description:"List of All authors",
                resolve : () => authors 
            }
    })
})


const RootMutationType = new GraphQLObjectType({
    name:"mutation",
    description:'root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description:'Add a book',
            args:{
                name:{ type:new GraphQLNonNull(GraphQLString) },
                authorId:{type:new GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args) => {
                 const book = {
                    id:books.length+1,
                    name:args.name,
                    authorId:args.authorId
                }

                books.push(book)
                return book;
            }
        }
    })
})
// const schema = new GraphQLSchema({
//     query:new GraphQLObjectType({
//         name:"test",
//         fields: () => ({
//             message:{
//                 type:GraphQLString,
//                 resolve: ()=> "graphql test"
//             },
//             author:{
//                 type:GraphQLString,
//                 resolve: ()=> "mikiyas"
//             } 
//         })

//     })
// });




const schema = new GraphQLSchema({
    query:RootQueryType,
    mutation:RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema:schema,
    graphiql:true
}))

app.listen(7000,()=>{
    console.log("app running on localhost:7000")
})


