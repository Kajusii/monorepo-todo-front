
import { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import gql from "graphql-tag";





const UPDATE_TODO= gql`
  mutation UpdateTodo($input: TodoUpdate) {
    updateTodo(input: $input) {
      message
    }
  }
`;

export const useUpdateTodo = ()=>{
    const [updateTodo] = useMutation(UPDATE_TODO);
    return { updateTodo}
}