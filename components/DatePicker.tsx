import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface DatePickerProps {
  label: string;
  value: string; // Expects 'YYYY-MM-DD'
  onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(value ? new Date(`${value}T00:00:00`) : new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleDateSelect = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + offset, 1));
  };
  
  const getDaysInMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  
  const getStartingDayOfMonth = () => {
      return new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay();
  }

  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0,0,0,0);

  const days = getDaysInMonth();
  const startingDay = getStartingDayOfMonth();

  const formattedValue = value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative" ref={datePickerRef}>
      <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">{label}</label>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full cursor-default rounded-md bg-white dark:bg-slate-900 py-1.5 pl-3 pr-10 text-left text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
        >
          <span className="block truncate">{formattedValue || 'Select a date'}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
             <CalendarIcon className="h-5 w-5 text-gray-400" />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4">
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400">
            {weekDays.map(day => <div key={day} className="font-semibold">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {days.map((day) => {
              const dayNumber = day.getDate();
              const isSelected = selectedDate && day.getTime() === selectedDate.getTime();
              const isToday = day.getTime() === today.getTime();
              
              const dayClasses = `
                w-full aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors
                ${isSelected ? 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700' : ''}
                ${!isSelected && isToday ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold' : ''}
                ${!isSelected && !isToday ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
              `;

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => handleDateSelect(dayNumber)}
                  className={dayClasses}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;