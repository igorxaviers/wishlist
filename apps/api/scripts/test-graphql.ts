import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'
import fetch from 'cross-fetch'

// Tipos para as respostas
interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Wishlist {
  id: string
  title: string
  isPublic: boolean
  createdAt: string
}

interface AuthPayload {
  token: string
  user: User
}

interface RegisterResponse {
  register: AuthPayload
}

interface LoginResponse {
  login: AuthPayload
}

interface WishlistsResponse {
  wishlists: Wishlist[]
}

interface CreateWishlistResponse {
  createWishlist: Wishlist;
}

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  createdAt: string;
}

interface CreateWishlistItemResponse {
  createWishlistItem: WishlistItem;
}

interface WishlistItemsResponse {
  wishlistItems: WishlistItem[];
}

interface WishlistWithItemsResponse {
  wishlist: Wishlist & {
    items: WishlistItem[];
    user: User;
  };
}

interface MeResponse {
  me: User;
}

// Configurar cliente Apollo
const client = new ApolloClient({
  link: createHttpLink({
    uri: 'http://localhost:4000/graphql',
    fetch,
  }),
  cache: new InMemoryCache(),
})

// Queries e Mutations
const REGISTER_USER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const GET_WISHLISTS = gql`
  query GetWishlists {
    wishlists {
      id
      title
      isPublic
      createdAt
    }
  }
`

const CREATE_WISHLIST = gql`
  mutation CreateWishlist($userId: String!, $title: String!, $isPublic: Boolean!) {
    createWishlist(userId: $userId, title: $title, isPublic: $isPublic) {
      id
      title
      isPublic
      createdAt
    }
  }
`

const CREATE_WISHLIST_ITEM = gql`
  mutation CreateWishlistItem($wishlistId: String!, $title: String!, $description: String!, $url: String!, $imageUrl: String!) {
    createWishlistItem(wishlistId: $wishlistId, title: $title, description: $description, url: $url, imageUrl: $imageUrl) {
      id
      title
      description
      url
      imageUrl
      createdAt
    }
  }
`

const GET_WISHLIST_ITEMS = gql`
  query GetWishlistItems($wishlistId: String!) {
    wishlistItems(wishlistId: $wishlistId) {
      id
      title
      description
      url
      imageUrl
      createdAt
    }
  }
`

const GET_WISHLIST_WITH_ITEMS = gql`
  query GetWishlist($id: String!) {
    wishlist(id: $id) {
      id
      title
      isPublic
      createdAt
      user {
        id
        name
        email
      }
      items {
        id
        title
        description
        url
        imageUrl
        createdAt
      }
    }
  }
`

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
    }
  }
