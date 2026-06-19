'use client';

import { Button, Input } from '@todo-monorepo/shadcn';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Quest } from '../components/Quest';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { Header } from '../components/Headers';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { useCompletedTodo } from '../hooks/useCompletedTodo';
import { useUncompletedTodo } from '../hooks/useUncompletedTodo';
import { gql, TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

// --- Leveling Logic Utilities ---
export const xpForLevel = (level: number): number => {
  return (100 * level * (level - 1)) / 2;
};

export const getLevel = (totalXp: number): number => {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
};

type LevelData = {
  current: number;
  level: number;
  needed: number;
};

export const xpWithinLevel = (totalXp: number): LevelData => {
  const level = getLevel(totalXp);
  const current = totalXp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  return { level, current, needed };
};
// ---------------------------------

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Task Name must be at least 5 characters.')
    .max(32, 'Task Name must be at most 32 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(100, 'Description must be at most 100 characters.'),
  xpReward: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'XP must be a valid number.')
    .refine((val) => Number(val) >= 10, 'Minimum XP is 10.')
    .refine((val) => Number(val) <= 1000, 'Maximum XP is 1000.'),
});

type FormType = z.infer<typeof formSchema>;

// --- GraphQL Types & Documents ---
type Todo = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
};

type GetTodoByUserIdType = {
  getTodoByUserId: Todo[];
};

type GetTodoByUserIdVariable = {
  userId: string;
};

const GET_TODOS: TypedDocumentNode<
  GetTodoByUserIdType,
  GetTodoByUserIdVariable
> = gql`
  query GetTodoByUserId($userId: ID!) {
    getTodoByUserId(userId: $userId) {
      id
      title
      description
      xpReward
      isCompleted
    }
  }
`;

type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

type GetUserByUserIdType = {
  getUserByUserId: User;
};

type GetUserByUserIdVariable = {
  userId: string;
};

const GET_USER: TypedDocumentNode<
  GetUserByUserIdType,
  GetUserByUserIdVariable
> = gql`
  query GetUserByUserId($userId: ID!) {
    getUserByUserId(userId: $userId) {
      id
      name
      xp
      level
    }
  }
`;
// ----------------------------

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateX: -15 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 200, damping: 15, mass: 1.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: -30,
    transition: { duration: 0.25, ease: 'backIn' },
  },
};

