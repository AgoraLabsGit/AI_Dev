'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  GitBranch, 
  Upload, 
  FileText,
  Globe,
  Smartphone,
  Zap,
  Lightbulb,
  LucideIcon
} from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  type: QuickActionType;
  action: () => void | Promise<void>;
  metadata?: {
    icon?: string;
    description?: string;
    keyboard?: string;
    dangerous?: boolean;
    requiresConfirm?: boolean;
  };
  state?: {
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
  };
}

export type QuickActionType = 
  | 'primary'      // Main action (green/blue)
  | 'secondary'    // Alternative action (gray)
  | 'suggest'      // AI suggestion (outlined)
  | 'multi-select' // Can select multiple
  | 'danger'       // Destructive action (red)
  | 'info'         // Informational (blue)
  | 'warning';     // Caution needed (yellow)

interface QuickActionButtonProps {
  action: QuickAction;
  onClick?: (action: QuickAction) => void;
  multiSelect?: boolean;
}

// Icon mapping function
const getIconComponent = (iconName: string): LucideIcon | null => {
  const iconMap: Record<string, LucideIcon> = {
    'Sparkles': Sparkles,
    'GitBranch': GitBranch,
    'Upload': Upload,
    'FileText': FileText,
    'Globe': Globe,
    'Smartphone': Smartphone,
    'Zap': Zap,
    'Lightbulb': Lightbulb,
  };
  return iconMap[iconName] || null;
};

export function QuickActionButton({ 
  action, 
  onClick,
  multiSelect = false 
}: QuickActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(action.state?.selected || false);

  const showConfirmDialog = async (options: {
    title: string;
    message: string;
    dangerous?: boolean;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`${options.title}\n\n${options.message}`);
      resolve(confirmed);
    });
  };

  const handleClick = async () => {
    if (action.metadata?.requiresConfirm) {
      const confirmed = await showConfirmDialog({
        title: 'Confirm Action',
        message: `Are you sure you want to ${action.label}?`,
        dangerous: action.metadata.dangerous
      });
      
      if (!confirmed) return;
    }
    
    setIsLoading(true);
    
    try {
      if (multiSelect) {
        setIsSelected(!isSelected);
        onClick?.(action);
      } else {
        await action.action();
        onClick?.(action);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (action.type) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-dark border-primary';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700';
      case 'suggest':
        return 'border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white dark:bg-gray-900 dark:hover:bg-primary';
      case 'multi-select':
        return isSelected 
          ? 'bg-primary text-white border-primary'
          : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600 border-red-500';
      case 'info':
        return 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500';
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700';
    }
  };

  return (
    <button
      className={cn(
        'quick-action-btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95 border whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        getVariantStyles(),
        {
          'quick-action-selected': isSelected,
          'quick-action-loading': isLoading,
          'quick-action-disabled': action.state?.disabled,
          'opacity-75 cursor-not-allowed': action.state?.disabled || isLoading,
          'cursor-wait': isLoading,
        }
      )}
      onClick={handleClick}
      disabled={action.state?.disabled || isLoading}
      title={action.metadata?.description}
    >
      {/* Icon */}
      {action.metadata?.icon && (() => {
        const IconComponent = getIconComponent(action.metadata.icon);
        return IconComponent ? (
          <IconComponent className="w-4 h-4" />
        ) : null;
      })()}
      
      {/* Label */}
      <span className="quick-action-label">{action.label}</span>
      
      {/* Keyboard shortcut */}
      {action.metadata?.keyboard && (
        <kbd className="quick-action-shortcut ml-2 px-1.5 py-0.5 text-xs bg-black/10 rounded dark:bg-white/10">
          {action.metadata.keyboard}
        </kbd>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {/* Selection indicator */}
      {isSelected && multiSelect && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
          ✓
        </div>
      )}
    </button>
  );
}

interface QuickActionBarProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
  multiSelect?: boolean;
  selectedActions?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

export function QuickActionBar({ 
  actions, 
  onActionClick,
  multiSelect = false,
  selectedActions = [],
  onSelectionChange 
}: QuickActionBarProps) {
  const [localSelectedActions, setLocalSelectedActions] = useState<string[]>(selectedActions);

  const handleActionClick = (action: QuickAction) => {
    if (multiSelect) {
      const newSelection = localSelectedActions.includes(action.id)
        ? localSelectedActions.filter(id => id !== action.id)
        : [...localSelectedActions, action.id];
      
      setLocalSelectedActions(newSelection);
      onSelectionChange?.(newSelection);
    }
    
    onActionClick?.(action);
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      {actions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={{
            ...action,
            state: {
              ...action.state,
              selected: multiSelect ? localSelectedActions.includes(action.id) : false
            }
          }}
          onClick={handleActionClick}
          multiSelect={multiSelect}
        />
      ))}
    </div>
  );
}