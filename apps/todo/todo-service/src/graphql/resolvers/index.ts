import * as Query from './queries';
import * as Mutation from './mutations';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getTodoByUserId: Query.getTodoByUserId,
    getUserByUserId: Query.getUserByUserId,
  },
  Mutation: {
    createUser: Mutation.createUser,
    createTodo: Mutation.createTodo,
    updateTodo: Mutation.updateTodo,
    deleteTodo: Mutation.deleteTodo,
    updateUser: Mutation.updateUser,
    completeTodo: Mutation.completeTodo,
    uncompleteTodo: Mutation.uncompleteTodo,
  },
};
