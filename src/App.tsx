import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { 
  Wrench, 
  Award, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Building, 
  Cpu, 
  FileText, 
  CreditCard, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  FolderOpen,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import SchoolLogo from './components/SchoolLogo';
import { 
  DEPARTMENTS, 
  ROLES, 
  UserRole, 
  MaintenanceRecord, 
  RoleConfig 
} from './types';
import { generateMockReceipt } from './utils/receiptGenerator';
import { exportRecordsToCSV } from './utils/csvExport';

export default function App() {
  // Application States
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('Facility Manager');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form Field States
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0].name);
  const [selectedSubject, setSelectedSubject] = useState(DEPARTMENTS[0].items[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [details, setDetails] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [whoDidIt, setWhoDidIt] = useState('Mr. Emeka');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // File Upload State
  const [proofFile, setProofFile] = useState<{
    name: string;
    type: string;
    size: string;
    data: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Lightbox / Proof modal
  const [selectedProof, setSelectedProof] = useState<MaintenanceRecord | null>(null);

  // Edit Modal States
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [editDept, setEditDept] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCustomSubject, setEditCustomSubject] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editWhoDidIt, setEditWhoDidIt] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<'Approved' | 'Rejected' | 'Pending'>('Pending');
  const [editProofFile, setEditProofFile] = useState<{
    name: string;
    type: string;
    size: string;
    data: string;
  } | null>(null);
  const [isEditDragging, setIsEditDragging] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Firebase sync error alert
  const [dbError, setDbError] = useState<string | null>(null);

  // Sync state & handle role profile default names
  useEffect(() => {
    if (activeRole === 'Facility Manager') {
      setWhoDidIt('Mr. Emeka');
    } else if (activeRole === 'Director') {
      setWhoDidIt('Director Jonathan');
    } else if (activeRole === 'Head of School') {
      setWhoDidIt('Mrs. Adebayo');
    } else {
      setWhoDidIt('Staff Member');
    }
  }, [activeRole]);

  // Sync department items
  useEffect(() => {
    const dept = DEPARTMENTS.find(d => d.name === selectedDept);
    if (dept && dept.items.length > 0) {
      setSelectedSubject(dept.items[0]);
    } else {
      setSelectedSubject('Write Custom Item...');
    }
  }, [selectedDept]);

  // Main Firestore Real-time Sync & Seeding
  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'maintenance_records');
    
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      const recordsList: MaintenanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        recordsList.push({ id: docSnap.id, ...docSnap.data() } as MaintenanceRecord);
      });
      
      // Seed Database if empty
      if (recordsList.length === 0) {
        try {
          const seedData: Omit<MaintenanceRecord, 'id'>[] = [
            {
              date: '2026-06-25',
              department: 'Administrative / Office',
              subject: "Principal's Official Car",
              details: 'General servicing',
              description: 'Routine maintenance including engine oil replacement, oil filter change, spark plugs cleaning, and full vehicle inspection.',
              whoDidIt: 'Mr. Emeka',
              role: 'Facility Manager',
              cost: 27000,
              proofName: 'servicing_receipt_car.png',
              proofType: 'image/png',
              proofData: generateMockReceipt("Principal's Car Servicing", 27000, '2026-06-25', 'REC-0021A'),
              status: 'Approved',
              createdAt: new Date('2026-06-25T10:30:00Z').toISOString()
            },
            {
              date: '2026-06-26',
              department: 'Administrative / Office',
              subject: "Principal's Official Car",
              details: 'Bought car battery',
              description: 'Purchased a durable 75AH maintenance-free battery to resolve morning cold-start starting failures on the principal\'s official car.',
              whoDidIt: 'Mr. Emeka',
              role: 'Facility Manager',
              cost: 75000,
              proofName: 'battery_invoice_2026.png',
              proofType: 'image/png',
              proofData: generateMockReceipt("Principal's Car Battery", 75000, '2026-06-26', 'REC-0024B'),
              status: 'Approved',
              createdAt: new Date('2026-06-26T14:45:00Z').toISOString()
            },
            {
              date: '2026-06-27',
              department: 'IT Unit',
              subject: 'Server Rack Backup Battery',
              details: 'Server room battery backup replacements',
              description: 'Replaced dead cells in the server rack APC Smart-UPS system to guarantee 45 minutes of server uptime during school power transitions.',
              whoDidIt: 'Mrs. Sarah (IT Head)',
              role: 'Staff',
              cost: 125000,
              proofName: 'ups_battery_proof.png',
              proofType: 'image/png',
              proofData: generateMockReceipt('UPS Batteries Replacement', 125000, '2026-06-27', 'REC-0105X'),
              status: 'Pending',
              createdAt: new Date('2026-06-27T08:15:00Z').toISOString()
            },
            {
              date: '2026-06-24',
              department: 'Facilities / Buildings',
              subject: 'General School Water Pumps',
              details: 'Plumbing leak repairs and water pump servicing',
              description: 'Called external plumber to repair major output valve leakages and replace the pressure control gasket for the dormitory main water pump.',
              whoDidIt: 'Mr. Emeka',
              role: 'Facility Manager',
              cost: 38000,
              proofName: 'plumbing_receipt_mhis.png',
              proofType: 'image/png',
              proofData: generateMockReceipt('Water Pump Servicing', 38000, '2026-06-24', 'REC-0012F'),
              status: 'Approved',
              createdAt: new Date('2026-06-24T11:00:00Z').toISOString()
            }
          ];

          for (const item of seedData) {
            await addDoc(colRef, item);
          }
        } catch (err: any) {
          console.error("Seeding failed: ", err);
          setDbError("Seeding initial records failed. Please reload.");
        }
      } else {
        // Sort records by date descending
        recordsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(recordsList);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore connection failed: ", error);
      setDbError("Database offline or permission denied. Storing changes locally in session.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Form drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofFile({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setProofFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const subjectToSave = selectedSubject === 'Write Custom Item...' ? customSubject.trim() : selectedSubject;
    if (!subjectToSave) {
      alert("Please specify the item/subject of maintenance.");
      return;
    }
    if (!details.trim()) {
      alert("Please provide the details/repairs done.");
      return;
    }
    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) {
      alert("Please enter a valid cost/price.");
      return;
    }

    // Generate receipt if no proof uploaded
    let savedProofName = proofFile?.name || 'generated_proof.png';
    let savedProofType = proofFile?.type || 'image/png';
    let savedProofData = proofFile?.data || '';
    
    if (!proofFile) {
      const randomRef = 'REC-' + Math.floor(1000 + Math.random() * 9000) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      savedProofData = generateMockReceipt(subjectToSave, costNum, date, randomRef);
    }

    const newRecord: Omit<MaintenanceRecord, 'id'> = {
      date,
      department: selectedDept,
      subject: subjectToSave,
      details: details.trim(),
      description: description.trim(),
      whoDidIt: whoDidIt.trim(),
      role: activeRole,
      cost: costNum,
      proofName: savedProofName,
      proofType: savedProofType,
      proofData: savedProofData,
      status: activeRole === 'Director' || activeRole === 'Head of School' ? 'Approved' : 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'maintenance_records'), newRecord);
      
      // Reset Form fields
      setDetails('');
      setDescription('');
      setCost('');
      setProofFile(null);
      setCustomSubject('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      // Fallback local append if offline
      const tempId = 'local-' + Date.now();
      setRecords(prev => [{ id: tempId, ...newRecord } as MaintenanceRecord, ...prev]);
      setDetails('');
      setDescription('');
      setCost('');
      setProofFile(null);
      setCustomSubject('');
      setShowAddForm(false);
    }
  };

  // Sync edit department items
  useEffect(() => {
    if (editingRecord) {
      const dept = DEPARTMENTS.find(d => d.name === editDept);
      if (dept && dept.items.length > 0) {
        if (!dept.items.includes(editSubject) && editSubject !== 'Write Custom Item...') {
          setEditSubject(dept.items[0]);
        }
      } else {
        setEditSubject('Write Custom Item...');
      }
    }
  }, [editDept, editingRecord]);

  // Edit Trigger
  const startEditing = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setEditDept(record.department);
    
    // Check if subject is predefined
    const deptInfo = DEPARTMENTS.find(d => d.name === record.department);
    if (deptInfo && deptInfo.items.includes(record.subject)) {
      setEditSubject(record.subject);
      setEditCustomSubject('');
    } else {
      setEditSubject('Write Custom Item...');
      setEditCustomSubject(record.subject);
    }
    
    setEditDetails(record.details);
    setEditDescription(record.description || '');
    setEditCost(String(record.cost));
    setEditWhoDidIt(record.whoDidIt);
    setEditDate(record.date);
    setEditStatus(record.status);
    setEditProofFile(null);
  };

  const processEditFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProofFile({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsEditDragging(true);
  };

  const handleEditDragLeave = () => {
    setIsEditDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsEditDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processEditFile(file);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processEditFile(file);
    }
  };

  const removeEditProof = () => {
    setEditProofFile(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Submit Updated Record
  const handleUpdateRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const subjectToSave = editSubject === 'Write Custom Item...' ? editCustomSubject.trim() : editSubject;
    if (!subjectToSave) {
      alert("Please specify the item/subject of maintenance.");
      return;
    }
    if (!editDetails.trim()) {
      alert("Please provide the details/repairs done.");
      return;
    }
    const costNum = parseFloat(editCost);
    if (isNaN(costNum) || costNum < 0) {
      alert("Please enter a valid cost/price.");
      return;
    }

    let savedProofName = editProofFile?.name || editingRecord.proofName || 'generated_proof.png';
    let savedProofType = editProofFile?.type || editingRecord.proofType || 'image/png';
    let savedProofData = editProofFile?.data || editingRecord.proofData || '';

    // If cost, subject or date changed and it's a generated proof, regenerate it!
    const isGenerated = !editingRecord.proofName || editingRecord.proofName === 'generated_proof.png';
    if (!editProofFile && isGenerated && (editingRecord.cost !== costNum || editingRecord.subject !== subjectToSave || editingRecord.date !== editDate)) {
      const randomRef = 'REC-' + Math.floor(1000 + Math.random() * 9000) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      savedProofData = generateMockReceipt(subjectToSave, costNum, editDate, randomRef);
    }

    const updatedFields: Partial<MaintenanceRecord> = {
      date: editDate,
      department: editDept,
      subject: subjectToSave,
      details: editDetails.trim(),
      description: editDescription.trim(),
      whoDidIt: editWhoDidIt.trim(),
      cost: costNum,
      proofName: savedProofName,
      proofType: savedProofType,
      proofData: savedProofData,
      status: editStatus
    };

    try {
      if (editingRecord.id.startsWith('local-')) {
        setRecords(prev => prev.map(rec => rec.id === editingRecord.id ? { ...rec, ...updatedFields } : rec));
      } else {
        const recordDocRef = doc(db, 'maintenance_records', editingRecord.id);
        await updateDoc(recordDocRef, updatedFields);
      }
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      // Fallback local update
      setRecords(prev => prev.map(rec => rec.id === editingRecord.id ? { ...rec, ...updatedFields } : rec));
      setEditingRecord(null);
    }
  };

  // Update Status handler (Approval/Rejection)
  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    if (activeRole !== 'Director' && activeRole !== 'Head of School') {
      alert("Access Denied: Only the Director or Head of School can approve/reject records.");
      return;
    }
    
    try {
      if (id.startsWith('local-')) {
        // Update local state if offline
        setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
        return;
      }
      const recordDocRef = doc(db, 'maintenance_records', id);
      await updateDoc(recordDocRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
      // fallback
      setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
    }
  };

  // Delete Record handler
  const handleDeleteRecord = async (id: string) => {
    if (activeRole !== 'Director' && activeRole !== 'Facility Manager') {
      alert("Access Denied: Only the Director or Facility Manager can delete maintenance records.");
      return;
    }
    
    if (!confirm("Are you sure you want to permanently delete this maintenance log? This action is irreversible.")) {
      return;
    }

    try {
      if (id.startsWith('local-')) {
        setRecords(prev => prev.filter(rec => rec.id !== id));
        return;
      }
      const recordDocRef = doc(db, 'maintenance_records', id);
      await deleteDoc(recordDocRef);
    } catch (error) {
      console.error("Error deleting record: ", error);
      setRecords(prev => prev.filter(rec => rec.id !== id));
    }
  };

  // Calculations for dashboard reporting
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.whoDidIt.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = deptFilter === 'All' || rec.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCostAll = records.reduce((sum, rec) => sum + rec.cost, 0);
  const totalCostFiltered = filteredRecords.reduce((sum, rec) => sum + rec.cost, 0);
  const totalPending = records.filter(rec => rec.status === 'Pending').length;
  const totalApproved = records.filter(rec => rec.status === 'Approved').length;

  // Chart Formatting: Cost by Department
  const deptCostMap = DEPARTMENTS.reduce((map, dept) => {
    map[dept.name] = 0;
    return map;
  }, {} as Record<string, number>);

  records.forEach(rec => {
    if (deptCostMap[rec.department] !== undefined) {
      deptCostMap[rec.department] += rec.cost;
    } else {
      deptCostMap[rec.department] = rec.cost;
    }
  });

  const chartData = Object.keys(deptCostMap).map(deptName => ({
    name: deptName.split(' / ')[0], // short name
    fullName: deptName,
    cost: deptCostMap[deptName],
  }));

  // Recharts color scheme matching modern premium look
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Warning banner if offline database detected */}
      {dbError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs py-1 px-4 text-center font-mono flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          <span>{dbError}</span>
        </div>
      )}

      {/* Sidebar Panel */}
      <aside className="w-64 bg-[#1a2b4b] text-white flex flex-col shrink-0 border-r border-white/5 shadow-xl select-none">
        {/* Sidebar Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-[#162541]">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-display font-extrabold text-xl text-white shadow-md">
            M
          </div>
          <span className="font-semibold tracking-tight leading-tight text-sm">
            Meridian Heights
            <br />
            <span className="text-xs text-blue-300 font-normal">Maintenance Tracker</span>
          </span>
        </div>

        {/* Sidebar Navigation - Interactive views mapped to filters */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Navigation views
          </span>
          
          {/* View: All Logs */}
          <button
            onClick={() => {
              setDeptFilter('All');
              setStatusFilter('All');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              deptFilter === 'All' && statusFilter === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>Dashboard Logs</span>
          </button>

          {/* View: Approval Queue */}
          <button
            onClick={() => {
              setDeptFilter('All');
              setStatusFilter('Pending');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'Pending' && deptFilter === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <span>Approval Queue</span>
            </div>
            {totalPending > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {totalPending}
              </span>
            )}
          </button>

          {/* View: Approved logs */}
          <button
            onClick={() => {
              setDeptFilter('All');
              setStatusFilter('Approved');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'Approved' && deptFilter === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span>Approved Audits</span>
          </button>

          {/* Department Shortcuts list */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Departments Filter
            </span>
            {DEPARTMENTS.map((dept) => {
              const shortName = dept.name.split(' / ')[0];
              const isSelected = deptFilter === dept.name;
              return (
                <button
                  key={dept.name}
                  onClick={() => {
                    setDeptFilter(dept.name);
                    setStatusFilter('All');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white font-semibold'
                      : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <Building size={12} className="opacity-50" />
                  <span className="truncate">{shortName}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer with current role profile info */}
        <div className="p-4 border-t border-white/10 text-xs text-slate-400 space-y-1 bg-[#15223c]">
          <p className="font-semibold text-slate-300">Authorized Operator:</p>
          <p className="font-mono text-blue-300 text-[11px] font-bold truncate">{whoDidIt}</p>
          <p className="text-[10px] text-slate-400 font-mono">Role: {activeRole}</p>
          <p className="text-[9px] text-slate-500 font-mono">Ledger ID: #MH-9942</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-xs shrink-0 select-none">
          <div className="flex items-center gap-3">
            <SchoolLogo size={42} className="shrink-0" />
            <h1 className="text-lg font-bold text-slate-800 font-display tracking-tight">
              Facility Maintenance Management
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Export CSV button */}
            <button
              onClick={() => exportRecordsToCSV(filteredRecords)}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to CSV</span>
            </button>

            {/* Persona Simulator Dropdown */}
            <div className="relative">
              <button
                id="role-selector-btn"
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center gap-2 bg-[#1a2b4b] text-white hover:bg-[#121f37] transition-colors py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center font-display font-extrabold text-[10px] shrink-0">
                  {activeRole[0]}
                </div>
                <span>{activeRole}</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>

              {/* Role Switcher Dropdown popup */}
              {showRoleSelector && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Choose Simulation Persona
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                      Toggle roles to view tailored dashboards and approval systems.
                    </p>
                  </div>
                  {ROLES.map((role) => (
                    <button
                      key={role.name}
                      onClick={() => {
                        setActiveRole(role.name);
                        setShowRoleSelector(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-3 hover:bg-slate-50 ${
                        activeRole === role.name ? 'bg-slate-50 border border-slate-200/80' : 'border border-transparent'
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-display font-bold text-[10px] shrink-0 mt-0.5">
                        {role.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{role.name}</span>
                          {activeRole === role.name && (
                            <span className="text-[8px] bg-slate-900 text-white px-1 py-0.2 rounded font-mono font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1: Monthly Expenditure */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Expenditure</p>
              <p className="text-2xl font-extrabold mt-1 text-slate-950 font-mono">₦{totalCostAll.toLocaleString()}</p>
              <p className="text-[10px] text-green-600 mt-1 font-medium flex items-center gap-1">
                <TrendingUp size={11} />
                <span>↓ 12% vs last month</span>
              </p>
            </div>

            {/* Stat 2: Pending Proofs */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Proofs</p>
              <p className="text-2xl font-extrabold mt-1 text-slate-950 font-mono">
                {totalPending} Request{totalPending !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-amber-600 mt-1 font-medium">
                {totalPending > 0 ? 'Requires immediate signature review' : 'All audits clear'}
              </p>
            </div>

            {/* Stat 3: Recent Activity */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Activity</p>
              <p className="text-2xl font-bold mt-1 text-slate-900 truncate">
                {records[0] ? records[0].department.split(' / ')[0] : 'No Logs'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {records[0] ? `Last update: ${records[0].subject}` : 'No activity logged'}
              </p>
            </div>
          </div>

          {/* Form Section: Horizontal Compact Layout */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-md transition-all">
            <div 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-between cursor-pointer group select-none"
            >
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span>New Maintenance Entry</span>
              </h2>
              <button className="text-slate-400 hover:text-slate-800 bg-slate-50 p-1.5 rounded-lg border border-slate-200 transition-colors">
                {showAddForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Department select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Department</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.name} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Subject / Item</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {DEPARTMENTS.find(d => d.name === selectedDept)?.items.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                      <option value="Write Custom Item...">+ Write Custom Item / Equipment...</option>
                    </select>
                  </div>

                  {/* Maintenance Cost */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Maintenance Cost (₦)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        ₦
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount in Naira"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                        className="w-full text-sm border border-slate-200 rounded-lg p-2 pl-7 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Upload proof zone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Upload Proof (Receipt/Doc)</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-lg p-1.5 flex items-center justify-center text-xs text-slate-500 cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : proofFile 
                            ? 'border-emerald-300 bg-emerald-50/50' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />
                      {proofFile ? (
                        <div className="flex items-center justify-between w-full px-1">
                          <span className="truncate max-w-[120px] font-medium text-emerald-700 text-[11px]">{proofFile.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeProof(); }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 truncate">Choose file or drag here...</span>
                      )}
                    </div>
                  </div>

                  {/* Custom item input if custom chosen */}
                  {selectedSubject === 'Write Custom Item...' && (
                    <div className="col-span-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Custom Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Science Lab Projector"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        required
                        className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Repairs details */}
                  <div className={selectedSubject === 'Write Custom Item...' ? 'col-span-1 space-y-1' : 'col-span-2 space-y-1'}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Details & Repairs Done</label>
                    <input
                      type="text"
                      placeholder="e.g. Replaced battery cells, oil filter"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date of Job</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Operator/Who did it */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Logged Operator</label>
                    <input
                      type="text"
                      value={whoDidIt}
                      onChange={(e) => setWhoDidIt(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Description input */}
                  <div className="col-span-1 md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Supplementary Diagnostic / Description of Work</label>
                    <input
                      type="text"
                      placeholder="Provide supplementary breakdown of parts and contractor logs..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-[#1a2b4b] text-white py-2 rounded-lg font-bold text-xs shadow-md hover:bg-[#121f37] transition-all flex items-center justify-center gap-1.5 cursor-pointer h-10 uppercase tracking-wide"
                    >
                      <Plus size={14} />
                      <span>Submit Log Entry</span>
                    </button>
                  </div>

                </div>
              </form>
            )}
          </section>

          {/* Analytics Graphics & Category Progress bars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recharts Department Cost bar chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Cost Breakdown by Department</h3>
                  <p className="text-[11px] text-slate-500">Visual reporting of school structural budgets</p>
                </div>
                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
                  Real-time Sync
                </span>
              </div>
              
              <div className="h-56 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9, fill: '#64748b', fontWeight: 500 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(v) => `₦${v >= 1000 ? (v / 1000) + 'k' : v}`}
                      tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Cost']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px' }}
                    />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department budgets percentage progress */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Department Budgets</h3>
                <p className="text-[11px] text-slate-500">Current allocation distribution percentage</p>

                <div className="space-y-3 mt-4">
                  {chartData.map((entry, index) => {
                    const percent = totalCostAll > 0 ? ((entry.cost / totalCostAll) * 100).toFixed(0) : '0';
                    return (
                      <div key={entry.fullName}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600 text-[11px] flex items-center gap-1.5 truncate max-w-[150px]">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            {entry.fullName.split(' / ')[0]}
                          </span>
                          <span className="font-mono text-slate-900 font-semibold text-[11px]">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${percent}%`, 
                              backgroundColor: COLORS[index % COLORS.length] 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono mt-3">
                <span>Active Ledger System</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">ONLINE</span>
              </div>
            </div>

          </div>

          {/* Recent Log Table Section */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Header Filter controls inline */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Maintenance Logs</h3>
                <span className="text-xs text-slate-400">Totaling {filteredRecords.length} items logged • Simulating: {activeRole}</span>
              </div>
              
              {/* Dynamic status/category summary text pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {deptFilter !== 'All' && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200/50 flex items-center gap-1">
                    <span>Dept: {deptFilter.split(' / ')[0]}</span>
                    <button onClick={() => setDeptFilter('All')} className="hover:text-blue-900 font-extrabold font-mono">×</button>
                  </span>
                )}
                {statusFilter !== 'All' && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/50 flex items-center gap-1">
                    <span>Status: {statusFilter}</span>
                    <button onClick={() => setStatusFilter('All')} className="hover:text-amber-900 font-extrabold font-mono">×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    <span className="truncate max-w-[80px]">Query: {searchQuery}</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 font-extrabold font-mono">×</button>
                  </span>
                )}
              </div>
            </div>

            {/* Live Search and filters panel */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={12} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search subject, who, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs pl-8 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.name} value={d.name}>{d.name.split(' / ')[0]}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table Content Container */}
            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 text-xs font-semibold mt-3">Loading secure facility records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/20">
                  <Wrench size={28} className="text-slate-300 mx-auto stroke-1" />
                  <p className="text-slate-600 font-bold text-xs mt-3">No maintenance logs matches your filters</p>
                  <p className="text-slate-400 text-[11px] mt-1">Adjust filters or type another query to view school items.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 font-bold">Date</th>
                      <th className="px-5 py-3 font-bold">Department</th>
                      <th className="px-5 py-3 font-bold">Subject / Item</th>
                      <th className="px-5 py-3 font-bold">Work Details & Diagnostic Notes</th>
                      <th className="px-5 py-3 font-bold">Operator</th>
                      <th className="px-5 py-3 font-bold">Cost (₦)</th>
                      <th className="px-5 py-3 font-bold text-center">Receipt</th>
                      <th className="px-5 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                    {filteredRecords.map((record) => {
                      const isApproved = record.status === 'Approved';
                      const isRejected = record.status === 'Rejected';
                      const isPending = record.status === 'Pending';
                      
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. Date */}
                          <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-mono font-medium text-slate-500">
                            {record.date}
                          </td>

                          {/* 2. Department */}
                          <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                            {record.department.split(' / ')[0]}
                          </td>

                          {/* 3. Subject */}
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {record.subject}
                          </td>

                          {/* 4. Details / Description */}
                          <td className="px-5 py-3.5 max-w-sm">
                            <div className="font-semibold text-slate-700">{record.details}</div>
                            {record.description && (
                              <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-normal truncate max-w-xs" title={record.description}>
                                {record.description}
                              </div>
                            )}
                          </td>

                          {/* 5. Operator */}
                          <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {record.whoDidIt}
                          </td>

                          {/* 6. Cost */}
                          <td className="px-5 py-3.5 whitespace-nowrap font-mono font-extrabold text-slate-900 text-[12px]">
                            {record.cost.toLocaleString()}
                          </td>

                          {/* 7. Proof */}
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            {record.proofData ? (
                              <button
                                onClick={() => setSelectedProof(record)}
                                className="text-blue-600 cursor-pointer hover:underline font-bold text-[11px] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors border border-blue-200/40 inline-flex items-center gap-1"
                              >
                                <FileText size={12} />
                                <span>receipt</span>
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* 8. Actions */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Status Badge */}
                              <span className={`text-[9px] font-mono font-bold py-0.5 px-2 rounded-full uppercase tracking-wider border mr-1.5 ${
                                isApproved 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                                  : isRejected 
                                    ? 'bg-rose-50 text-rose-700 border-rose-200/50' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200/50'
                              }`}>
                                {record.status}
                              </span>

                              {/* Director or HOS Action Triggers */}
                              {(activeRole === 'Director' || activeRole === 'Head of School') && isPending && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(record.id, 'Approved')}
                                    title="Approve log"
                                    className="bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-200 p-1 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(record.id, 'Rejected')}
                                    title="Reject log"
                                    className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-700 border border-rose-200 p-1 rounded-md transition-colors cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              )}

                              {/* Toggle Back to Pending */}
                              {(activeRole === 'Director' || activeRole === 'Head of School') && !isPending && (
                                <button
                                  onClick={() => handleUpdateStatus(record.id, 'Pending')}
                                  className="text-[9px] font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 py-1 px-2 border border-slate-200/60 rounded transition-all cursor-pointer"
                                >
                                  Reset Status
                                </button>
                              )}

                              {/* Edit button (for Super Admin: Director / Head of School) */}
                              {(activeRole === 'Director' || activeRole === 'Head of School') && (
                                <button
                                  onClick={() => startEditing(record)}
                                  title="Edit log details"
                                  className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-400 p-1 rounded-md transition-colors cursor-pointer"
                                >
                                  <SlidersHorizontal size={12} />
                                </button>
                              )}

                              {/* Delete button */}
                              {(activeRole === 'Director' || activeRole === 'Facility Manager') && (
                                <button
                                  onClick={() => handleDeleteRecord(record.id)}
                                  title="Delete log"
                                  className="bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-slate-400 p-1 rounded-md transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Super Admin Edit Record Overlay Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5 select-none">
              <div>
                <span className="text-[9px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Super Admin Console
                </span>
                <h3 className="font-display font-extrabold text-slate-900 text-base mt-1">
                  Edit Maintenance Record
                </h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateRecordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Department Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Subject / Item</label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    {DEPARTMENTS.find(d => d.name === editDept)?.items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                    <option value="Write Custom Item...">+ Write Custom Item / Equipment...</option>
                  </select>
                </div>

                {/* Custom Item Field (if selected) */}
                {editSubject === 'Write Custom Item...' && (
                  <div className="col-span-1 md:col-span-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Custom Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Science Lab Projector"
                      value={editCustomSubject}
                      onChange={(e) => setEditCustomSubject(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Date of Job */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date of Job</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Maintenance Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Maintenance Cost (₦)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                      ₦
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="Amount in Naira"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 pl-7 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-extrabold"
                    />
                  </div>
                </div>

                {/* Logged Operator */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Logged Operator</label>
                  <input
                    type="text"
                    value={editWhoDidIt}
                    onChange={(e) => setEditWhoDidIt(e.target.value)}
                    required
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Verification Audit Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Audit Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className={`w-full text-sm border rounded-lg p-2.5 focus:outline-none font-bold ${
                      editStatus === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : editStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <option value="Pending">Pending Audit</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

              </div>

              {/* Details & Repairs Done */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Details & Repairs Done</label>
                <input
                  type="text"
                  placeholder="e.g. Replaced battery cells, oil filter"
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  required
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Description field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Supplementary Diagnostic Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide supplementary breakdown of parts and contractor logs..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Receipt File upload replacement area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Digital Receipt Proof</label>
                <div
                  onDragOver={handleEditDragOver}
                  onDragLeave={handleEditDragLeave}
                  onDrop={handleEditDrop}
                  onClick={() => editFileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-xs text-slate-500 cursor-pointer transition-all ${
                    isEditDragging 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : editProofFile 
                        ? 'border-emerald-300 bg-emerald-50/50' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={editFileInputRef}
                    onChange={handleEditFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  {editProofFile ? (
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="truncate max-w-[220px] font-medium text-emerald-700 text-[11px]">{editProofFile.name} ({editProofFile.size})</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeEditProof(); }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : editingRecord.proofName ? (
                    <div className="text-center py-1">
                      <p className="text-[11px] text-blue-600 font-bold underline truncate max-w-[260px] mx-auto">
                        Current: {editingRecord.proofName}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Drag new file or click here to replace receipt...</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 py-1">Drag file or click here to upload receipt proof...</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Lightbox / Verification Receipt View Overlay Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 select-none">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Audit Transaction Proof
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[200px]">
                  {selectedProof.proofName || 'mhis_digital_receipt.png'}
                </span>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Proof Body: Display mock or actual uploaded receipt */}
            <div className="flex items-center justify-center bg-slate-50 p-3 rounded-xl border border-slate-100/80 mb-4 select-none">
              <img 
                src={selectedProof.proofData} 
                alt="Receipt Verification" 
                className="max-h-80 rounded shadow-xs border border-slate-200 object-contain bg-white"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subject:</span>
                <span className="font-bold text-slate-800">{selectedProof.subject}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Total cost:</span>
                <span className="font-bold text-slate-900">₦{selectedProof.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Authorized by:</span>
                <span className="font-medium text-slate-700">{selectedProof.whoDidIt}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Audit Status:</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  selectedProof.status === 'Approved' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : selectedProof.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedProof.status}
                </span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              {/* Approve directly in lightbox if director/HOS */}
              {(activeRole === 'Director' || activeRole === 'Head of School') && selectedProof.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedProof.id, 'Approved');
                      setSelectedProof(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedProof.id, 'Rejected');
                      setSelectedProof(null);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              )}
              
              <button
                onClick={() => setSelectedProof(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
