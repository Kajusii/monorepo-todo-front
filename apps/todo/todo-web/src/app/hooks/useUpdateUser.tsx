
import { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import gql from "graphql-tag";





const UPDATE_USER= gql`
mutation UpdateUser($input: UserUpdate) {
  updateUser(input: $input) {
    message
  }
}

`;

export const useUpdateUser = ()=>{
    const [updateUser] = useMutation(UPDATE_USER);
    return { updateUser}
}