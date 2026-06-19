'use client';

import { Button } from '@todo-monorepo/shadcn';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import { useRouter } from 'next/navigation';
import { TypedDocumentNode } from '@apollo/client';

type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

// FIX 1: The API returns an array, so it must be User[]
type getUsersType = {
  getUsers: User[];
};

const GET_USERS: TypedDocumentNode<getUsersType> = gql`
  query GetUsers {
    getUsers {
      id
      name
      xp
      level
    }
  }
`;

const Page = () => {
  const { data, loading, error, refetch } = useQuery<getUsersType>(GET_USERS);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex flex-col relative font-sans overflow-hidden p-8 md:p-24">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-purple-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-purple-100 to-purple-800 bg-clip-text text-transparent pb-2 drop-shadow-sm">
              All Users
            </h1>
            <p className="text-neutral-400 text-lg max-w-lg leading-relaxed">
              Overview of all active operators currently deployed within the
              workspace.
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            disabled={loading}
            className="bg-neutral-950 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/20 text-purple-100 h-12 px-8 rounded-2xl transition-all duration-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
          >
            {loading ? 'Syncing Data...' : 'Refresh Registry'}
          </Button>
        </div>

        {/* Status Handling */}
        {error && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-400 p-4 rounded-2xl text-sm">
            Network error: Failed to retrieve directory. {error.message}
          </div>
        )}

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-neutral-900/40 rounded-[2rem] border border-purple-500/10 animate-pulse"
              />
            ))}

          {/* FIX 2: Used the specific 'User' type instead of 'any' */}
          {data?.getUsers.map((user: User) => (
            <div
              key={user.id}
              className="group relative overflow-hidden bg-neutral-950 border border-purple-500/20 p-6 hover:border-purple-500/60 transition-all duration-500 ease-out cursor-default rounded-[2rem] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:-translate-y-1"
              onClick={() => {
                router.push(`/${user.id}`);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-purple-100 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                      Hash: {user.id.slice(0, 12)}...
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-purple-500/30 flex items-center justify-center group-hover:border-purple-400/60 shadow-inner shadow-black transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-purple-900/30 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.1)] group-hover:bg-purple-900/50 transition-colors">
                    Level {user.level || 1}
                  </span>
                  <span className="text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-3 py-1.5 rounded-lg whitespace-nowrap group-hover:border-neutral-700 transition-colors">
                    {user.xp || 0} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
