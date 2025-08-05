import { hashPassword, comparePasswords } from './auth/hash'
import { generateToken } from './auth/jwt'
import { MyContext } from './context'

export const resolvers = {
  Query: {
    me: async (parent, args, contextValue: MyContext) => {
      if (!contextValue.userId) return null
      return contextValue.prisma.user.findUnique({ where: { id: contextValue.userId } })
    },
    wishlists: async (parent, args, contextValue: MyContext) => {
      return contextValue.prisma.wishlist.findMany()
    },
    wishlistsByUser: async (parent, args, contextValue: MyContext) => {
      const { userId } = args
      return contextValue.prisma.wishlist.findMany({
        where: { userId }
      })
    },
    wishlist: async (parent, args, contextValue: MyContext) => {
      const { id } = args
      return contextValue.prisma.wishlist.findUnique({
        where: { id },
        include: {
          user: true,
          items: true
        }
      })
    },
    wishlistItems: async (parent, args, contextValue: MyContext) => {
      const { wishlistId } = args
      
      // Verificar se a wishlist existe
      const wishlist = await contextValue.prisma.wishlist.findUnique({
        where: { id: wishlistId }
      })
      
      if (!wishlist) {
        throw new Error('Wishlist does not exist')
      }
      
      return contextValue.prisma.wishlistItem.findMany({
        where: { wishlistId },
        orderBy: { createdAt: 'desc' }
      })
    }
  },
  Mutation: {
    register: async (parent, args, contextValue: MyContext) => {
      const { name, email, password } = args
      const passwordHash = await hashPassword(password)
      const user = await contextValue.prisma.user.create({
        data: { name, email, passwordHash },
      })
      const token = generateToken(user.id)
      return { token, user }
    },
    login: async (parent, args, contextValue: MyContext) => {
      const { email, password } = args
      const user = await contextValue.prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error('Invalid credentials')
      const valid = await comparePasswords(password, user.passwordHash)
      if (!valid) throw new Error('Invalid credentials')
      const token = generateToken(user.id)
      return { token, user }
    },
    createWishlist: async (parent, args, contextValue: MyContext) => {
      const { userId, title, isPublic } = args
      const user = await contextValue.prisma.user.findFirst({ where: { id: userId } })
      if (!user) throw new Error('User does not exist')
      const wishlist = await contextValue.prisma.wishlist.create({
        data: { userId, title, isPublic }
      })
      return wishlist
    },
    createWishlistItem: async (parent, args, contextValue: MyContext) => {
      const { wishlistId, title, description, url, imageUrl } = args
      
      // Verificar se a wishlist existe
      const wishlist = await contextValue.prisma.wishlist.findUnique({
        where: { id: wishlistId }
      })
      
      if (!wishlist) {
        throw new Error('Wishlist does not exist')
      }
      
      // Verificar se o usuário logado é o dono da wishlist (opcional, para segurança)
      if (contextValue.userId && wishlist.userId !== contextValue.userId) {
        throw new Error('You can only add items to your own wishlists')
      }
      
      const wishlistItem = await contextValue.prisma.wishlistItem.create({
        data: {
          wishlistId,
          title,
          description,
          url,
          imageUrl
        }
      })
      
      return wishlistItem
    }
  },
}
