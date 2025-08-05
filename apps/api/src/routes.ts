import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePasswords } from './auth/hash';
import { generateToken, verifyToken } from './auth/jwt';

const prisma = new PrismaClient();

// Middleware para extrair token
const getAuthUser = async (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const userId = verifyToken(token);
  if (!userId) return null;
  
  return await prisma.user.findUnique({ where: { id: userId } });
};

export const routes = {
  // Rota de teste
  test: (req: Request, res: Response) => {
    res.json({ 
      message: 'API Wishlist funcionando!', 
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/test - Esta mensagem',
        'POST /api/register - Registrar usuário',
        'POST /api/login - Fazer login',
        'GET /api/me - Usuário logado (requer token)',
        'GET /api/wishlists - Listar wishlists',
        'POST /api/wishlists - Criar wishlist',
        'GET /api/wishlists/:id - Buscar wishlist',
        'GET /api/wishlists/:id/items - Itens da wishlist',
        'POST /api/wishlists/:id/items - Adicionar item',
        'GET /api/users/:userId/wishlists - Wishlists do usuário'
      ]
    });
  },

  // Registrar usuário
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      });

      const token = generateToken(user.id);
      
      res.json({
        message: 'Usuário registrado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const valid = await comparePasswords(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = generateToken(user.id);
      
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Usuário logado
  me: async (req: Request, res: Response) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Token inválido ou não fornecido' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Listar wishlists
  getWishlists: async (req: Request, res: Response) => {
    try {
      const wishlists = await prisma.wishlist.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: true
        }
      });

      res.json({
        wishlists: wishlists.map(w => ({
          id: w.id,
          title: w.title,
          isPublic: w.isPublic,
          createdAt: w.createdAt,
          user: w.user,
          itemsCount: w.items.length
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar wishlists:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar wishlist
  createWishlist: async (req: Request, res: Response) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Token inválido ou não fornecido' });
      }

      const { title, isPublic = false } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
      }

      const wishlist = await prisma.wishlist.create({
        data: { 
          userId: user.id, 
          title, 
          isPublic 
        }
      });

      res.status(201).json({
        message: 'Wishlist criada com sucesso',
        wishlist: {
          id: wishlist.id,
          title: wishlist.title,
          isPublic: wishlist.isPublic,
          createdAt: wishlist.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao criar wishlist:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar wishlist específica
  getWishlist: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const wishlist = await prisma.wishlist.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: true
        }
      });

      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist não encontrada' });
      }

      res.json({
        wishlist: {
          id: wishlist.id,
          title: wishlist.title,
          isPublic: wishlist.isPublic,
          createdAt: wishlist.createdAt,
          user: wishlist.user,
          items: wishlist.items
        }
      });
    } catch (error) {
      console.error('Erro ao buscar wishlist:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar itens da wishlist
  getWishlistItems: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const wishlist = await prisma.wishlist.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist não encontrada' });
      }

      res.json({
        wishlistId: id,
        items: wishlist.items
      });
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Adicionar item à wishlist
  addWishlistItem: async (req: Request, res: Response) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Token inválido ou não fornecido' });
      }

      const { id } = req.params;
      const { title, description, url, imageUrl } = req.body;
      
      if (!title || !description || !url) {
        return res.status(400).json({ error: 'Título, descrição e URL são obrigatórios' });
      }

      // Verificar se a wishlist existe e pertence ao usuário
      const wishlist = await prisma.wishlist.findUnique({
        where: { id }
      });

      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist não encontrada' });
      }

      if (wishlist.userId !== user.id) {
        return res.status(403).json({ error: 'Você só pode adicionar itens às suas próprias wishlists' });
      }

      const item = await prisma.wishlistItem.create({
        data: {
          wishlistId: id,
          title,
          description,
          url,
          imageUrl: imageUrl || ''
        }
      });

      res.status(201).json({
        message: 'Item adicionado com sucesso',
        item
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Wishlists de um usuário específico
  getUserWishlists: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const wishlists = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          items: true
        }
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        wishlists: wishlists.map(w => ({
          id: w.id,
          title: w.title,
          isPublic: w.isPublic,
          createdAt: w.createdAt,
          itemsCount: w.items.length
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar wishlists do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}; 