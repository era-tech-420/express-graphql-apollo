const express = require("express");
const app = express();
const PORT = 5000;
const { ApolloServer } = require("apollo-server-express");
const { resolvers, typeDefs } = require("./schama");
const db = require("./db")();
const error_responses = require("./error_response");
const { getUserByToken } = require("./utils");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { applyMiddleware } = require("graphql-middleware");
const permissions = require("./permissions");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");

app.get("/", (req, res) => {
  return res.send("Home page");
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

const schemaWithPermissions = applyMiddleware(schema, permissions);

const startApolloServer = async () => {
  const server = new ApolloServer({
    schema: schemaWithPermissions,
    context: async ({ req }) => {
      const user = await getUserByToken(req);
      return user ? { auth_user: user } : null;
    },
    formatError: (err) => error_responses(err),
  });

  app.use(
    graphqlUploadExpress({
      maxFileSize: 1000000000,
      maxFiles: 10,
    })
  );

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
