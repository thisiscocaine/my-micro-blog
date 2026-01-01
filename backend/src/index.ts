	import 'dotenv/config';
	import express from 'express';
	import cookieParser from 'cookie-parser';
	import { ApolloServer } from 'apollo-server-express';
	import { typeDefs } from './schema.js';
	import { resolvers } from './resolvers.js';
	import { createContext } from './context.js';
	import { corsMw, helmetMw } from './security.js';

	const app = express();
	app.use(cookieParser());
	app.use(corsMw());
	app.use(helmetMw);
	app.use(express.json({ limit: '5mb' }));

	const server = new ApolloServer({
	  typeDefs,
	  resolvers,
	  context: ({ req, res }) => createContext({ req, res })
	});

	await server.start();
	server.applyMiddleware({ app, path: '/graphql', cors: false });

	const port = process.env.PORT || 4000;
	app.listen(port, () => {
	  console.log(`API ready at http://localhost:${port}/graphql`);
	});
