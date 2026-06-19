'use client';

import { Button, Input } from '@todo-monorepo/shadcn';
import { useMutation, useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import { ChangeEvent, useState } from 'react';

type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

type GetUsersResponse = {
  getUsers: User[];
};

type CreateUserResponse = {
  createUser: {
    message: string;
  };
};

type CreateUserVariables = {
  name: string;
};

const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      name
      xp
      level
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!) {
    createUser(name: $name) {
      message
    }
  }
`;

const Page = () => {
  const { data, loading, error, refetch } =
    useQuery<GetUsersResponse>(GET_USERS);

  const [createUser, { loading: userLoading }] = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER);

  const [inputValue, setInputValue] = useState({ name: '' });
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const onSubmit = async () => {
    if (!inputValue.name.trim()) return;

    try {
      const res = await createUser({
        variables: {
          name: inputValue.name,
        },
      });

      // 4. Added optional chaining (?.) because res.data can be undefined
      if (res.data?.createUser?.message === 'Success') {
        await refetch();
        setInputValue({ name: '' });
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    if (name === 'userName') {
      // 5. Use functional state update to prevent stale state issues
      setInputValue((prev) => ({ ...prev, name: value }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex relative font-sans overflow-hidden">
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-1/4 left-0 w-[40rem] h-[40rem] bg-purple-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* --- Top Right: Small Users Button & Dropdown --- */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end">
        <Button
          variant="outline"
          onClick={() => setIsUsersOpen(!isUsersOpen)}
          className="bg-neutral-950 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/20 text-purple-100 text-sm h-10 px-6 rounded-full transition-all duration-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          {loading
            ? 'Scanning...'
            : `Active Users (${data?.getUsers?.length || 0})`}
        </Button>

        {/* Dropdown List */}
        {isUsersOpen && (
          <div className="mt-3 w-80 bg-neutral-950/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] p-2 overflow-hidden flex flex-col max-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xs font-bold text-purple-400/70 uppercase tracking-widest px-3 py-3">
              Network Registry
            </h3>

            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1 pb-1">
              {error && (
                <p className="text-xs text-red-400 px-3">
                  Network error: Failed to fetch.
                </p>
              )}
              {!loading && !error && data?.getUsers?.length === 0 && (
                <p className="text-sm text-purple-300/50 px-3 pb-2 italic">
                  Registry empty.
                </p>
              )}

              {/* 6. Replaced 'any' with the specific 'User' type */}
              {data?.getUsers?.map((user: User) => (
                <div
                  key={user.id}
                  className="group flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-transparent transition-all duration-300 cursor-default"
                >
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-purple-100 transition-colors truncate pr-3">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-neutral-900 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-md whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                      Lv. {user.level || 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Left Side: Create User Form (Majority Space) --- */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 max-w-4xl relative z-10">
        <div className="space-y-10 relative">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-purple-100 to-purple-800 bg-clip-text text-transparent pb-2 drop-shadow-sm">
              Create User
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-lg leading-relaxed">
              Inject a new user identity into the workflow network. Assign
              parameters below.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 max-w-md pt-4">
            <div className="space-y-3 group">
              <label
                htmlFor="userName"
                className="text-sm font-semibold text-purple-300/70 pl-1 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors"
              >
                Identity Hash (Name)
              </label>
              <Input
                id="userName"
                placeholder="e.g. Operator-01"
                name="userName"
                value={inputValue.name}
                onChange={handleInput}
                autoComplete="off"
                className="bg-neutral-950 border-purple-500/20 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:border-purple-400 h-14 px-5 rounded-2xl text-base transition-all duration-300 hover:border-purple-500/50 shadow-inner shadow-black"
              />
            </div>

            <Button
              onClick={onSubmit}
              disabled={userLoading || !inputValue.name.trim()}
              className="h-14 rounded-2xl bg-purple-600 text-white hover:bg-purple-500 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 font-bold text-lg mt-2 disabled:opacity-50 disabled:hover:bg-purple-600 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              {userLoading ? 'Initializing...' : 'Deploy User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
