'use client';

import { useQuery } from '@apollo/client/react';
import { Button, Input } from '@todo-monorepo/shadcn';
import gql from 'graphql-tag';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Quest } from '../components/Quest';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { useUpdateTodo } from '../hooks/useUpdateTodo';
import { Header } from '../components/Headers';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useCompletedTodo } from '../hooks/useCompletedTodo';
import { useUncompletedTodo } from '../hooks/useUncompletedTodo';
import { TypedDocumentNode } from '@apollo/client';

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

type FormtType = z.infer<typeof formSchema>;

// --- Fixed GraphQL Types ---
type Todo = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean; // Added missing isCompleted property
};

type GetTodoByUserIdType = {
  getTodoByUserId: Todo[]; // Changed from Todo to Todo[]
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

const Page = () => {
  const params = useParams();
  const userId = params?.userId as string;

  const { createTodo, mutationLoading } = useCreateTodo();
  const { updateTodo } = useUpdateTodo();
  const { updateUser } = useUpdateUser();
  const { deleteTodo } = useDeleteTodo();
  const { completedTodo } = useCompletedTodo();
  const { unCompletedTodo } = useUncompletedTodo();

  const form = useForm<FormtType>({
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
  } = useQuery(GET_TODOS, { variables: { userId }, skip: !userId });

  const { data: userData, loading: userloading } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
  });

  const onSubmit = async (values: FormtType) => {
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
    await deleteTodo({
      variables: {
        input: {
          todoId,
          userId,
        },
      },
      refetchQueries: [
        { query: GET_TODOS, variables: { userId } },
        { query: GET_USER, variables: { userId } },
      ],
    });
  };

  const handleCheckBox = async (todoId: string, checked: boolean) => {
    try {
      if (checked === true) {
        await completedTodo({
          variables: {
            todoId: todoId,
            userId,
          },
          refetchQueries: [
            { query: GET_TODOS, variables: { userId } },
            { query: GET_USER, variables: { userId } },
          ],
        });
      }
      if (checked === false) {
        await unCompletedTodo({
          variables: {
            todoId: todoId,
            userId,
          },
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

  // Safe loading state for user query
  if (userloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Early return guards against undefined user profile data, fixing Header/XP TS errors
  if (!userData?.getUserByUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm">
        User profile could not be loaded.
      </div>
    );
  }

  // TypeScript now strictly knows 'user' is fully defined
  const user = userData.getUserByUserId;
  const totalUserXp = user.xp;

  const {
    level,
    current: currentXp,
    needed: neededXp,
  } = xpWithinLevel(totalUserXp);
  const progressPercentage = neededXp > 0 ? (currentXp / neededXp) * 100 : 0;
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-12 lg:p-16 max-w-6xl mx-auto space-y-10">
      {/* 1. Header & Progression Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Header userData={user} />

        {/* Animated XP Progress Bar */}
        <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Level {level}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Complete objectives to gain XP and rank up.
              </p>
            </div>
            <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-md border border-neutral-200">
              {currentXp} / {neededXp} XP
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden border border-neutral-200 shadow-inner">
            <motion.div
              className="bg-neutral-900 h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 2. Content Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Active Objectives Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Active Objectives
            </h2>
            <span className="text-xs font-medium text-neutral-600 bg-neutral-200/60 px-2.5 py-1 rounded-md">
              Count: {data?.getTodoByUserId?.length || 0}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm border border-red-200">
              Failed to load records.
            </div>
          )}

          <div className="max-h-[520px] overflow-y-auto pr-1">
            {/* Added proper UI loading skeletons for the query */}
            {queryLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-neutral-200/40 rounded-xl animate-pulse border border-neutral-200/20"
                  />
                ))}
              </div>
            )}

            {!queryLoading && data?.getTodoByUserId?.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-dashed border-neutral-200 rounded-xl p-12 text-center text-neutral-400 text-sm"
              >
                No active targets allocated to this environment.
              </motion.div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {/* Replaced 'any' with explicit 'Todo' type */}
                {data?.getTodoByUserId?.map((todo: Todo) => (
                  <motion.div key={todo.id} exit="exit" layout>
                    <Quest
                      {...todo}
                      onToggle={handleCheckBox}
                      onDelete={onDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Creation Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="lg:col-span-5 bg-white border border-neutral-200 shadow-sm rounded-xl p-5 space-y-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Create Todo
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Assign an objective to this workspace.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">
                Task Name
              </label>
              <Input
                {...form.register('title')}
                placeholder="e.g., Deploy production build"
                className="bg-white border-neutral-200 text-neutral-950 rounded-xl text-sm transition-all focus:border-neutral-400"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">
                Description
              </label>
              <textarea
                {...form.register('description')}
                placeholder="Provide layout notes..."
                rows={3}
                className="w-full p-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-400 transition-all resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">
                XP Reward
              </label>
              <Input
                {...form.register('xpReward')}
                type="number"
                placeholder="e.g., 250"
                className="bg-white border-neutral-200 text-neutral-950 rounded-xl text-sm transition-all focus:border-neutral-400"
              />
              {form.formState.errors.xpReward && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.xpReward.message}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-sm transition-transform active:scale-95"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-sm w-full px-5"
                  disabled={mutationLoading}
                >
                  {mutationLoading ? 'Saving...' : 'Submit'}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
