import { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';

const UPDATEUNCOMPLETE_TODO = gql`
  mutation UncompleteTodo($userId: ID!, $todoId: ID!) {
    uncompleteTodo(userId: $userId, todoId: $todoId) {
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

export const useUncompletedTodo = () => {
  const [unCompletedTodo] = useMutation(UPDATEUNCOMPLETE_TODO);
  return { unCompletedTodo };
};
