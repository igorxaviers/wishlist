import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { createContext, MyContext } from './context'
import { routes } from './routes'

async function start() {
  const app = express()
  const httpServer = http.createServer(app)
  const apolloServer = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ],
  })  
  await apolloServer.start()
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }))
  app.use(express.json())
  app.use(express.static('public'))
  
  // Rotas HTTP para teste no navegador
  app.get('/api/test', routes.test)
  app.post('/api/register', routes.register)
  app.post('/api/login', routes.login)
  app.get('/api/me', routes.me)
  app.get('/api/wishlists', routes.getWishlists)
  app.post('/api/wishlists', routes.createWishlist)
  app.get('/api/wishlists/:id', routes.getWishlist)
  app.get('/api/wishlists/:id/items', routes.getWishlistItems)
  app.post('/api/wishlists/:id/items', routes.addWishlistItem)
  app.get('/api/users/:userId/wishlists', routes.getUserWishlists)
  
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  )
  
  const PORT = process.env.PORT || 4000
  await httpServer.listen({ port: PORT })
  console.log(`🚀 API rodando na porta ${PORT}`)
  console.log(`📖 GraphQL Studio: http://localhost:${PORT}/graphql`)
  console.log(`🌐 API REST: http://localhost:${PORT}/api/test`)
  console.log(`🧪 Página de Teste: http://localhost:${PORT}/test.html`)
}

start()
