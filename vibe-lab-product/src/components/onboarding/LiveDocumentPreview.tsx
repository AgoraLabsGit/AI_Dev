'use client';

import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for document sections
export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'writing' | 'complete' | 'editing';
  wordCount?: number;
  lastUpdated?: Date;
}

export interface DocumentPreviewProps {
  documentType: 'overview' | 'specs';
  sections: DocumentSection[];
  isGenerating: boolean;
  onSectionApprove: (sectionId: string) => void;
  onSectionRegenerate: (sectionId: string, feedback?: string) => void;
  onSectionEdit: (sectionId: string, newContent: string) => void;
  onSectionExpand: (sectionId: string) => void;
  className?: string;
}

// TypewriterEffect component for animated text rendering
interface TypewriterEffectProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterEffect({ 
  content, 
  speed = 30, 
  onComplete, 
  className 
}: TypewriterEffectProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, speed, onComplete]);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content]);

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {displayedContent}
      {currentIndex < content.length && (
        <span className="animate-pulse text-blue-400">|</span>
      )}
    </div>
  );
}

// Section-level interaction controls
interface SectionControlsProps {
  section: DocumentSection;
  onApprove: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onExpand: () => void;
  isExpanded?: boolean;
}

function SectionControls({ 
  section, 
  onApprove, 
  onRegenerate, 
  onEdit, 
  onExpand,
  isExpanded = false 
}: SectionControlsProps) {
  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {section.status === 'complete' && (
        <>
          <button
            onClick={onApprove}
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Approve section"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={onRegenerate}
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Regenerate section"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={onEdit}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            title="Edit section"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onExpand}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand section"}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </>
      )}
      {section.status === 'writing' && (
        <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
          <span className="animate-pulse">Writing...</span>
        </div>
      )}
      {section.status === 'pending' && (
        <div className="text-xs px-2 py-1 bg-gray-600 text-white rounded">
          Queued
        </div>
      )}
    </div>
  );
}

// Main LiveDocumentPreview component
export default function LiveDocumentPreview({
  documentType,
  sections,
  isGenerating,
  onSectionApprove,
  onSectionRegenerate,
  onSectionEdit,
  onSectionExpand,
  className
}: DocumentPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const handleSectionExpand = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    onSectionExpand(sectionId);
  };

  const handleSectionEdit = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSections(prev => new Set(prev).add(sectionId));
      setEditContent(prev => ({ ...prev, [sectionId]: section.content }));
    }
  };

  const handleEditSave = (sectionId: string) => {
    const newContent = editContent[sectionId];
    if (newContent !== undefined) {
      onSectionEdit(sectionId, newContent);
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }
  };

  const handleEditCancel = (sectionId: string) => {
    setEditingSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  };

  const documentTitle = documentType === 'overview' ? 'Project Overview' : 'Build Specifications';
  const documentIcon = documentType === 'overview' ? '📄' : '🔧';

  return (
    <div className={cn("flex flex-col h-full bg-[#111113] border-r border-[#1F1F23]", className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#1F1F23]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span>{documentIcon}</span>
              {documentTitle}
            </h2>
            <p className="text-[#6B7280] text-sm mt-1">
              {isGenerating ? 'AI is crafting your document live...' : 'Your document builds as we chat'}
            </p>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400">Generating</span>
            </div>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const isEditing = editingSections.has(section.id);
          
          return (
            <div 
              key={section.id} 
              className="bg-[#1A1B1E] rounded-lg border border-[#2F2F33] p-4 group"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium">{section.title}</h3>
                  {section.wordCount && (
                    <span className="text-xs text-[#6B7280]">
                      {section.wordCount} words
                    </span>
                  )}
                </div>
                <SectionControls
                  section={section}
                  onApprove={() => onSectionApprove(section.id)}
                  onRegenerate={() => onSectionRegenerate(section.id)}
                  onEdit={() => handleSectionEdit(section.id)}
                  onExpand={() => handleSectionExpand(section.id)}
                  isExpanded={isExpanded}
                />
              </div>

              {/* Section Content */}
              <div className="space-y-3">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <textarea
                      value={editContent[section.id] || ''}
                      onChange={(e) => setEditContent(prev => ({ 
                        ...prev, 
                        [section.id]: e.target.value 
                      }))}
                      className="w-full bg-[#0A0A0B] border border-[#2F2F33] rounded-lg p-3 text-white text-sm resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Edit section content..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(section.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleEditCancel(section.id)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className={cn(
                    "text-[#E5E7EB] text-sm leading-relaxed",
                    !isExpanded && section.content.length > 200 && "line-clamp-3"
                  )}>
                    {section.status === 'writing' ? (
                      <TypewriterEffect 
                        content={section.content}
                        speed={25}
                        className="text-[#E5E7EB]"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{section.content}</div>
                    )}
                  </div>
                )}

                {/* Section Status Indicator */}
                {section.status === 'complete' && (
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>✓ Section complete</span>
                    {section.lastUpdated && (
                      <span>Updated {
                        section.lastUpdated instanceof Date 
                          ? section.lastUpdated.toLocaleTimeString()
                          : new Date(section.lastUpdated).toLocaleTimeString()
                      }</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[#6B7280] text-sm">
              {documentType === 'overview' 
                ? 'Your Project Overview will appear here as we chat...' 
                : 'Your Build Specifications will appear here as we gather requirements...'
              }
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {sections.length > 0 && (
          <div className="sticky bottom-0 bg-[#111113] border-t border-[#1F1F23] pt-4 mt-6">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>
                {sections.filter(s => s.status === 'complete').length} of {sections.length} sections complete
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 bg-[#2F2F33] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${(sections.filter(s => s.status === 'complete').length / sections.length) * 100}%` 
                    }}
                  />
                </div>
                <span>
                  {Math.round((sections.filter(s => s.status === 'complete').length / sections.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}