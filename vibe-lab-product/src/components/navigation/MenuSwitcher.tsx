'use client';

import { useState } from 'react';
import { Menu, FolderTree, ChevronDown } from 'lucide-react';
import { NavigationMode } from './types';

interface MenuSwitcherProps {
  mode: NavigationMode;
  onModeChange: (mode: NavigationMode) => void;
}

const modeConfig = {
  main: {
    label: 'Main Menu',
    icon: Menu,
    description: 'Project navigation and features'
  },
  directory: {
    label: 'Code Directory',
    icon: FolderTree,
    description: 'File explorer and code browser'
  }
};

export default function MenuSwitcher({ mode, onModeChange }: MenuSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = modeConfig[mode];
  const Icon = currentMode.icon;

  const handleModeSelect = (newMode: NavigationMode) => {
    onModeChange(newMode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#1C1C1E] border border-[#2A2A2E] hover:border-[#404040] transition-colors group"
        title={currentMode.description}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{currentMode.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg shadow-xl z-20">
            {Object.entries(modeConfig).map(([key, config]) => {
              const isSelected = key === mode;
              const ModeIcon = config.icon;
              
              return (
                <button
                  key={key}
                  onClick={() => handleModeSelect(key as NavigationMode)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-[#252527] transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    isSelected ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
                  }`}
                >
                  <ModeIcon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                  <div>
                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {config.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}