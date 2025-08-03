'use client';

import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import { VibeLabLogo } from '@/components/ui/vibe-lab-logo';

export default function SignIn() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Large Logo and Title */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <VibeLabLogo size={160} />
          </div>
          <h1 className="text-3xl font-semibold text-white">Welcome to Vibe Lab</h1>
          <p className="text-[#6B7280]">Sign in to start building your next project</p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn('github')}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        {/* Additional Info */}
        <div className="text-center text-sm text-[#6B7280]">
          <p>By signing in, you agree to our</p>
          <div className="space-x-1">
            <a href="#" className="text-[#3B82F6] hover:underline">Terms of Service</a>
            <span>and</span>
            <a href="#" className="text-[#3B82F6] hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}