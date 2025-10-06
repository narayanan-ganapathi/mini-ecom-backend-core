// GraphQL schema
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

export const typeDefs = `
 type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int
    category: String
    createdAt: String
    updatedAt: String
  }


  type CartItem {
    productId: ID!
    quantity: Int!
    product: Product
  }

  type Cart {
    id: ID!
    userId: String!
    items: [CartItem!]!
    createdAt: String
    updatedAt: String
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
    product: Product
  }

  type Order {
    id: ID!
    userId: String!
    items: [OrderItem!]!
    totalPrice: Float!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
    cart(userId: String!): Cart
    order(id: ID!): Order
    orders(userId: String!): [Order!]!
  }


  input ProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int
    category: String
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  input OrderInput {
    productId: ID!
    quantity: Int!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean
    addToCart(userId: String!, productId: ID!, quantity: Int!): Cart
    placeOrder(userId: String!, items: [OrderInput!]!, totalPrice: Float!): Order
  }
`;
