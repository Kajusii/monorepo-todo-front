import gql from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    xp: Int!
    level: Int!
    todos: [Todo]!
  }

  type Response {
    message: String!
  }

  type Query {
    getUsers: [User]!
  }
  input UserUpdate{
   
    id:String!
    xpReward:Int!


  }

  type Mutation {
    createUser(name: String!): Response!
    

  }
  type Mutation {
    updateUser(input:UserUpdate): Response!
  }
  type Query {
    getUserByUserId(userId: ID!): User!
  }
`;
