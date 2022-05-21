const express = require("express");
const res = require("express/lib/response");
const app = express();
const PORT = 5000;
const {
  ApolloServer,
  ValidationError,
  ForbiddenError,
} = require("apollo-server-express");
const { resolvers, typeDefs } = require("./schama");
const db = require("./db")();
const error_responses = require("./error_response");

app.get("/", (req, res) => {
  return res.send("Home page");
});

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => error_responses(err),
  });
  await server.start();

  server.applyMiddleware({ app, path: "/graphql" });

  console.log(
    `apollo server is running at http://localhost:${PORT}${server.graphqlPath}`
  );
};

startApolloServer();

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
