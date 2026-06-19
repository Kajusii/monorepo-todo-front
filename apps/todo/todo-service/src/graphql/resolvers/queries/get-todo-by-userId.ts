import { Context } from '../../../types/index';

export const getTodoByUserId = async (_: unknown, args: {userId: string}, ctx: Context) => {
  const { db } = ctx;
const todo = await db.todo.findMany({
    where: {
        userId: args.userId
    }
})
return todo
};
