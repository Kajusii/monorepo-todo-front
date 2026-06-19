
import { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import gql from "graphql-tag";





const DELETE_TODO= gql`
 mutation DeleteTodo($input: TodoDelete) {
  deleteTodo(input: $input) {
    message
  }
}
`;

export const useDeleteTodo = ()=>{
    const [deleteTodo] = useMutation(DELETE_TODO);
    return { deleteTodo}
}