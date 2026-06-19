type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

type HeaderProps = {
  userData: User;
};

export const Header = ({ userData }: HeaderProps) => {
  return (
    <div className="border-b border-neutral-200 pb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {userData.name || 'Explorer'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Workspace Overview & Objective Pipeline
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white border border-neutral-200 px-4 py-2 rounded-xl shadow-sm">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            Progress
          </p>
          <p className="text-xs font-mono font-medium text-neutral-600">
            {userData.xp || 0} XP
          </p>
        </div>
        <div className="h-8 w-px bg-neutral-200" />
        <span className="text-sm font-bold font-mono bg-neutral-900 text-white h-8 w-8 flex items-center justify-center rounded-lg">
          {userData.level || 1}
        </span>
      </div>
    </div>
  );
};
