import express from 'express'
import http from 'http'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'

async function start() {
  const app = express()
  const httpServer = http.createServer(app)

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await apolloServer.start()

  app.use(cors(), express.json(), expressMiddleware(apolloServer))
  
  const PORT = process.env.PORT || 4000
  await httpServer.listen({ port: PORT })
  console.log(`🚀 API rodando na porta ${PORT}`)
}

start()
