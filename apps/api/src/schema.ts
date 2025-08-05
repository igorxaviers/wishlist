export const typeDefs = `#graphql
  type User {
    id: String!
    name: String!
    email: String!
    createdAt: String!
  }

  type Wishlist {
    id: String!
    userId: String!
    title: String!
    isPublic: Boolean!
    createdAt: String!
  }

  type WishlistItem {
    id: String!
    wishlistId: String!
    title: String!
    description: String!
    url: String!
    imageUrl: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    wishlists: [Wishlist!]!
    wishlist(id: String!): Wishlist
    wishlistItems(wishlistId: String!): [WishlistItem!]!
    wishlistsByUser(userId: String!): [Wishlist!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createWishlist(userId: String!, title: String!, isPublic: Boolean!): Wishlist!
    createWishlistItem(wishlistId: String!, title: String!, description: String!, url: String!, imageUrl: String!): WishlistItem!
  }
`
