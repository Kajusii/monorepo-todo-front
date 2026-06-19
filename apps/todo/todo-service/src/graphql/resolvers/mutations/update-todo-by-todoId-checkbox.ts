import { Context } from "../../../types/index";

type Todo = { input:{
    isCompleted: boolean
    todoId: string,

}
};
export const updateTodo = async (_: unknown, args: Todo, context: Context) => {
  const { db } = context;
  const {isCompleted, todoId} = args.input;
  try {
    await db.todo.update({
        where:{
            id : todoId
              
        },
        data:{
            isCompleted,


        }
    })
    return { message: 'Success' };
  } catch (err: unknown) {
    throw new Error(`System err message: ${err}` );
  }
};