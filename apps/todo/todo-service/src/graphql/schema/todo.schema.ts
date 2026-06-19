import gql from 'graphql-tag';

export const todoTypeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    description: String
    xpReward: Int!
    isCompleted: Boolean!
  }

  input TodoInput {
    title: String!
    description: String
    xpReward: Int!
    userId: String!
  }

  input TodoUpdate {
    isCompleted: Boolean!
    todoId: String!
  }
  type CompleteTodoResponse {
    message: String!
    xpGained: Int! # Олсон XP (20)
    leveledUp: Boolean! # Level ахсан эсэх
    newLevel: Int! # Шинэ level
    newXp: Int! # Шинэ нийт XP
    currentLevelXp: Int! # Level дотор хуримтлагдсан XP
    xpToNextLevel: Int! # Дараагийн level-д хэдэн XP дутуу
  }

  input TodoDelete {
    todoId: String!
    userId: String!
  }

  type Response {
    message: String!
  }

  type Query {
    getTodoByUserId(userId: ID!): [Todo]!
  }

  type Mutation {
    createTodo(input: TodoInput): Response!
    updateTodo(input: TodoUpdate): Response!
    deleteTodo(input: TodoDelete): Response!
    completeTodo(todoId: ID!, userId: ID!): CompleteTodoResponse!
    uncompleteTodo(todoId: ID!, userId: ID!): CompleteTodoResponse!
  }
`;
