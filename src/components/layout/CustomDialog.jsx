import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// The backdrop component that creates the modal overlay
const DialogBackdrop = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    {children}
  </div>
);

// The main dialog component
const Dialog = ({ open, onOpenChange, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = 'hidden';
      // Focus the dialog
      dialogRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogBackdrop onClose={() => onOpenChange(false)}>
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    </DialogBackdrop>
  );
};

// The dialog's header section
const DialogHeader = ({ children }) => (
  <div className="flex-none px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

// The title component
const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
);

// The description component
const DialogDescription = ({ children }) => (
  <p className="mt-1 text-sm text-gray-500">{children}</p>
);

// The main content area
const DialogContent = ({ children }) => (
  <div className="p-6 overflow-y-auto">
    {children}
  </div>
);

// A button that triggers the dialog
const DialogTrigger = ({ children, asChild, ...props }) => {
  if (asChild) {
    return children;
  }
  return (
    <button {...props} type="button">
      {children}
    </button>
  );
};

// The close button component
const DialogClose = ({ onClose }) => (
  <button
    onClick={onClose}
    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500"
  >
    <X className="w-5 h-5" />
  </button>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
};