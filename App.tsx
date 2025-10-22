import React, { useState, useCallback, useMemo } from 'react';
import { WorkItem } from './types';
import { INITIAL_WORK_ITEMS, WORK_TYPE_OPTIONS, INITIAL_STATUS_OPTIONS, INITIAL_WORK_BY_OPTIONS } from './constants';
import WorkItemRow from './components/WorkItemRow';
import WorkItemForm from './components/WorkItemForm';
import { AddIcon } from './components/icons';

const TABS = ['All Items', 'UNDER PROCESSING', 'Approved', 'Rejected', 'Waiting Delivery'];

const App: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);

  const [workTypeOptions, setWorkTypeOptions] = useState<string[]>(WORK_TYPE_OPTIONS);
  const [statusOptions, setStatusOptions] = useState<string[]>(INITIAL_STATUS_OPTIONS);
  const [workByOptions, setWorkByOptions] = useState<string[]>(INITIAL_WORK_BY_OPTIONS);

  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const handleEditItem = useCallback((item: WorkItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleDeleteItem = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setWorkItems(prev => prev.filter(item => item.id !== id));
    }
  }, []);

  const handleSaveItem = useCallback((itemToSave: Omit<WorkItem, 'id'> & { id?: number }) => {
    if (itemToSave.id) { // Update existing item
        setWorkItems(prev => prev.map(item => item.id === itemToSave.id ? { ...item, ...itemToSave } as WorkItem : item));
    } else { // Create new item
        const newItem: WorkItem = { ...itemToSave, id: Date.now() } as WorkItem;
        setWorkItems(prev => [...prev, newItem]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);
  
  const createOptionHandler = (setter: React.Dispatch<React.SetStateAction<string[]>>) => 
    (newOption: string) => {
      setter(prev => [...new Set([...prev, newOption])]);
  };

  const handleAddWorkType = useCallback(createOptionHandler(setWorkTypeOptions), []);
  const handleAddStatus = useCallback(createOptionHandler(setStatusOptions), []);
  const handleAddWorkBy = useCallback(createOptionHandler(setWorkByOptions), []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of workItems) {
      counts[item.status] = (counts[item.status] || 0) + 1;
    }
    return counts;
  }, [workItems]);

  const filteredItems = useMemo(() => {
    let itemsToFilter = workItems;

    if (activeTab !== 'All Items') {
      itemsToFilter = workItems.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
    }

    if (!searchTerm) {
      return itemsToFilter.sort((a, b) => a.dateOfWork.getTime() - b.dateOfWork.getTime());
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    return itemsToFilter.filter(item =>
        item.customerName.toLowerCase().includes(lowercasedFilter) ||
        item.workOfType.toLowerCase().includes(lowercasedFilter) ||
        item.trackingNumber.toLowerCase().includes(lowercasedFilter) ||
        item.customerNumber.toLowerCase().includes(lowercasedFilter)
    ).sort((a, b) => a.dateOfWork.getTime() - b.dateOfWork.getTime());
  }, [workItems, searchTerm, activeTab]);

  const WorkTable = ({ items }: { items: WorkItem[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b-2 border-slate-200">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold">S.N</th>
            <th scope="col" className="px-6 py-3 font-semibold">Date of Work</th>
            <th scope="col" className="px-6 py-3 font-semibold">Work By</th>
            <th scope="col" className="px-6 py-3 font-semibold">Type Of Work</th>
            <th scope="col" className="px-6 py-3 font-semibold">Status</th>
            <th scope="col" className="px-6 py-3 font-semibold">Customer Name</th>
            <th scope="col" className="px-6 py-3 font-semibold">Tracking Number</th>
            <th scope="col" className="px-6 py-3 font-semibold">Customer Number</th>
            <th scope="col" className="px-6 py-3 font-semibold">Day Count</th>
            <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <WorkItemRow
              key={item.id}
              item={item}
              index={index + 1}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </tbody>
      </table>
       {items.length === 0 && (
          <div className="text-center py-10 text-slate-500">
              <p>No work items found for this filter.</p>
          </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
            HABAT AL RIMAL TYPING
          </h1>
          <p className="text-slate-300">Work Tracking Management</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button
              onClick={handleAddItem}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <AddIcon />
              Add New Work Item
            </button>
          </div>

          <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const count = tab === 'All Items' ? workItems.length : statusCounts[tab] || 0;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                       <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        activeTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <WorkTable items={filteredItems} />

        </div>
      </div>

      <WorkItemForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
        workTypeOptions={workTypeOptions}
        statusOptions={statusOptions}
        workByOptions={workByOptions}
        onAddWorkType={handleAddWorkType}
        onAddStatus={handleAddStatus}
        onAddWorkBy={handleAddWorkBy}
      />
    </div>
  );
};

export default App;
