import { Context } from "../../../types/index";

type User= { input:{
    xpReward:number
 id:string
}
};
export const updateUser = async (_: unknown, args: User, context: Context) => {
  const { db } = context;
  const { xpReward,id} = args.input;
  try {
    await db.user.update({
        where:{
            id
              
        },
        data:{
            xp: xpReward


        }
    })
    return { message: 'Success' };
  } catch (err: unknown) {
    throw new Error(`System err message: ${err}` );
  }
};