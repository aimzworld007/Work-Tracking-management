import React from 'react';
import { Reminder } from '../types';
import { BellIcon } from './icons';

interface ReminderMarqueeProps {
  reminders: Reminder[];
}

const ReminderMarquee: React.FC<ReminderMarqueeProps> = ({ reminders }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReminders = reminders
    .filter(r => {
        if (r.isCompleted) return false;
        const reminderDate = new Date(r.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate >= today;
    })
    .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());

  if (upcomingReminders.length === 0) {
    return null;
  }

  const reminderText = upcomingReminders
    .map(r => {
        const date = new Date(r.reminderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        return `(${date}) ${r.title}`;
    })
    .join(' ★ ');

  return (
    <div className="marquee-container bg-amber-100 dark:bg-amber-900/50 border-y border-amber-200 dark:border-amber-800/50 overflow-hidden relative flex items-center h-10">
        <div className="flex-shrink-0 px-3 bg-amber-200 dark:bg-amber-800 h-full flex items-center">
            <BellIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="ml-2 text-sm font-semibold text-amber-800 dark:text-amber-200">Upcoming</span>
        </div>
        <div className="w-full h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-max flex items-center animate-marquee">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 px-4 whitespace-nowrap">{reminderText}</p>
                 {/* Duplicate for seamless loop */}
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 px-4 whitespace-nowrap">{reminderText}</p>
            </div>
        </div>
    </div>
  );
};

export default ReminderMarquee;