const Page = () => {
  const params = useParams();
  const userId = params?.userId as string;

  const { createTodo, mutationLoading } = useCreateTodo();
  const { deleteTodo } = useDeleteTodo();
  const { completedTodo } = useCompletedTodo();
  const { unCompletedTodo } = useUncompletedTodo();

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      xpReward: '10',
    },
  });

  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_TODOS, {
    variables: { userId },
    skip: !userId,
  });

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
  });

  const onSubmit = async (values: FormType) => {
    try {
      await createTodo({
        variables: {
          input: {
            title: values.title,
            description: values.description,
            xpReward: Number(values.xpReward),
            userId,
          },
        },
        refetchQueries: [{ query: GET_TODOS, variables: { userId } }],
      });
      form.reset({ title: '', description: '', xpReward: '10' });
    } catch (err) {
      console.error('Error creating todo:', err);
    }
  };

  const onDelete = async (todoId: string) => {
    try {
      await deleteTodo({
        variables: { input: { todoId, userId } },
        refetchQueries: [
          { query: GET_TODOS, variables: { userId } },
          { query: GET_USER, variables: { userId } },
        ],
      });
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const handleCheckBox = async (
    todoId: string,
    checked: boolean,
    _xpReward?: number | string,
  ) => {
    try {
      if (checked) {
        await completedTodo({
          variables: { todoId, userId },
          refetchQueries: [
            { query: GET_TODOS, variables: { userId } },
            { query: GET_USER, variables: { userId } },
          ],
        });
      } else {
        await unCompletedTodo({
          variables: { todoId, userId },
          refetchQueries: [
            { query: GET_TODOS, variables: { userId } },
            { query: GET_USER, variables: { userId } },
          ],
        });
      }
    } catch (err) {
      console.error('Error updating todo status:', err);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            borderRadius: ['20%', '50%', '20%'],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-transparent border-t-fuchsia-500 border-b-cyan-500"
        />
      </div>
    );
  }

  if (!userData?.getUserByUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
        DATA STREAM OFFLINE
      </div>
    );
  }

  const user = userData.getUserByUserId;
  const {
    level,
    current: currentXp,
    needed: neededXp,
  } = xpWithinLevel(user.xp);
  const progressPercentage = neededXp > 0 ? (currentXp / neededXp) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-fuchsia-950 text-slate-100 p-6 md:p-12 lg:p-16 overflow-hidden relative">
      {/* Decorative ambient background blur orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* 1. Header & Progression Section */}
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 1.2 }}
          className="space-y-8"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <Header userData={user} />
          </div>

          {/* Epic XP Progress HUD */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 opacity-50" />

            <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-tighter uppercase drop-shadow-sm">
                  Level {level}
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Secure targets to accelerate progression.
                </p>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                {currentXp} / {neededXp} XP
              </motion.span>
            </div>

            <div className="w-full bg-slate-900/50 rounded-full h-4 overflow-hidden border border-white/10 relative z-10 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 relative"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 2, type: 'spring', bounce: 0.1 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* 2. Content Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Active Objectives Feed */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                Active Queue
              </h2>
              <span className="text-sm font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {data?.getTodoByUserId?.length || 0} Targets
              </span>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-md text-red-200 p-4 rounded-2xl border border-red-500/50">
                Critical error locating data vectors.
              </div>
            )}

            <div className="space-y-5">
              {queryLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="h-28 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {!queryLoading && data?.getTodoByUserId?.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="flex flex-col items-center justify-center py-20 px-6 bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-[2.5rem]"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(217,70,239,0.4)] rotate-12">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Sector Clear
                  </h3>
                  <p className="text-slate-400 font-medium text-center">
                    No active targets detected. Initialize a new sequence below.
                  </p>
                </motion.div>
              )}

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <AnimatePresence mode="popLayout">
                  {data?.getTodoByUserId?.map((todo: Todo) => (
                    <motion.div
                      key={todo.id}
                      layout="position"
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group"
                    >
                      <div className="bg-slate-900/40 backdrop-blur-lg border border-white/10 hover:border-fuchsia-500/50 transition-colors duration-300 rounded-3xl shadow-lg hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]">
                        <Quest
                          {...todo}
                          onToggle={handleCheckBox}
                          onDelete={onDelete}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Creation Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-12">
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: 30 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden"
            >
              {/* Neon border glow accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  Establish Target
                </h2>
                <p className="text-slate-400 font-medium mt-1">
                  Inject a new objective into the mainframe.
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-cyan-300 tracking-widest uppercase">
                    Designation
                  </label>
                  <Input
                    {...form.register('title')}
                    placeholder="e.g., Optimize routing protocols"
                    className="bg-slate-900/50 border-white/10 text-white rounded-2xl text-base h-14 px-4 transition-all focus:bg-slate-900/80 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent placeholder:text-slate-500 shadow-inner"
                  />
                  {form.formState.errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 font-bold"
                    >
                      {form.formState.errors.title.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-cyan-300 tracking-widest uppercase">
                    Parameters
                  </label>
                  <textarea
                    {...form.register('description')}
                    placeholder="Define execution parameters..."
                    rows={4}
                    className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-base text-white focus:outline-none focus:bg-slate-900/80 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none placeholder:text-slate-500 shadow-inner"
                  />
                  {form.formState.errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 font-bold"
                    >
                      {form.formState.errors.description.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-fuchsia-300 tracking-widest uppercase">
                    Yield (XP)
                  </label>
                  <Input
                    {...form.register('xpReward')}
                    type="number"
                    placeholder="250"
                    className="bg-slate-900/50 border-white/10 text-fuchsia-300 font-bold rounded-2xl text-base h-14 px-4 transition-all focus:bg-slate-900/80 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent placeholder:text-slate-600 shadow-inner"
                  />
                  {form.formState.errors.xpReward && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 font-bold"
                    >
                      {form.formState.errors.xpReward.message}
                    </motion.p>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl h-14 px-6 text-base font-bold bg-transparent border-white/20 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                      onClick={() => form.reset()}
                    >
                      Clear
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      type="submit"
                      className="w-full rounded-2xl h-14 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-base font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] border-0 transition-all disabled:opacity-50"
                      disabled={mutationLoading}
                    >
                      {mutationLoading ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                          Transmitting...
                        </span>
                      ) : (
                        'Execute Deployment'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
