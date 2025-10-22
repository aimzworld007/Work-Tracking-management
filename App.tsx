import React, { useState, useEffect } from 'react';
import { WorkItem } from './types';
import WorkItemRow from './components/WorkItemRow';
import WorkItemForm from './components/WorkItemForm';
import { AddIcon } from './components/icons';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, arrayUnion } from 'firebase/firestore';


const TABS = ['All Items', 'UNDER PROCESSING', 'Approved', 'Rejected', 'Waiting Delivery', 'Archived'];

const App: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<WorkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  // State for dynamic options from Firestore
  const [workTypeOptions, setWorkTypeOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [workByOptions, setWorkByOptions] = useState<string[]>([]);


  const calculateDayCount = (dateStr: string) => {
    const today = new Date();
    // Add T00:00:00 to ensure the date is parsed in the local timezone, not UTC
    const workDate = new Date(`${dateStr}T00:00:00`);
    today.setHours(0, 0, 0, 0);
    workDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - workDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Fetch work items from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "work-items"), orderBy("dateOfWork", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          ...data,
          id: doc.id,
          dayCount: calculateDayCount(data.dateOfWork),
        } as WorkItem);
      });
      setWorkItems(items);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Fetch dynamic options from Firestore
  useEffect(() => {
    const optionsDocRef = doc(db, 'options', 'appData');
    const unsubscribe = onSnapshot(optionsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWorkTypeOptions(data.workTypes || []);
        setStatusOptions(data.statuses || []);
        setWorkByOptions(data.workBy || []);
      } else {
        // You might want to initialize the document if it doesn't exist
        console.log("Options document does not exist!");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let items = workItems;

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.customerName.toLowerCase().includes(lowercasedFilter) ||
        item.trackingNumber.toLowerCase().includes(lowercasedFilter) ||
        item.ppNumber.toLowerCase().includes(lowercasedFilter) ||
        item.customerNumber.toLowerCase().includes(lowercasedFilter) ||
        item.workOfType.toLowerCase().includes(lowercasedFilter)
      );
    }

    if (activeTab === 'Archived') {
      items = items.filter(item => item.isArchived);
    } else {
      items = items.filter(item => !item.isArchived);
      if (activeTab !== 'All Items') {
        items = items.filter(item => item.status === activeTab);
      }
    }

    setFilteredItems(items);
  }, [searchTerm, activeTab, workItems]);


  const handleOpenModal = (item: WorkItem | null = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = async (itemToSave: Omit<WorkItem, 'id' | 'dayCount' | 'isArchived'> & { id?: string }) => {
    try {
      if (itemToSave.id) {
        // Edit
        const docRef = doc(db, "work-items", itemToSave.id);
        await updateDoc(docRef, { ...itemToSave });
      } else {
        // Add
        await addDoc(collection(db, "work-items"), { 
          ...itemToSave,
          isArchived: false,
        });
      }
      
      // Update dynamic options if new ones were added
      const optionsDocRef = doc(db, 'options', 'appData');
      if (!workTypeOptions.includes(itemToSave.workOfType)) {
          await updateDoc(optionsDocRef, { workTypes: arrayUnion(itemToSave.workOfType) });
      }
      if (!statusOptions.includes(itemToSave.status)) {
          await updateDoc(optionsDocRef, { statuses: arrayUnion(itemToSave.status) });
      }
      if (itemToSave.workBy && !workByOptions.includes(itemToSave.workBy)) {
          await updateDoc(optionsDocRef, { workBy: arrayUnion(itemToSave.workBy) });
      }

    } catch (error) {
      console.error("Error saving document: ", error);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "work-items", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  
  const handleArchive = async (id: string) => {
    try {
        const docRef = doc(db, "work-items", id);
        await updateDoc(docRef, { isArchived: true });
    } catch (error) {
        console.error("Error archiving document: ", error);
    }
  };
  
  const handleUnarchive = async (id: string) => {
    try {
        const docRef = doc(db, "work-items", id);
        await updateDoc(docRef, { isArchived: false });
    } catch(error) {
        console.error("Error unarchiving document: ", error);
    }
  };
  
  const getTabCount = (tab: string): number => {
    if (tab === 'All Items') return workItems.filter(item => !item.isArchived).length;
    if (tab === 'Archived') return workItems.filter(item => item.isArchived).length;
    return workItems.filter(item => item.status === tab && !item.isArchived).length;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Work Management Dashboard</h1>
          <p className="text-slate-600 mt-1">Track and manage all your work items efficiently.</p>
        </header>

        <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="p-3 border rounded-lg w-full pl-10 bg-white shadow-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                 <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform transform hover:scale-105"
                >
                  <AddIcon />
                  <span className="hidden sm:inline">Add New Work</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-x-1 sm:gap-x-4 overflow-x-auto p-2">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            {tab}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                {getTabCount(tab)}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Work By</th>
                    <th scope="col" className="px-6 py-3">Work Type</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Customer Name</th>
                    <th scope="col" className="px-6 py-3">Tracking / PP / Customer #</th>
                    <th scope="col" className="px-6 py-3 text-center">Days Passed</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <WorkItemRow
                      key={item.id}
                      item={item}
                      onEdit={() => handleOpenModal(item)}
                      onDelete={() => handleDelete(item.id!)}
                      onArchive={() => handleArchive(item.id!)}
                      onUnarchive={() => handleUnarchive(item.id!)}
                    />
                  ))}
                </tbody>
              </table>
               {filteredItems.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No work items found.</p>
                </div>
              )}
            </div>
        </div>
        
        {isModalOpen && (
          <WorkItemForm
            item={currentItem}
            onSave={handleSave}
            onClose={handleCloseModal}
            workByOptions={workByOptions}
            workTypeOptions={workTypeOptions}
            statusOptions={statusOptions}
          />
        )}
      </div>
    </div>
  );
};

export default App;