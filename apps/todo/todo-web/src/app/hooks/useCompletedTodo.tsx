import { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';

const UPDATECOMPLETE_TODO = gql`
  mutation CompleteTodo($todoId: ID!, $userId: ID!) {
    completeTodo(todoId: $todoId, userId: $userId) {
      message
      xpGained
      leveledUp
      newLevel
      newXp
      currentLevelXp
      xpToNextLevel
    }
  }
`;

export const useCompletedTodo = () => {
  const [completedTodo, data] = useMutation(UPDATECOMPLETE_TODO);
  return { completedTodo, data };
};
