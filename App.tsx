import React, { useState, useEffect } from 'react';
import { WorkItem } from './types';
import WorkItemRow from './components/WorkItemRow';
import WorkItemForm from './components/WorkItemForm';
import ImportModal from './components/ImportModal';
import { AddIcon, ImportIcon } from './components/icons';
// FIX: Use Firebase v8 compact syntax for imports. This replaces the v9 modular imports.
import { db, firebase } from './firebase';
import { WORK_TYPE_OPTIONS as staticWorkTypeOptions, INITIAL_STATUS_OPTIONS, INITIAL_WORK_BY_OPTIONS } from './constants';


const TABS = ['All Items', 'UNDER PROCESSING', 'Approved', 'Rejected', 'Waiting Delivery', 'Archived'];

const App: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<WorkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  // State for sorting
  const [sortColumn, setSortColumn] = useState<keyof WorkItem>('dateOfWork');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for dynamic options from Firestore, initialized with static data
  const [workTypeOptions, setWorkTypeOptions] = useState<string[]>(staticWorkTypeOptions);
  const [statusOptions, setStatusOptions] = useState<string[]>(INITIAL_STATUS_OPTIONS);
  const [workByOptions, setWorkByOptions] = useState<string[]>(INITIAL_WORK_BY_OPTIONS);


  const calculateDayCount = (dateStr: string) => {
    if (!dateStr) return 0; // Guard against null/undefined dates
    const today = new Date();
    // Add T00:00:00 to ensure the date is parsed in the local timezone, not UTC
    const workDate = new Date(`${dateStr}T00:00:00`);
    if (isNaN(workDate.getTime())) return 0; // Guard against invalid date strings
    today.setHours(0, 0, 0, 0);
    workDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - workDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Fetch work items from Firestore in real-time
  useEffect(() => {
    // FIX: Use Firebase v8 compact syntax for query and snapshot
    const q = db.collection("work-items").orderBy("dateOfWork", "desc");
    const unsubscribe = q.onSnapshot((querySnapshot) => {
      const items: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Sanitize data to ensure optional fields have default values and prevent 'undefined' issues.
        items.push({
          ...data,
          id: doc.id,
          passportNumber: data.passportNumber || '',
          trackingNumber: data.trackingNumber || '',
          mobileWhatsappNumber: data.mobileWhatsappNumber || '',
          workBy: data.workBy || '',
          isArchived: data.isArchived || false,
          dayCount: calculateDayCount(data.dateOfWork),
        } as WorkItem);
      });
      setWorkItems(items);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Fetch and merge dynamic options from Firestore
  useEffect(() => {
    const optionsDocRef = db.collection('options').doc('appData');
    const unsubscribe = optionsDocRef.onSnapshot((doc) => {
      // FIX: Use .exists property instead of .exists() method for v8
      if (doc.exists) {
        const data = doc.data();
        if (data) {
            // Merge Firestore options with initial static options, avoiding duplicates
            setWorkTypeOptions(prev => [...new Set([...prev, ...(data.workTypes || [])])]);
            setStatusOptions(prev => [...new Set([...prev, ...(data.statuses || [])])]);
            setWorkByOptions(prev => [...new Set([...prev, ...(data.workBy || [])])]);
        }
      } else {
        // Initialize the document if it doesn't exist
        console.log("Options document does not exist, creating it with default values.");
        optionsDocRef.set({
            workTypes: staticWorkTypeOptions,
            statuses: INITIAL_STATUS_OPTIONS,
            workBy: INITIAL_WORK_BY_OPTIONS,
        }).catch(err => console.error("Error creating options document:", err));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let items = [...workItems];

    // Filtering
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.customerName.toLowerCase().includes(lowercasedFilter) ||
        item.trackingNumber.toLowerCase().includes(lowercasedFilter) ||
        item.passportNumber.toLowerCase().includes(lowercasedFilter) ||
        item.mobileWhatsappNumber.toLowerCase().includes(lowercasedFilter) ||
        item.workOfType.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Tab filtering
    if (activeTab === 'Archived') {
      items = items.filter(item => item.isArchived);
    } else {
      items = items.filter(item => !item.isArchived);
      if (activeTab !== 'All Items') {
        items = items.filter(item => item.status === activeTab);
      }
    }

    // Sorting
    if (sortColumn) {
      items.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (sortColumn === 'dayCount') {
          comparison = (aValue as number) - (bValue as number);
        } else {
          comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredItems(items);
  }, [searchTerm, activeTab, workItems, sortColumn, sortDirection]);


  const handleOpenModal = (item: WorkItem | null = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };
  
  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);

  const handleSave = async (itemToSave: Omit<WorkItem, 'id' | 'dayCount' | 'isArchived'> & { id?: string }) => {
    try {
      if (itemToSave.id) {
        // Edit: Destructure id and pass the rest of the data to update.
        const { id, ...dataToUpdate } = itemToSave;
        const docRef = db.collection("work-items").doc(id);
        await docRef.update(dataToUpdate);
      } else {
        // Add
        await db.collection("work-items").add({ 
          ...itemToSave,
          isArchived: false,
        });
      }
      
      // Update dynamic options if new ones were added
      // FIX: Use Firebase v8 compact syntax for document reference and arrayUnion
      const optionsDocRef = db.collection('options').doc('appData');
      if (!workTypeOptions.includes(itemToSave.workOfType)) {
          await optionsDocRef.update({ workTypes: firebase.firestore.FieldValue.arrayUnion(itemToSave.workOfType) });
      }
      if (!statusOptions.includes(itemToSave.status)) {
          await optionsDocRef.update({ statuses: firebase.firestore.FieldValue.arrayUnion(itemToSave.status) });
      }
      if (itemToSave.workBy && !workByOptions.includes(itemToSave.workBy)) {
          await optionsDocRef.update({ workBy: firebase.firestore.FieldValue.arrayUnion(itemToSave.workBy) });
      }

    } catch (error) {
      console.error("Error saving document: ", error);
    }
    handleCloseModal();
  };
  
  const handleImport = async (data: string) => {
    const lines = data.trim().split('\n');
    // Skip header
    if (lines.length > 0) {
      lines.shift();
    }

    const itemsToSave: Omit<WorkItem, 'id' | 'dayCount' | 'isArchived' | 'mobileNumber'>[] = [];
    const newWorkTypes = new Set<string>();
    const newStatuses = new Set<string>();
    const newWorkBy = new Set<string>();

    for (const line of lines) {
      const values = line.split('\t');
      if (values.length < 8) {
        console.warn("Skipping malformed row:", line);
        continue;
      }

      const [_sn, dateOfWork, workBy, workOfType, status, customerName, trackingNumber, customerNumber] = values.map(v => v.trim());

      if (!dateOfWork || !workOfType || !status || !customerName) {
        console.warn("Skipping row with missing required fields:", line);
        continue;
      }

      const item = {
        dateOfWork,
        workBy,
        workOfType,
        status,
        customerName,
        trackingNumber,
        passportNumber: '', // Not in source data
        mobileWhatsappNumber: customerNumber,
      };
      itemsToSave.push(item);

      if (item.workOfType && !workTypeOptions.includes(item.workOfType)) newWorkTypes.add(item.workOfType);
      if (item.status && !statusOptions.includes(item.status)) newStatuses.add(item.status);
      if (item.workBy && !workByOptions.includes(item.workBy)) newWorkBy.add(item.workBy);
    }

    if (itemsToSave.length === 0) {
      alert("No valid items found to import.");
      return;
    }

    try {
      const batch = db.batch();
      itemsToSave.forEach(item => {
        const docRef = db.collection("work-items").doc();
        batch.set(docRef, { ...item, isArchived: false });
      });
      await batch.commit();

      const optionsDocRef = db.collection('options').doc('appData');
      const updates: { [key: string]: any } = {};
      if (newWorkTypes.size > 0) {
        updates.workTypes = firebase.firestore.FieldValue.arrayUnion(...Array.from(newWorkTypes));
      }
      if (newStatuses.size > 0) {
        updates.statuses = firebase.firestore.FieldValue.arrayUnion(...Array.from(newStatuses));
      }
      if (newWorkBy.size > 0) {
        updates.workBy = firebase.firestore.FieldValue.arrayUnion(...Array.from(newWorkBy));
      }
      if (Object.keys(updates).length > 0) {
        await optionsDocRef.update(updates);
      }

      alert(`Successfully imported ${itemsToSave.length} items.`);
      handleCloseImportModal();
    } catch (error) {
      console.error("Error importing documents: ", error);
      alert("An error occurred during import. Check the console for details.");
    }
  };


  const handleDelete = async (id: string) => {
    try {
      // FIX: Use Firebase v8 compact syntax for delete
      await db.collection("work-items").doc(id).delete();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  
  const handleArchive = async (id: string) => {
    try {
        // FIX: Use Firebase v8 compact syntax for document reference and update
        const docRef = db.collection("work-items").doc(id);
        await docRef.update({ isArchived: true });
    } catch (error) {
        console.error("Error archiving document: ", error);
    }
  };
  
  const handleUnarchive = async (id: string) => {
    try {
        // FIX: Use Firebase v8 compact syntax for document reference and update
        const docRef = db.collection("work-items").doc(id);
        await docRef.update({ isArchived: false });
    } catch(error) {
        console.error("Error unarchiving document: ", error);
    }
  };
  
  const getTabCount = (tab: string): number => {
    if (tab === 'All Items') return workItems.filter(item => !item.isArchived).length;
    if (tab === 'Archived') return workItems.filter(item => item.isArchived).length;
    return workItems.filter(item => item.status === tab && !item.isArchived).length;
  }
  
  const handleSort = (column: keyof WorkItem) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
  };
  
  const SortableHeader = ({ column, title }: { column: keyof WorkItem, title: string }) => {
    const isSorting = sortColumn === column;
    const icon = isSorting ? (sortDirection === 'asc' ? '▲' : '▼') : '↕';
    const iconVisibility = isSorting ? 'visible' : 'invisible group-hover:visible';

    return (
      <th scope="col" className="px-6 py-3">
        <button onClick={() => handleSort(column)} className="flex items-center gap-2 group">
          <span>{title}</span>
          <span className={`text-gray-400 ${iconVisibility}`}>{icon}</span>
        </button>
      </th>
    );
  };

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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenImportModal}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-transform transform hover:scale-105"
                  >
                    <ImportIcon />
                    <span className="hidden sm:inline">Import</span>
                  </button>
                  <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform transform hover:scale-105"
                  >
                    <AddIcon />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
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
                    <SortableHeader column="dateOfWork" title="Date" />
                    <SortableHeader column="workBy" title="Work By" />
                    <SortableHeader column="workOfType" title="Work Type" />
                    <SortableHeader column="status" title="Status" />
                    <SortableHeader column="customerName" title="Customer Details" />
                    <SortableHeader column="trackingNumber" title="Tracking Details" />
                    <SortableHeader column="dayCount" title="Days Passed" />
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

        {isImportModalOpen && (
            <ImportModal
                onClose={handleCloseImportModal}
                onImport={handleImport}
            />
        )}
      </div>
    </div>
  );
};

export default App;