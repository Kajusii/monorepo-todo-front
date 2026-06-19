import { Context } from '../../../types/index';

export const getUserByUserId = async (_: unknown, args: {userId: string}, ctx: Context) => {
  const { db } = ctx;
const user = await db.user.findFirst({
    where: {
        id: args.userId
    }
})
return user
};