`

async function testGraphQL(): Promise<void> {
  try {
    console.log('🧪 Iniciando testes GraphQL...\n');

    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registerResult = await client.mutate<RegisterResponse>({
      mutation: REGISTER_USER,
      variables: {
        name: 'Teste Usuário',
        email: 'teste@email.com',
        password: '123456'
      }
    });
    
    if (!registerResult.data) {
      throw new Error('Falha ao registrar usuário');
    }

    const { token, user } = registerResult.data.register;
    console.log('✅ Usuário registrado:', user.name);
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Configurar cliente com token
    const authenticatedClient = new ApolloClient({
      link: createHttpLink({
        uri: 'http://localhost:4000/graphql',
        fetch,
        headers: {
          authorization: `Bearer ${token}`
        }
      }),
      cache: new InMemoryCache(),
    });

    // 3. Testar query 'me' com autenticação
    console.log('2. Testando autenticação...');
    const meResult = await authenticatedClient.query<MeResponse>({
      query: GET_ME
    });
    
    if (!meResult.data.me) {
      throw new Error('Falha na autenticação');
    }
    
    console.log('✅ Usuário autenticado:', meResult.data.me.name, '\n');

    // 4. Criar wishlist
    console.log('3. Criando wishlist...');
    const createResult = await authenticatedClient.mutate<CreateWishlistResponse>({
      mutation: CREATE_WISHLIST,
      variables: {
        userId: user.id,
        title: 'Lista de Teste',
        isPublic: true
      }
    });
    
    if (!createResult.data) {
      throw new Error('Falha ao criar wishlist');
    }
    
    const wishlist = createResult.data.createWishlist;
    console.log('✅ Wishlist criada:', wishlist.title, '\n');

    // 5. Criar item na wishlist
    console.log('4. Criando item na wishlist...');
    const createItemResult = await authenticatedClient.mutate<CreateWishlistItemResponse>({
      mutation: CREATE_WISHLIST_ITEM,
      variables: {
        wishlistId: wishlist.id,
        title: 'iPhone 15 Pro',
        description: 'Smartphone da Apple com câmera incrível',
        url: 'https://www.apple.com/iphone-15-pro/',
        imageUrl: 'https://example.com/iphone15pro.jpg'
      }
    });
    
    if (!createItemResult.data) {
      throw new Error('Falha ao criar item na wishlist');
    }
    
    const wishlistItem = createItemResult.data.createWishlistItem;
    console.log('✅ Item criado:', wishlistItem.title, '\n');
    
    // 6. Criar mais um item
    console.log('5. Criando segundo item...');
    await authenticatedClient.mutate<CreateWishlistItemResponse>({
      mutation: CREATE_WISHLIST_ITEM,
      variables: {
        wishlistId: wishlist.id,
        title: 'MacBook Air M2',
        description: 'Notebook leve e potente',
        url: 'https://www.apple.com/macbook-air/',
        imageUrl: 'https://example.com/macbook-air.jpg'
      }
    });
    console.log('✅ Segundo item criado\n');

    // 7. Buscar itens da wishlist
    console.log('6. Buscando itens da wishlist...');
    const itemsResult = await client.query<WishlistItemsResponse>({
      query: GET_WISHLIST_ITEMS,
      variables: { wishlistId: wishlist.id }
    });
    
    if (!itemsResult.data) {
      throw new Error('Falha ao buscar itens da wishlist');
    }
    
    console.log('✅ Itens encontrados:', itemsResult.data.wishlistItems.length);
    itemsResult.data.wishlistItems.forEach((item: WishlistItem) => {
      console.log(`   - ${item.title}: ${item.description}`);
    });
    console.log();
    
    // 8. Buscar wishlist completa com itens
    console.log('7. Buscando wishlist completa...');
    const wishlistWithItemsResult = await client.query<WishlistWithItemsResponse>({
      query: GET_WISHLIST_WITH_ITEMS,
      variables: { id: wishlist.id }
    });
    
    if (!wishlistWithItemsResult.data) {
      throw new Error('Falha ao buscar wishlist completa');
    }
    
    const fullWishlist = wishlistWithItemsResult.data.wishlist;
    console.log('✅ Wishlist completa:', fullWishlist.title);
    console.log('   Dono:', fullWishlist.user.name);
    console.log('   Itens:', fullWishlist.items.length);
    console.log();
    
    // 9. Listar todas as wishlists
    console.log('8. Listando todas as wishlists...');
    const wishlistsResult = await client.query<WishlistsResponse>({
      query: GET_WISHLISTS
    });
    
    if (!wishlistsResult.data) {
      throw new Error('Falha ao buscar wishlists');
    }
    
    console.log('✅ Wishlists encontradas:', wishlistsResult.data.wishlists.length);
    wishlistsResult.data.wishlists.forEach((wishlist: Wishlist) => {
      console.log(`   - ${wishlist.title} (${wishlist.isPublic ? 'pública' : 'privada'})`);
    });

    console.log('\n🎉 Todos os testes passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error instanceof Error ? error.message : 'Erro desconhecido');
    if (error && typeof error === 'object' && 'graphQLErrors' in error) {
      const graphQLErrors = (error as any).graphQLErrors;
      if (Array.isArray(graphQLErrors)) {
        graphQLErrors.forEach((err: any) => console.error('GraphQL Error:', err.message));
      }
    }
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testGraphQL()
}

export { testGraphQL } 