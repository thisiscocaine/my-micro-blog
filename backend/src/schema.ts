import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  enum Role { ADMIN USER }
  enum PostStatus { DRAFT PUBLISHED }
  enum MediaType { IMAGE VIDEO }

  scalar JSON

  type User {
    id: ID!
    email: String!
    role: Role!
    createdAt: String!
  }

  type Media {
    id: ID!
    url: String!
    type: MediaType!
    mime: String!
    size: Int!
    createdAt: String!
  }

  type Counter {
    likes: Int!
    shares: Int!
    comments: Int!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    status: PostStatus!
    author: User!
    coverMedia: Media
    counters: Counter
    createdAt: String!
    updatedAt: String!
    publishedAt: String
  }

  type AuthPayload {
    accessToken: String!
    user: User!
  }

  type PresignedUpload {
    url: String!
    fields: JSON
    publicUrl: String!
    objectKey: String!
    mediaId: ID!
  }

  type Query {
    me: User
    posts(status: PostStatus): [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createPost(title: String!, body: String!, coverMediaId: ID): Post!
    updatePost(id: ID!, title: String, body: String, coverMediaId: ID, status: PostStatus): Post!
    deletePost(id: ID!): Boolean!
    incrementCounters(id: ID!, likes: Int, shares: Int, comments: Int): Counter!
    createUploadUrl(fileName: String!, mime: String!, size: Int!): PresignedUpload!
  }
`;