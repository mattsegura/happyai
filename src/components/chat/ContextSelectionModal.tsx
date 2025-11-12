import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, BookOpen, Target, Check, Search, Book, FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { Button } from '../ui/button';

interface ContextSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedContext: SelectedContext) => void;
  currentSelection?: SelectedContext;
}

export interface SelectedContext {
  documents: string[]; // File IDs
  classes: string[]; // Class IDs
  studyPlans: string[]; // Study Plan IDs
}

// Mock classes data - in a real app, this would come from a context
const mockClasses = [
  { id: 'cs-201', name: 'Data Structures', code: 'CS 201', color: '#3b82f6' },
  { id: 'math-301', name: 'Linear Algebra', code: 'MATH 301', color: '#8b5cf6' },
  { id: 'phys-202', name: 'Physics II', code: 'PHYS 202', color: '#ef4444' },
  { id: 'eng-202', name: 'English Literature', code: 'ENG 202', color: '#f97316' },
  { id: 'hist-101', name: 'History', code: 'HIST 101', color: '#eab308' },
];

// Mock documents data
const mockDocuments = [
  { id: 'doc-1', name: 'Lecture 5 Notes.pdf', type: 'pdf', class: 'CS 201' },
  { id: 'doc-2', name: 'Chapter 3 Summary.docx', type: 'docx', class: 'MATH 301' },
  { id: 'doc-3', name: 'Study Guide - Thermodynamics.pdf', type: 'pdf', class: 'PHYS 202' },
  { id: 'doc-4', name: 'Essay Outline.docx', type: 'docx', class: 'ENG 202' },
  { id: 'doc-5', name: 'Practice Problems.pdf', type: 'pdf', class: 'CS 201' },
];

export function ContextSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  currentSelection
}: ContextSelectionModalProps) {
  const { studyPlans } = useStudyPlans();
  const [activeTab, setActiveTab] = useState<'documents' | 'classes' | 'plans'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    currentSelection?.documents || []
  );
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    currentSelection?.classes || []
  );
  const [selectedPlans, setSelectedPlans] = useState<string[]>(
    currentSelection?.studyPlans || []
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const toggleDocument = (id: string) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleClass = (id: string) => {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePlan = (id: string) => {
    setSelectedPlans(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      documents: selectedDocuments,
      classes: selectedClasses,
      studyPlans: selectedPlans
    });
    onClose();
  };

  const handleClearAll = () => {
    setSelectedDocuments([]);
    setSelectedClasses([]);
    setSelectedPlans([]);
  };

  const totalSelected = selectedDocuments.length + selectedClasses.length + selectedPlans.length;

  // Filter based on search
  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = studyPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(70vh, 500px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Select Context
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Help AI understand your question better
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/20">
          <button
            onClick={() => setActiveTab('documents')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all',
              activeTab === 'documents'
                ? 'bg-primary text-white shadow-sm'
                : 'hover:bg-background'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents
            {selectedDocuments.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                {selectedDocuments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all',
              activeTab === 'classes'
                ? 'bg-primary text-white shadow-sm'
                : 'hover:bg-background'
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Classes
            {selectedClasses.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                {selectedClasses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all',
              activeTab === 'plans'
                ? 'bg-primary text-white shadow-sm'
                : 'hover:bg-background'
            )}
          >
            <Target className="w-3.5 h-3.5" />
            Plans
            {selectedPlans.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                {selectedPlans.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3" style={{ minHeight: '200px' }}>
            {activeTab === 'documents' && (
              <div className="space-y-2">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No documents found</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <motion.button
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      selectedDocuments.includes(doc.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={cn(
                          'p-1.5 rounded-md flex-shrink-0',
                          selectedDocuments.includes(doc.id) ? 'bg-primary text-white' : 'bg-muted'
                        )}>
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.class}</p>
                        </div>
                      </div>
                      {selectedDocuments.includes(doc.id) && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-2">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No classes found</p>
                </div>
              ) : (
                filteredClasses.map((cls) => (
                  <motion.button
                    key={cls.id}
                    onClick={() => toggleClass(cls.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      selectedClasses.includes(cls.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: cls.color }}
                        >
                          {cls.code.split(' ')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{cls.name}</p>
                          <p className="text-xs text-muted-foreground">{cls.code}</p>
                        </div>
                      </div>
                      {selectedClasses.includes(cls.id) && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-2">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No study plans found</p>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <motion.button
                    key={plan.id}
                    onClick={() => togglePlan(plan.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      selectedPlans.includes(plan.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={cn(
                          'p-1.5 rounded-md flex-shrink-0',
                          selectedPlans.includes(plan.id) ? 'bg-primary text-white' : 'bg-muted'
                        )}>
                          <Book className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{plan.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate">{plan.courseName}</span>
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full whitespace-nowrap">
                              {plan.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedPlans.includes(plan.id) && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border bg-muted/10">
          <div className="text-xs">
            <span className="font-semibold">{totalSelected}</span>
            <span className="text-muted-foreground"> selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            {totalSelected > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 text-xs bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

