import { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import gql from "graphql-tag";




type Response ={
    message: string
}

type CreateTodoResponse = {
    createTodo: Response
}

type TodoVariables = {
    title: string,
    description: string
    xpReward: number
    userId: string
}

type TodoInput = {
    input: TodoVariables
}


const CREATE_TODO:TypedDocumentNode<CreateTodoResponse, TodoInput> = gql`
  mutation CreateTodo($input: TodoInput) {
    createTodo(input: $input) {
      message
    }
  }
`;

export const useCreateTodo = ()=>{
    const [createTodo, { loading: mutationLoading }] = useMutation(CREATE_TODO);
    return {createTodo, mutationLoading }
}