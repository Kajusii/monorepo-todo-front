import { Context } from '../../../types/index';

export const getUsers = async (_: unknown, __: unknown, ctx: Context) => {
  const { db } = ctx;
  return await db.user.findMany();
};
