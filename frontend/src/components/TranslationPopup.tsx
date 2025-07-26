import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TranslationPopupProps {
  text: string;
  translation: string;
  position: { x: number; y: number };
  onClose: () => void;
  isVisible: boolean;
}

export const TranslationPopup: React.FC<TranslationPopupProps> = ({
  text,
  translation,
  position,
  onClose,
  isVisible
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 max-w-xs"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm mb-1">
            {text}
          </div>
          <div className="text-gray-700 text-sm">
            {translation || 'Translation not available'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* Arrow pointing down */}
      <div 
        className="absolute top-full left-4 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid white',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
        }}
      />
    </div>
  );
};