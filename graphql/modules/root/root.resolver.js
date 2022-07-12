const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");

const resolver = {
  Upload: GraphQLUpload,
  Query: {
    _: () => "Query",
  },
  Mutation: {
    _: () => "Mutation",
  },
};

module.exports = {
  resolver,
};
