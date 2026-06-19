import { GraphQLError } from 'graphql';
import { getLevel, xpWithinLevel } from '../../../lib/xp';
import { Context } from '../../../types/index';

type Todo = {
  input: {
    todoId: string;
    userId: string;
  };
};
export const deleteTodo = async (_: unknown, args: Todo, context: Context) => {
  const { db } = context;
  const { todoId, userId } = args.input;
  const todo = await db.todo.findUnique({ where: { id: todoId } });
  if (!todo) throw new GraphQLError('Todo not found');
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new GraphQLError('Todo not found');
  const xpGained = todo.xpReward;
  const oldLevel = getLevel(user.xp);
  const newXp = user.xp - xpGained;
  const newLevel = getLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  if (todo.isCompleted) {
    await db.todo.delete({
      where: {
        id: todoId,
      },
    });
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });
  }
  if (!todo.isCompleted) {
    const { current, needed, level } = xpWithinLevel(user.xp);
    await db.todo.delete({
      where: {
        id: todoId,
      },
    });
    return {
      message: 'Already  false',
      xpGained: 0,
      leveledUp: false,
      newLevel: level,
      newXp: user.xp,
      currentLevelXp: current,
      xpToNextLevel: needed,
    };
  }

  return { message: 'Success' };
};
