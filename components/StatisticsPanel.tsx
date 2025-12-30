
import React, { useMemo } from 'react';
import { WorkItem, Reminder, toTitleCase } from '../types';
import { CloseIcon, ClipboardDocumentCheckIcon, TrophyIcon, CurrencyDollarIcon, BellAlertIcon } from './icons';

interface StatisticsPanelProps {
  workItems: WorkItem[];
  reminders: Reminder[];
  onClose: () => void;
}

// A generic card for displaying a statistic
const StatCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 text-slate-500 dark:text-slate-400">{icon}</div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="mt-auto">{children}</div>
    </div>
);

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ workItems, reminders, onClose }) => {
    const stats = useMemo(() => {
        const activeItems = workItems.filter(item => !item.isArchived && !item.isTrashed);

        // Most prolific employee
        const workByCounts = activeItems.reduce((acc, item) => {
            const workBy = toTitleCase(item.workBy);
            if (workBy) {
                acc[workBy] = (acc[workBy] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // FIX: Cast values to number for subtraction to resolve TypeScript error.
        const topPerformer = Object.entries(workByCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];

        // Financial summary
        const financials = activeItems.reduce(
            (acc, item) => {
                acc.sales += item.salesPrice || 0;
                acc.advance += item.advance || 0;
                acc.due += item.due || 0;
                return acc;
            },
            { sales: 0, advance: 0, due: 0 }
        );

        // Status distribution
        const statusDistribution = activeItems.reduce((acc, item) => {
            if (item.status) {
                acc[item.status] = (acc[item.status] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        // FIX: Cast values to number for subtraction to resolve TypeScript error.
        const sortedStatusDistribution = Object.entries(statusDistribution).sort(([, a], [, b]) => (b as number) - (a as number));

        // Reminders overview
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const incompleteReminders = reminders.filter(r => !r.isCompleted);
        const overdueCount = incompleteReminders.filter(r => new Date(r.reminderDate) < today).length;
        
        return {
            totalActive: activeItems.length,
            topPerformerName: topPerformer ? topPerformer[0] : 'N/A',
            topPerformerCount: topPerformer ? topPerformer[1] : 0,
            financials,
            sortedStatusDistribution,
            overdueReminders: overdueCount,
            upcomingReminders: incompleteReminders.length - overdueCount,
        };
    }, [workItems, reminders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'decimal' }).format(amount);
    };

    return (
        <div className="mb-6 bg-slate-50 dark:bg-slate-900/70 rounded-lg shadow-md ring-1 ring-slate-900/5 dark:ring-white/10 p-4 relative animate-fade-in-down">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Work Statistics at a Glance</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                    aria-label="Close statistics panel"
                >
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Work Items" icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalActive}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">tasks currently in progress.</p>
                </StatCard>

                <StatCard title="Top Performer" icon={<TrophyIcon className="h-6 w-6" />}>
                     <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.topPerformerName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">with <span className="font-semibold">{stats.topPerformerCount}</span> active tasks.</p>
                </StatCard>

                <StatCard title="Financials" icon={<CurrencyDollarIcon className="h-6 w-6" />}>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Sales:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(stats.financials.sales)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Paid:</span>
                            <span className="font-semibold text-green-600 dark:text-green-500">{formatCurrency(stats.financials.advance)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Due:</span>
                            <span className="font-semibold text-red-600 dark:text-red-500">{formatCurrency(stats.financials.due)}</span>
                        </div>
                    </div>
                </StatCard>

                <StatCard title="Reminders" icon={<BellAlertIcon className="h-6 w-6" />}>
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.overdueReminders}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.upcomingReminders}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming</p>
                        </div>
                     </div>
                </StatCard>
            </div>
            
            <div className="mt-6">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">Status Distribution</h3>
                {stats.sortedStatusDistribution.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                        {stats.sortedStatusDistribution.map(([status, count]) => (
                            <div key={status} className="flex justify-between items-baseline text-sm">
                                <span className="text-slate-600 dark:text-slate-300">{toTitleCase(status)}</span>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No active items to display status distribution.</p>
                )}
            </div>
        </div>
    );
};

export default StatisticsPanel;
