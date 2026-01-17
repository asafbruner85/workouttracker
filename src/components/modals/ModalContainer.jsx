/**
 * ModalContainer - Shared modal wrapper with backdrop and header
 */

import React from 'react';

export default function ModalContainer({
  isOpen,
  onClose,
  title,
  subtitle,
  headerColor = 'bg-blue-600',
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 my-4">
        {/* Modal Header */}
        <div className={`${headerColor} px-6 py-4 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {subtitle && <p className="text-white/80">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
