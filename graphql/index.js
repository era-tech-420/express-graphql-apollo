const { loadFiles } = require("@graphql-tools/load-files");
const { printSchema } = require("graphql");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { loadSchema } = require("@graphql-tools/load");

const graphqlModules = async () => {
  //   const typeDefs = await loadSchema("./**/*.graphql", {
  //     loaders: [new GraphQLFileLoader()],
  //   });

  const typeDefs = mergeTypeDefs(await loadFiles("./**/*.graphql"));
  const resolvers = mergeResolvers(await loadFiles("./**/*.resolver.js"));

  //   console.log(printSchema(typeDefs), resolvers);
  const schema = {
    typeDefs,
    resolvers,
  };

  return schema;
};

module.exports = {
  graphqlModules,
};
