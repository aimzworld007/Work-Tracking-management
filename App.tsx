import React, { useState, useEffect, useRef } from 'react';
import { WorkItem } from './types';
import WorkItemRow from './components/WorkItemRow';
import WorkItemForm from './components/WorkItemForm';
import ImportModal from './components/ImportModal';
import Fab from './components/Fab';
import HeaderActions from './components/HeaderActions';
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from './components/icons';
import { db, firebase } from './firebase';
import { WORK_TYPE_OPTIONS as staticWorkTypeOptions, INITIAL_STATUS_OPTIONS, INITIAL_WORK_BY_OPTIONS } from './constants';
import BulkActionToolbar from './components/BulkActionToolbar';
import BulkEditModal from './components/BulkEditModal';
import Pagination from './components/Pagination';
import Login from './components/Login';


const TABS = ['All Items', 'UNDER PROCESSING', 'Approved', 'Rejected', 'Waiting Delivery', 'PAID ONLY', 'Archived', 'Trash'];

const TAB_COLORS: { [key: string]: { base: string; active: string; badge: string } } = {
  'All Items':        { base: 'bg-slate-500 hover:bg-slate-600', active: 'bg-slate-700 ring-slate-500', badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  'UNDER PROCESSING': { base: 'bg-blue-500 hover:bg-blue-600',   active: 'bg-blue-700 ring-blue-500',   badge: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
  'Approved':         { base: 'bg-green-500 hover:bg-green-600', active: 'bg-green-700 ring-green-500', badge: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
  'Rejected':         { base: 'bg-red-500 hover:bg-red-600',     active: 'bg-red-700 ring-red-500',     badge: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200' },
  'Waiting Delivery': { base: 'bg-purple-500 hover:bg-purple-600',active: 'bg-purple-700 ring-purple-500',badge: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' },
  'PAID ONLY':        { base: 'bg-cyan-500 hover:bg-cyan-600',   active: 'bg-cyan-700 ring-cyan-500',   badge: 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200' },
  'Archived':         { base: 'bg-gray-500 hover:bg-gray-600',  active: 'bg-gray-700 ring-gray-500',   badge: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  'Trash':            { base: 'bg-stone-500 hover:bg-stone-600',  active: 'bg-stone-700 ring-stone-500',   badge: 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200' },
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<WorkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  const [sortColumn, setSortColumn] = useState<keyof WorkItem>('dateOfWork');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [workTypeOptions, setWorkTypeOptions] = useState<string[]>(staticWorkTypeOptions);
  const [statusOptions, setStatusOptions] = useState<string[]>(INITIAL_STATUS_OPTIONS);
  const [workByOptions, setWorkByOptions] = useState<string[]>(INITIAL_WORK_BY_OPTIONS);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isEditMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [currentDate, setCurrentDate] = useState('');
  
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('fontSize');
    return savedSize ? parseInt(savedSize, 10) : 16; // Default to 16px
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);


  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    localStorage.setItem('isEditMode', JSON.stringify(isEditMode));
  }, [isEditMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const calculateDayCount = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    const workDate = new Date(dateStr);
    if (isNaN(workDate.getTime())) return 0;
    today.setHours(0, 0, 0, 0);
    workDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - workDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = db.collection("work-items").orderBy("dateOfWork", "desc");
    const unsubscribe = q.onSnapshot((querySnapshot) => {
      const items: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          dateOfWork: data.dateOfWork || '',
          workBy: data.workBy || '',
          workOfType: data.workOfType || 'N/A',
          status: data.status || 'N/A',
          customerName: data.customerName || 'N/A',
          passportNumber: data.passportNumber || '',
          trackingNumber: data.trackingNumber || '',
          mobileWhatsappNumber: data.mobileWhatsappNumber || '',
          isArchived: data.isArchived || false,
          isTrashed: data.isTrashed || false,
          trashedAt: data.trashedAt,
          salesPrice: data.salesPrice || 0,
          advance: data.advance || 0,
          due: data.due ?? (data.salesPrice || 0) - (data.advance || 0),
          dayCount: calculateDayCount(data.dateOfWork),
          customerCalled: data.customerCalled || false,
        });
      });
      setWorkItems(items);
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    const optionsDocRef = db.collection('options').doc('appData');
    const unsubscribe = optionsDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
            setWorkTypeOptions(prev => [...new Set([...prev, ...(data.workTypes || [])])]);
            setStatusOptions(prev => [...new Set([...prev, ...(data.statuses || [])])]);
            setWorkByOptions(prev => [...new Set([...prev, ...(data.workBy || [])])]);
        }
      } else {
        console.log("Options document does not exist, creating it with default values.");
        optionsDocRef.set({
            workTypes: staticWorkTypeOptions,
            statuses: INITIAL_STATUS_OPTIONS,
            workBy: INITIAL_WORK_BY_OPTIONS,
        }).catch(err => console.error("Error creating options document:", err));
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  useEffect(() => {
    let items = [...workItems];

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

    if (activeTab === 'Trash') {
        items = items.filter(item => item.isTrashed);
    } else if (activeTab === 'Archived') {
        items = items.filter(item => item.isArchived && !item.isTrashed);
    } else {
        items = items.filter(item => !item.isArchived && !item.isTrashed);
        if (activeTab !== 'All Items') {
            items = items.filter(item => item.status === activeTab);
        }
    }

    if (sortColumn) {
      items.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (sortColumn === 'dayCount' || sortColumn === 'salesPrice' || sortColumn === 'advance' || sortColumn === 'due') {
          comparison = (aValue as number) - (bValue as number);
        } else {
          comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    // Deselect items that are no longer visible
    const visibleIds = new Set(items.map(item => item.id));
    setSelectedItems(prev => prev.filter(id => visibleIds.has(id)));

    setFilteredItems(items);
  }, [searchTerm, activeTab, workItems, sortColumn, sortDirection]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, itemsPerPage]);

  // Calculate paginated items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Keep current page within bounds
  useEffect(() => {
      const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
      }
  }, [currentPage, filteredItems.length, itemsPerPage]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        if (paginatedItems.length === 0) {
            headerCheckboxRef.current.checked = false;
            headerCheckboxRef.current.indeterminate = false;
            return;
        }

        const currentPageIds = new Set(paginatedItems.map(i => i.id!));
        const selectedOnPageCount = selectedItems.filter(id => currentPageIds.has(id)).length;
        
        const allOnPageSelected = selectedOnPageCount === paginatedItems.length;
        const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected;

        headerCheckboxRef.current.checked = allOnPageSelected;
        headerCheckboxRef.current.indeterminate = someOnPageSelected;
    }
  }, [selectedItems, paginatedItems]);

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

  const handleSave = async (itemToSave: Omit<WorkItem, 'id' | 'dayCount' | 'isArchived' | 'due' | 'isTrashed' | 'trashedAt' | 'customerCalled'> & { id?: string }) => {
    const due = (Number(itemToSave.salesPrice) || 0) - (Number(itemToSave.advance) || 0);
    const dataToSaveWithDue = { ...itemToSave, due };
    try {
      if (dataToSaveWithDue.id) {
        const { id, ...dataToUpdate } = dataToSaveWithDue;
        const docRef = db.collection("work-items").doc(id);

        const originalItem = workItems.find(w => w.id === id);
        if (originalItem && originalItem.dateOfWork.includes('T')) {
            const timePart = originalItem.dateOfWork.split('T')[1];
            dataToUpdate.dateOfWork = `${dataToUpdate.dateOfWork}T${timePart}`;
        }
        
        await docRef.update(dataToUpdate);
      } else {
        const selectedDate = new Date(`${dataToSaveWithDue.dateOfWork}T00:00:00`);
        const now = new Date();
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
        selectedDate.setSeconds(now.getSeconds());

        await db.collection("work-items").add({ 
          ...dataToSaveWithDue,
          dateOfWork: selectedDate.toISOString(),
          isArchived: false,
          isTrashed: false,
          customerCalled: false,
        });
      }
      
      const optionsDocRef = db.collection('options').doc('appData');
      if (!workTypeOptions.includes(dataToSaveWithDue.workOfType)) {
          await optionsDocRef.update({ workTypes: firebase.firestore.FieldValue.arrayUnion(dataToSaveWithDue.workOfType) });
      }
      if (!statusOptions.includes(dataToSaveWithDue.status)) {
          await optionsDocRef.update({ statuses: firebase.firestore.FieldValue.arrayUnion(dataToSaveWithDue.status) });
      }
      if (dataToSaveWithDue.workBy && !workByOptions.includes(dataToSaveWithDue.workBy)) {
          await optionsDocRef.update({ workBy: firebase.firestore.FieldValue.arrayUnion(dataToSaveWithDue.workBy) });
      }

    } catch (error) {
      console.error("Error saving document: ", error);
    }
    handleCloseModal();
  };
  
  const handleImport = async (data: string) => {
    const lines = data.trim().split('\n');
    if (lines.length > 0) {
      lines.shift();
    }

    const itemsToSave: Omit<WorkItem, 'id' | 'dayCount' | 'isArchived' | 'isTrashed'>[] = [];
    const newWorkTypes = new Set<string>();
    const newStatuses = new Set<string>();
    const newWorkBy = new Set<string>();

    for (const line of lines) {
      const values = line.split('\t');
      if (values.length < 10) continue;

      const [_sn, dateOfWork, workBy, workOfType, status, customerName, trackingNumber, customerNumber, salesPriceStr, advanceStr] = values.map(v => v.trim());

      if (!dateOfWork || !workOfType || !status || !customerName) continue;

      const salesPrice = parseFloat(salesPriceStr) || 0;
      const advance = parseFloat(advanceStr) || 0;
      const due = salesPrice - advance;

      const item = {
        dateOfWork,
        workBy,
        workOfType,
        status,
        customerName,
        trackingNumber,
        passportNumber: '',
        mobileWhatsappNumber: customerNumber,
        salesPrice,
        advance,
        due,
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
        batch.set(docRef, { ...item, isArchived: false, isTrashed: false, customerCalled: false });
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

  const handleMoveToTrash = async (id: string) => {
    try {
      const docRef = db.collection("work-items").doc(id);
      await docRef.update({ 
          isTrashed: true,
          trashedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error moving item to trash: ", error);
    }
  };
  
  const handleRestoreFromTrash = async (id: string) => {
    try {
        const docRef = db.collection("work-items").doc(id);
        await docRef.update({
            isTrashed: false,
            trashedAt: firebase.firestore.FieldValue.delete()
        });
    } catch(error) {
        console.error("Error restoring item from trash: ", error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
        const docRef = db.collection("work-items").doc(id);
        await docRef.update({ isArchived: true });
    } catch (error) {
        console.error("Error archiving document: ", error);
    }
  };
  
  const handleUnarchive = async (id: string) => {
    try {
        const docRef = db.collection("work-items").doc(id);
        await docRef.update({ isArchived: false });
    } catch(error) {
        console.error("Error unarchiving document: ", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const docRef = db.collection("work-items").doc(id);
      await docRef.update({ status });
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status. Please try again.");
    }
  };
  
  const handleCustomerCalledToggle = async (id: string, called: boolean) => {
    try {
        await db.collection("work-items").doc(id).update({ customerCalled: called });
    } catch (error) {
        console.error("Error updating customer called status: ", error);
        alert("Failed to update status. Please try again.");
    }
  };
  
  const handleToggleItemSelection = (id: string) => {
      setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAllSelection = () => {
      const currentPageIds = paginatedItems.map(item => item.id!);
      const currentPageIdsSet = new Set(currentPageIds);
      
      const selectedOnPageCount = selectedItems.filter(id => currentPageIdsSet.has(id)).length;

      if (selectedOnPageCount === currentPageIds.length) {
          // All on page are selected, so deselect them
          setSelectedItems(prev => prev.filter(id => !currentPageIdsSet.has(id)));
      } else {
          // Not all (or none) are selected, so select all on this page, preserving other selections
          setSelectedItems(prev => [...new Set([...prev, ...currentPageIds])]);
      }
  };
  
  const handleBulkMoveToTrash = async () => {
    if (window.confirm(`Are you sure you want to move these ${selectedItems.length} items to the trash?`)) {
      try {
        const batch = db.batch();
        selectedItems.forEach(id => {
          const docRef = db.collection("work-items").doc(id);
          batch.update(docRef, { 
              isTrashed: true,
              trashedAt: new Date().toISOString()
          });
        });
        await batch.commit();
        setSelectedItems([]);
      } catch (error) {
        console.error("Error performing bulk move to trash: ", error);
        alert("An error occurred during bulk move to trash. Check the console for details.");
      }
    }
  };

  const handleBulkPrint = () => {
    document.body.classList.add('bulk-print-active');
    const selectedIdsSet = new Set(selectedItems);
    document.querySelectorAll('tbody tr[data-item-id]').forEach(row => {
      const rowId = row.getAttribute('data-item-id');
      if (rowId && selectedIdsSet.has(rowId)) {
        row.classList.add('print-selected');
      }
    });

    const cleanup = () => {
      document.body.classList.remove('bulk-print-active');
      document.querySelectorAll('.print-selected').forEach(row => {
        row.classList.remove('print-selected');
      });
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
  };
  
  const handleBulkUpdate = async (data: { status?: string, workBy?: string }) => {
    if (Object.keys(data).length === 0) {
        setIsBulkEditModalOpen(false);
        return;
    };
    try {
        const batch = db.batch();
        selectedItems.forEach(id => {
            const docRef = db.collection("work-items").doc(id);
            batch.update(docRef, data);
        });
        await batch.commit();
        setSelectedItems([]);
        setIsBulkEditModalOpen(false);
    } catch (error) {
        console.error("Error during bulk update: ", error);
        alert("An error occurred during bulk update. Check the console for details.");
    }
};

  
  const getTabCount = (tab: string): number => {
    if (tab === 'All Items') return workItems.filter(item => !item.isArchived && !item.isTrashed).length;
    if (tab === 'Archived') return workItems.filter(item => item.isArchived && !item.isTrashed).length;
    if (tab === 'Trash') return workItems.filter(item => item.isTrashed).length;
    return workItems.filter(item => item.status === tab && !item.isArchived && !item.isTrashed).length;
  }
  
  const handleSort = (column: keyof WorkItem) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => {
        const newState = !prev;
        if (!newState) {
            setSelectedItems([]);
        }
        return newState;
    });
  };
  
  const handleDecreaseFontSize = () => {
    setFontSize(prevSize => Math.max(12, prevSize - 1)); // min 12px
  };

  const handleIncreaseFontSize = () => {
    setFontSize(prevSize => Math.min(22, prevSize + 1)); // max 22px
  };

  const handleResetFontSize = () => {
    setFontSize(16); // reset to default 16px
  };

  const SortableHeader = ({ column, title, thClassName = '' }: { column: keyof WorkItem, title: string, thClassName?: string }) => {
    const isSorting = sortColumn === column;
    const Icon = isSorting ? (sortDirection === 'asc' ? ChevronUpIcon : ChevronDownIcon) : ChevronUpDownIcon;

    return (
      <th scope="col" className={`py-0 text-left text-sm font-semibold text-white transition-colors duration-200 ${thClassName}`}>
        <button
          onClick={() => handleSort(column)}
          className="group w-full h-full flex items-center justify-start gap-1 px-3 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset"
        >
          <span>{title}</span>
          <span className={`transition-opacity ${isSorting ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
            <Icon className="h-4 w-4" />
          </span>
        </button>
      </th>
    );
  };

  const handleLogin = (username: string, password) => {
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }


  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans flex flex-col">
      <div className="hidden print:block text-center pt-4 mb-4">
        <h1 className="text-xl font-bold text-black">Work Items Report</h1>
        <p className="text-sm text-slate-600">{currentDate}</p>
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {selectedItems.length > 0 && isSelectionMode ? (
          <BulkActionToolbar
            selectedCount={selectedItems.length}
            onClearSelection={() => setSelectedItems([])}
            onPrint={handleBulkPrint}
            onEdit={() => setIsBulkEditModalOpen(true)}
            onDelete={handleBulkMoveToTrash}
            isEditMode={isEditMode}
          />
        ) : (
          <div className="mb-8 p-4 bg-white dark:bg-slate-900/70 rounded-lg shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:flex-1">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          className="block w-full rounded-md border-0 py-2 pl-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                  </div>
                  
                  <div className="text-center order-first sm:order-none">
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-500 bg-clip-text text-transparent">Work Management Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Track and manage all your work items efficiently.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 w-full sm:flex-1">
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:block whitespace-nowrap">
                      {currentDate}
                    </p>
                     <HeaderActions
                        isEditMode={isEditMode}
                        onToggleEditMode={() => setIsEditMode(prev => !prev)}
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        theme={theme}
                        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        onImport={handleOpenImportModal}
                        onPrint={() => window.print()}
                        onDecreaseFontSize={handleDecreaseFontSize}
                        onIncreaseFontSize={handleIncreaseFontSize}
                        onResetFontSize={handleResetFontSize}
                        onLogout={handleLogout}
                      />
                  </div>
              </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900/70 rounded-lg shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-800">
                <nav className="flex gap-x-2 overflow-x-auto p-2">
                    {TABS.map(tab => {
                        const colorConfig = TAB_COLORS[tab] || TAB_COLORS['All Items'];
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setSelectedItems([]);
                                }}
                                className={`${
                                    isActive
                                    ? `${colorConfig.active} ring-2 ring-offset-2 dark:ring-offset-slate-900`
                                    : colorConfig.base
                                } text-white whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all duration-150 shadow-sm focus:outline-none`}
                            >
                                {tab}
                                <span className={`min-w-[24px] inline-block text-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                    isActive 
                                    ? 'bg-white/30 text-white' 
                                    : colorConfig.badge
                                }`}>
                                    {getTabCount(tab)}
                                </span>
                            </button>
                        )
                    })}
                </nav>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead>
                  <tr>
                    {isSelectionMode && (
                        <th scope="col" className="relative px-7 sm:w-12 sm:px-6 bg-slate-50 dark:bg-slate-800/50">
                            <input
                                type="checkbox"
                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-600 dark:checked:bg-indigo-500"
                                ref={headerCheckboxRef}
                                onChange={handleToggleAllSelection}
                            />
                        </th>
                    )}
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white bg-slate-600">S.N</th>
                    <SortableHeader column="dateOfWork" title="Date / Time" thClassName="bg-sky-500 hover:bg-sky-600" />
                    <SortableHeader column="workBy" title="Work By" thClassName="bg-teal-500 hover:bg-teal-600" />
                    <SortableHeader column="workOfType" title="Work Type" thClassName="bg-fuchsia-500 hover:bg-fuchsia-600" />
                    <SortableHeader column="status" title="Status" thClassName="bg-orange-500 hover:bg-orange-600" />
                    <SortableHeader column="customerName" title="Client / Case Info" thClassName="bg-amber-500 hover:bg-amber-600" />
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white bg-violet-500">
                        Called
                    </th>
                    <SortableHeader column="due" title="Financials" thClassName="bg-rose-500 hover:bg-rose-600" />
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right bg-slate-50 dark:bg-slate-800/50">
                        <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {paginatedItems.map((item, index) => (
                    <WorkItemRow
                      key={item.id}
                      serialNumber={startIndex + index + 1}
                      item={item}
                      isSelected={selectedItems.includes(item.id!)}
                      isSelectionMode={isSelectionMode}
                      onToggleSelection={handleToggleItemSelection}
                      onEdit={() => handleOpenModal(item)}
                      onDelete={() => handleMoveToTrash(item.id!)}
                      onRestore={() => handleRestoreFromTrash(item.id!)}
                      onArchive={() => handleArchive(item.id!)}
                      onUnarchive={() => handleUnarchive(item.id!)}
                      onStatusChange={handleStatusChange}
                      onCustomerCalledToggle={handleCustomerCalledToggle}
                      statusOptions={statusOptions}
                      isEditMode={isEditMode}
                    />
                  ))}
                </tbody>
              </table>
               {filteredItems.length === 0 && (
                <div className="text-center py-16">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-200">No work items</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Get started by creating a new work item.</p>
                </div>
              )}
            </div>
             {filteredItems.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}
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
        
        {isBulkEditModalOpen && (
            <BulkEditModal
                onClose={() => setIsBulkEditModalOpen(false)}
                onSave={handleBulkUpdate}
                workByOptions={workByOptions}
                statusOptions={statusOptions}
                selectedCount={selectedItems.length}
            />
        )}

        {isImportModalOpen && (
            <ImportModal
                onClose={handleCloseImportModal}
                onImport={handleImport}
            />
        )}

        <Fab onClick={() => handleOpenModal()} />
      </div>
       <footer className="text-center py-4 px-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        MADE WITH ❤️ BY <a href="http://ainulislam.info" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">"Ainul islam"</a>
      </footer>
    </div>
  );
};

export default App;