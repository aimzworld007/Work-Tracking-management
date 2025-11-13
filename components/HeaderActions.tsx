import React, { useState, useEffect, useRef } from 'react';
import { CogIcon, PrintIcon, ImportIcon, SunIcon, MoonIcon, LockOpenIcon, LockClosedIcon, ClipboardDocumentCheckIcon, LogoutIcon } from './icons';
import FontSizeAdjuster from './FontSizeAdjuster';
import MarqueeSpeedControl, { MarqueeSpeed } from './MarqueeSpeedControl';

interface HeaderActionsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onImport: () => void;
  onPrint: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onResetFontSize: () => void;
  marqueeSpeed: MarqueeSpeed;
  onMarqueeSpeedChange: (speed: MarqueeSpeed) => void;
  onLogout: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  isEditMode,
  onToggleEditMode,
  isSelectionMode,
  onToggleSelectionMode,
  theme,
  onToggleTheme,
  onImport,
  onPrint,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onResetFontSize,
  marqueeSpeed,
  onMarqueeSpeedChange,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ToggleItem: React.FC<{ label: string; isToggled: boolean; onToggle: () => void; onIcon: React.ReactNode; offIcon: React.ReactNode }> = ({ label, isToggled, onToggle, onIcon, offIcon }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          isToggled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'
        }`}
      >
        <span className="sr-only">{label}</span>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isToggled ? 'translate-x-5' : 'translate-x-0'
        }`}>
            <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                isToggled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
            }`}>
                {offIcon}
            </span>
            <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                isToggled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
            }`}>
                {onIcon}
            </span>
        </span>
      </button>
    </div>
  );
  
  const ActionButton: React.FC<{ label: string; onClick: () => void; icon: React.ReactNode; disabled?: boolean, isDestructive?: boolean }> = ({ label, onClick, icon, disabled = false, isDestructive = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
        isDestructive
        ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
        title="Settings"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CogIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2" role="menu" aria-orientation="vertical">
            <div className="px-1 py-1">
                <p className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">View Options</p>
                <div className="space-y-4 p-2">
                    <MarqueeSpeedControl 
                        currentSpeed={marqueeSpeed}
                        onSpeedChange={onMarqueeSpeedChange}
                    />
                    <FontSizeAdjuster 
                        onDecrease={onDecreaseFontSize}
                        onIncrease={onIncreaseFontSize}
                        onReset={onResetFontSize}
                    />
                </div>
                <div className="px-2 divide-y divide-slate-200 dark:divide-slate-700">
                    <ToggleItem 
                        label="Dark Mode"
                        isToggled={theme === 'dark'}
                        onToggle={onToggleTheme}
                        onIcon={<MoonIcon className="h-3 w-3 text-indigo-600"/>}
                        offIcon={<SunIcon className="h-3 w-3 text-gray-400"/>}
                    />
                    <ToggleItem 
                        label="Selection Mode"
                        isToggled={isSelectionMode}
                        onToggle={onToggleSelectionMode}
                        onIcon={<ClipboardDocumentCheckIcon className="h-3 w-3 text-indigo-600"/>}
                        offIcon={<ClipboardDocumentCheckIcon className="h-3 w-3 text-gray-400"/>}
                    />
                     <ToggleItem 
                        label="Edit Mode"
                        isToggled={isEditMode}
                        onToggle={onToggleEditMode}
                        onIcon={<LockOpenIcon className="h-3 w-3 text-indigo-600"/>}
                        offIcon={<LockClosedIcon className="h-3 w-3 text-gray-400"/>}
                    />
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-1 py-1">
                <p className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</p>
                <div className="mt-1">
                    <ActionButton 
                        label="Import from File"
                        onClick={onImport}
                        icon={<ImportIcon className="h-5 w-5" />}
                        disabled={!isEditMode}
                    />
                    <ActionButton 
                        label="Print Page"
                        onClick={onPrint}
                        icon={<PrintIcon className="h-5 w-5" />}
                    />
                </div>
            </div>
             <div className="border-t border-slate-200 dark:border-slate-700 px-1 py-1">
                 <ActionButton 
                    label="Logout"
                    onClick={onLogout}
                    icon={<LogoutIcon className="h-5 w-5" />}
                    isDestructive
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderActions;