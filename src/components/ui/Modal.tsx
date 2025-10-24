import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Z_INDEX } from '../../lib/constants';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  footer
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modal }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{ zIndex: Z_INDEX.modalBackdrop }}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl transition-all duration-200 max-h-[90vh] flex flex-col',
          'border border-slate-200 dark:border-slate-700',
          sizeStyles[size],
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{ zIndex: Z_INDEX.modal }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
