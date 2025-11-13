import React from 'react';
import { WorkItem } from '../types';
import { ClipboardDocumentCheckIcon } from './icons';

interface WorkItemMarqueeProps {
  workItems: WorkItem[];
  speed: number;
}

const WorkItemMarquee: React.FC<WorkItemMarqueeProps> = ({ workItems, speed }) => {
  const activeItems = workItems
    .filter(item => !item.isArchived && !item.isTrashed)
    .sort((a, b) => new Date(b.dateOfWork).getTime() - new Date(a.dateOfWork).getTime());

  if (activeItems.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };
  
  const marqueeText = activeItems
    .map(item => {
        const date = formatDate(item.dateOfWork);
        return `On ${date}, ${item.customerName}'s ${item.workOfType} (${item.trackingNumber || 'No tracking'}) is ${item.status}.`;
    })
    .join(' ★ ');

  return (
    <div 
        className="marquee-container bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/50 overflow-hidden relative flex items-center h-10"
        style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
    >
        <div className="flex-shrink-0 px-3 bg-slate-200 dark:bg-slate-800 h-full flex items-center">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <span className="ml-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Work Feed</span>
        </div>
        <div className="w-full h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-max flex items-center animate-marquee">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 px-4 whitespace-nowrap">{marqueeText}</p>
                 {/* Duplicate for seamless loop */}
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 px-4 whitespace-nowrap">{marqueeText}</p>
            </div>
        </div>
    </div>
  );
};

export default WorkItemMarquee;