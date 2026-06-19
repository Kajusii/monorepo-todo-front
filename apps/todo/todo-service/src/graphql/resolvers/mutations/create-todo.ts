import { Context } from "../../../types/index";

type Todo = { input:{
    title: string ,
    description:string,
    xpReward:number,
    userId:string
}
};
export const createTodo = async (_: unknown, args: Todo, context: Context) => {
  const { db } = context;
  const {title, description, xpReward, userId} = args.input;
  try {
    await db.todo.create({ data:{
        title, description, xpReward, userId
    } });
    return { message: 'Success' };
  } catch (err: unknown) {
    throw new Error(`System err message: ${err}` );
  }
};