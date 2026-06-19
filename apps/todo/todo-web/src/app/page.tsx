"use client"
import { Card } from "@todo-monorepo/shadcn"
import { useRouter } from "next/navigation"




const Page = () => {
  const router = useRouter()


  

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex flex-col items-center justify-center p-6 md:p-12 selection:bg-purple-900 overflow-hidden relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-purple-200 to-purple-800 text-transparent bg-clip-text pb-2 drop-shadow-sm">
           Create Your Todos!
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-medium max-w-xl mx-auto">
            Set up your team and start dropping tasks. What do you want to do first?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Create User */}
          <Card 
            onClick={() => router.push("/createUser")}
            className="group relative overflow-hidden bg-neutral-950 border border-purple-500/20 p-8 hover:border-purple-500/60 transition-all duration-500 ease-out cursor-pointer rounded-[2rem] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:-translate-y-2"
          >
            {/* Motion Glow Background inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 group-hover:border-purple-400/60 shadow-lg shadow-purple-900/20">
                <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-purple-100 transition-colors">
                  Add a User
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed group-hover:text-neutral-300 transition-colors">
                  Invite a new user to your workspace and get them set up in seconds.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Manage Todos */}
          <Card 
            onClick={() => router.push("/allusers")}
            className="group relative overflow-hidden bg-neutral-950 border border-purple-500/20 p-8 hover:border-fuchsia-500/60 transition-all duration-500 ease-out cursor-pointer rounded-[2rem] hover:shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:-translate-y-2"
          >
            {/* Motion Glow Background inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-fuchsia-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 group-hover:border-fuchsia-400/60 shadow-lg shadow-fuchsia-900/20">
                <svg className="w-8 h-8 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-fuchsia-100 transition-colors">
                  Manage Todos
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed group-hover:text-neutral-300 transition-colors">
                  Pick a user, assign tasks, and track their progress instantly.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default Page