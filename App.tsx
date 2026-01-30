import React, { useState, useMemo, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout, RemacoLogo } from './components/Layout';
import { InventoryTable } from './components/InventoryTable';
import { UserRole, RequestStatus, RequestType, MovementRequest, InventoryItem, User } from './types';
import { generateQF21, generateEmptyQF, getFormConfig } from './services/pdfService';
import { 
  Check, X, Package, Clock, ArrowRightLeft, 
  AlertCircle, Download, Upload, UserPlus, Users, 
  Calendar, MapPin, Briefcase, Lock, User as UserIcon, 
  TrendingUp, AlertTriangle, Trash2, Home, BarChart3, Layers,
  UserCheck, Search, ShieldCheck, FileText, Eye, MessageSquare
} from 'lucide-react';
import { SYSTEM_BASES } from './constants';

// --- Login Screen ---
const LoginScreen = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[600px]">
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-tnbBlue p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-tnbRed rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-16 -mb-16"></div>
           <div className="z-10">
              <div className="mb-6">
                 <RemacoLogo className="w-12 h-12" textSize="text-3xl" />
              </div>
              <p className="text-blue-100 text-lg font-light leading-relaxed">
                Welcome to the centralized Equipment Management System. Secure, efficient, and reliable asset tracking.
              </p>
           </div>
           <div className="z-10 mt-10">
             <p className="text-xs text-blue-300 font-mono">System v1.2.0 | Authorized Personnel Only</p>
           </div>
        </div>
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white relative">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to access the system.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text" required
                  value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-tnbBlue focus:border-tnbBlue transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password" required
                  value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-tnbBlue focus:border-tnbBlue transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-tnbBlue hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tnbBlue transition-all transform hover:-translate-y-0.5">
              Sign In
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Demo Credentials:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 font-mono">
                   <div><span className="font-semibold">admin</span> / 12345</div>
                   <div><span className="font-semibold">staff</span> / 12345</div>
                   <div><span className="font-semibold">storekeeper</span> / 12345</div>
                   <div><span className="font-semibold">manager</span> / 12345</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Request Details Modal ---
interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: string, date: string) => void;
  itemCount: number;
  mode: 'borrow' | 'return';
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, itemCount, mode }) => {
  const [targetLocation, setTargetLocation] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setTargetLocation('');
      setTargetDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetLocation && targetDate) {
      onSubmit(targetLocation, targetDate);
    }
  };

  const isBorrow = mode === 'borrow';

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className={`${isBorrow ? 'bg-tnbBlue' : 'bg-green-600'} px-6 py-4 flex justify-between items-center border-b border-white/10`}>
          <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
            {isBorrow ? <Package className="w-5 h-5 mr-2 text-blue-200" /> : <ArrowRightLeft className="w-5 h-5 mr-2 text-green-200" />}
            {isBorrow ? 'Request to Borrow' : 'Request to Return'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 p-1 rounded hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
               Selected Items: <strong className="text-gray-900 text-lg">{itemCount}</strong>
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {isBorrow ? 'Target Location (Site / Cabin)' : 'Location to store it back (Store / Rack)'}
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input 
                required type="text" 
                placeholder={isBorrow ? "e.g. Cabin 1, Project Site A" : "e.g. Rack A-1, Store Room"} 
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tnbBlue focus:border-tnbBlue focus:outline-none transition-all shadow-sm"
                value={targetLocation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetLocation(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {isBorrow ? 'Date Needed / Moving Out' : 'Date Returned'}
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input 
                required type="date" 
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tnbBlue focus:border-tnbBlue focus:outline-none transition-all shadow-sm"
                value={targetDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className={`px-6 py-2.5 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${isBorrow ? 'bg-tnbBlue hover:bg-blue-900' : 'bg-green-600 hover:bg-green-700'}`}>
              Confirm {isBorrow ? 'Request' : 'Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Dashboard Logic ---
interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, colorClass, borderClass }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${borderClass} flex items-start justify-between hover:shadow-md transition-shadow`}>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-extrabold text-gray-800 mt-2 tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1 font-medium">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

interface BaseStats {
  baseName: string;
  totalItems: number;
  skrapCount: number;
  rosakCount: number;
  inUseCount: number;
  lostCount: number;
  okCount: number;
}

const Dashboard = () => {
  const { user, requests, inventory } = useApp();
  
  const adminBaseStats = useMemo(() => {
    if (user?.role !== UserRole.ADMIN) return null;
    
    const statsMap: Record<string, BaseStats> = {};
    
    inventory.forEach((item: InventoryItem) => {
      const base = item.base || 'Unassigned';
      if (!statsMap[base]) {
        statsMap[base] = { baseName: base, totalItems: 0, skrapCount: 0, rosakCount: 0, inUseCount: 0, lostCount: 0, okCount: 0 };
      }
      
      const qty = Number(item.quantity) || 0;
      statsMap[base].totalItems += qty;
      
      const status = (item.equipmentStatus || '').toUpperCase().trim();
      if (status === 'OK') {
        statsMap[base].okCount += qty;
      } else if (status.includes('SKRAP')) {
        statsMap[base].skrapCount += qty;
      } else if (status.includes('ROSAK')) {
        statsMap[base].rosakCount += qty;
      } else if (status.includes('HILANG') || status.includes('LOST')) {
        statsMap[base].lostCount += qty;
      }

      // "In Use" means someone is responsible for it (it's out of store)
      if (item.personInCharge && item.personInCharge !== '-' && item.personInCharge !== '') {
        statsMap[base].inUseCount += qty;
      }
    });

    return Object.values(statsMap).sort((a, b) => a.baseName.localeCompare(b.baseName));
  }, [inventory, user?.role]);

  const managerBaseStats = useMemo(() => {
    if (user?.role !== UserRole.BASE_MANAGER) return null;
    
    const stats = { totalItems: 0, skrapCount: 0, rosakCount: 0, inUseCount: 0, lostCount: 0, okCount: 0 };
    
    inventory.filter(i => i.base === user.base).forEach((item: InventoryItem) => {
      const qty = Number(item.quantity) || 0;
      stats.totalItems += qty;
      
      const status = (item.equipmentStatus || '').toUpperCase().trim();
      if (status === 'OK') stats.okCount += qty;
      else if (status.includes('SKRAP')) stats.skrapCount += qty;
      else if (status.includes('ROSAK')) stats.rosakCount += qty;
      else if (status.includes('HILANG') || status.includes('LOST')) stats.lostCount += qty;

      if (item.personInCharge && item.personInCharge !== '-' && item.personInCharge !== '') {
        stats.inUseCount += qty;
      }
    });
    return stats;
  }, [inventory, user]);

  const grandTotalStats = useMemo(() => {
    if (!adminBaseStats) return null;
    return adminBaseStats.reduce((acc, curr) => ({
      totalItems: acc.totalItems + curr.totalItems,
      skrapCount: acc.skrapCount + curr.skrapCount,
      rosakCount: acc.rosakCount + curr.rosakCount,
      inUseCount: acc.inUseCount + curr.inUseCount,
      lostCount: acc.lostCount + curr.lostCount,
      okCount: acc.okCount + curr.okCount,
    }), { totalItems: 0, skrapCount: 0, rosakCount: 0, inUseCount: 0, lostCount: 0, okCount: 0 });
  }, [adminBaseStats]);

  if (!user) return null;

  // REPAIRED CALCULATIONS: Using .reduce() to sum the quantity field instead of .length
  const myPendingRequests = requests.filter((r: MovementRequest) => r.staffId === user.id && (r.status === RequestStatus.PENDING || r.status === RequestStatus.PENDING_MANAGER));
  
  const itemsHeldCount = inventory
    .filter((i: InventoryItem) => i.personInCharge === user.name)
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const pendingForStorekeeper = requests.filter((r: MovementRequest) => r.status === RequestStatus.PENDING && r.base === user.base);
  const pendingForManager = requests.filter((r: MovementRequest) => r.status === RequestStatus.PENDING_MANAGER && r.base === user.base);
  
  const totalItemsInBase = inventory
    .filter((i: InventoryItem) => i.base === user.base)
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  
  const itemsInStore = inventory
    .filter((i: InventoryItem) => i.base === user.base && (i.currentLocation === i.location || i.currentLocation === 'In Store'))
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500">Welcome back, <span className="text-tnbBlue font-semibold">{user.name}</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
           <Home className="w-4 h-4 text-tnbBlue" />
           <span className="text-sm font-bold text-tnbBlue">{user.base}</span>
        </div>
      </div>

      {/* Primary Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.role === UserRole.STOREKEEPER && (
          <><StatCard title="Pending Store Approvals" value={pendingForStorekeeper.length} subtext="Requests to Verify" icon={Clock} colorClass="bg-orange-500" borderClass="border-orange-500" />
            <StatCard title="Awaiting Manager" value={pendingForManager.length} subtext="Passed Storekeeper" icon={Briefcase} colorClass="bg-teal-600" borderClass="border-teal-600" />
            <StatCard title="Store Inventory" value={`${itemsInStore} / ${totalItemsInBase}`} subtext="Total Units in Base" icon={Package} colorClass="bg-tnbBlue" borderClass="border-tnbBlue" /></>
        )}
        {user.role === UserRole.BASE_MANAGER && (
           <><StatCard title="Pending My Approval" value={pendingForManager.length} subtext="Requires Final Sign-off" icon={Check} colorClass="bg-teal-600" borderClass="border-teal-600" />
            <StatCard title="Pending Storekeeper" value={pendingForStorekeeper.length} subtext="Incoming Queue" icon={Clock} colorClass="bg-orange-500" borderClass="border-orange-500" />
            <StatCard title="Total Inventory" value={totalItemsInBase} subtext="Total Units in Base" icon={Package} colorClass="bg-tnbBlue" borderClass="border-tnbBlue" /></>
        )}
        {(user.role === UserRole.STAFF) && (
          <><StatCard title="My Pending Requests" value={myPendingRequests.length} subtext="Awaiting Approval" icon={Clock} colorClass="bg-orange-500" borderClass="border-orange-500" />
            <StatCard title="Items Currently Held" value={itemsHeldCount} subtext="Total Units in possession" icon={Package} colorClass="bg-tnbBlue" borderClass="border-tnbBlue" /></>
        )}
      </div>

      {/* Base Manager Detailed Summary */}
      {user.role === UserRole.BASE_MANAGER && managerBaseStats && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-3">
               <BarChart3 className="w-6 h-6 text-tnbBlue" />
               <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b-2 border-tnbBlue pb-1">Base Equipment Status Breakdown</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="OK Equipment" 
                value={managerBaseStats.okCount.toLocaleString()} 
                subtext="Healthy assets in your base" 
                icon={ShieldCheck} 
                colorClass="bg-green-600" 
                borderClass="border-green-600" 
              />
              <StatCard 
                title="In Use" 
                value={managerBaseStats.inUseCount.toLocaleString()} 
                subtext="Out at project sites" 
                icon={UserCheck} 
                colorClass="bg-blue-500" 
                borderClass="border-blue-500" 
              />
              <StatCard 
                title="Faulty (Rosak)" 
                value={managerBaseStats.rosakCount.toLocaleString()} 
                subtext="Needs maintenance/repair" 
                icon={AlertTriangle} 
                colorClass="bg-red-500" 
                borderClass="border-red-500" 
              />
              <StatCard 
                title="Lost (Hilang)" 
                value={managerBaseStats.lostCount.toLocaleString()} 
                subtext="Missing reported items" 
                icon={Search} 
                colorClass="bg-orange-600" 
                borderClass="border-orange-600" 
              />
              <StatCard 
                title="Scrap (Skrap)" 
                value={managerBaseStats.skrapCount.toLocaleString()} 
                subtext="Decommissioned assets" 
                icon={Trash2} 
                colorClass="bg-gray-800" 
                borderClass="border-gray-800" 
              />
            </div>
        </div>
      )}

      {/* Admin Central Dashboard */}
      {user.role === UserRole.ADMIN && grandTotalStats && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* SYSTEM SUMMARY (Grand Totals) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Layers className="w-6 h-6 text-tnbBlue" />
               <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b-2 border-tnbBlue pb-1">System-wide Summary (All Bases)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              <StatCard 
                title="Grand Total Items" 
                value={grandTotalStats.totalItems.toLocaleString()} 
                subtext="Total units in system" 
                icon={Package} 
                colorClass="bg-tnbBlue" 
                borderClass="border-tnbBlue" 
              />
              <StatCard 
                title="Total OK Equipment" 
                value={grandTotalStats.okCount.toLocaleString()} 
                subtext="Healthy assets" 
                icon={ShieldCheck} 
                colorClass="bg-green-600" 
                borderClass="border-green-600" 
              />
              <StatCard 
                title="Total In Use" 
                value={grandTotalStats.inUseCount.toLocaleString()} 
                subtext="Currently with staff" 
                icon={UserCheck} 
                colorClass="bg-blue-500" 
                borderClass="border-blue-500" 
              />
              <StatCard 
                title="Total Faulty (Rosak)" 
                value={grandTotalStats.rosakCount.toLocaleString()} 
                subtext="Needs maintenance" 
                icon={AlertTriangle} 
                colorClass="bg-red-500" 
                borderClass="border-red-500" 
              />
              <StatCard 
                title="Total Lost (Hilang)" 
                value={grandTotalStats.lostCount.toLocaleString()} 
                subtext="Missing equipment" 
                icon={Search} 
                colorClass="bg-orange-600" 
                borderClass="border-orange-600" 
              />
              <StatCard 
                title="Total Scrap (Skrap)" 
                value={grandTotalStats.skrapCount.toLocaleString()} 
                subtext="Decommissioned" 
                icon={Trash2} 
                colorClass="bg-gray-800" 
                borderClass="border-gray-800" 
              />
            </div>
          </div>

          {/* BREAKDOWN BY BASE */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
               <BarChart3 className="w-6 h-6 text-tnbBlue" />
               <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b-2 border-tnbBlue pb-1">Breakdown By Base</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {adminBaseStats?.map((base) => (
                <div key={base.baseName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-1">
                  <div className="bg-tnbBlue px-5 py-3 flex justify-between items-center group-hover:bg-blue-900 transition-colors">
                    <h4 className="font-bold text-white tracking-wide truncate">{base.baseName}</h4>
                    <MapPin className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Total Units</p>
                        <p className="text-3xl font-black text-gray-800 tracking-tighter">{base.totalItems.toLocaleString()}</p>
                      </div>
                      <Package className="w-8 h-8 text-gray-100 mb-1" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-4 mt-2">
                      <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ShieldCheck className="w-3 h-3 text-green-600" />
                          <span className="text-[10px] font-bold text-green-700 uppercase">OK</span>
                        </div>
                        <p className="text-lg font-black text-green-800">{base.okCount}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-700 uppercase">In Use</span>
                        </div>
                        <p className="text-lg font-black text-blue-800">{base.inUseCount}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span className="text-[10px] font-bold text-red-700 uppercase">Rosak</span>
                        </div>
                        <p className="text-lg font-black text-red-800">{base.rosakCount}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Search className="w-3 h-3 text-orange-600" />
                          <span className="text-[10px] font-bold text-orange-700 uppercase">Lost</span>
                        </div>
                        <p className="text-lg font-black text-orange-800">{base.lostCount}</p>
                      </div>
                      <div className="bg-gray-800 p-2 rounded-lg border border-gray-900 col-span-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Trash2 className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Skrap</span>
                        </div>
                        <p className="text-lg font-black text-white">{base.skrapCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400">Inventory Health</span>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full ${base.rosakCount === 0 && base.lostCount === 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${base.totalItems > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Inventory Page ---
const InventoryPage = ({ baseFilter }: { baseFilter?: string }) => {
  const { user, inventory, createRequest, updateItem, importInventoryFromExcel, exportInventoryToExcel, clearInventory } = useApp();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [staffMode, setStaffMode] = useState<'borrow' | 'return'>('borrow');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  if (!user) return null;

  const visibleItems = useMemo(() => {
    let baseItems = user.role === UserRole.ADMIN
      ? (baseFilter ? inventory.filter((i: InventoryItem) => i.base === baseFilter) : inventory)
      : inventory.filter((i: InventoryItem) => i.base === user.base);

    if ((user.role === UserRole.STAFF || user.role === UserRole.BASE_MANAGER) && staffMode === 'return') {
      return baseItems.filter((i: InventoryItem) => i.personInCharge === user.name);
    }

    return baseItems;
  }, [inventory, user, baseFilter, staffMode]);

  const handleInitiateRequest = () => {
    if (selectedItems.length > 0) setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (location: string, date: string) => {
    const type = staffMode === 'borrow' ? RequestType.BORROW : RequestType.RETURN;
    await createRequest(selectedItems, type, location, date);
    setIsRequestModalOpen(false);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {staffMode === 'return' ? 'My Borrowed Items' : (baseFilter ? `Inventory: ${baseFilter}` : 'Inventory List')}
          </h2>
          <p className="text-sm text-gray-500">
            {staffMode === 'return' ? 'Items currently in your possession' : 'View and manage equipment status'}
          </p>
        </div>
        <div className="flex gap-3">
          {user.role === UserRole.ADMIN && (
            <>
              <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Data
              </button>
              <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer text-sm font-medium shadow-sm transition-colors hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" /> Upload Excel
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt: ProgressEvent<FileReader>) => {
                      const buffer = evt.target?.result as ArrayBuffer;
                      if (buffer) importInventoryFromExcel(buffer, baseFilter);
                    };
                    reader.readAsArrayBuffer(file);
                  }
                }} />
              </label>
              <button onClick={() => exportInventoryToExcel(visibleItems, baseFilter)} className="flex items-center px-4 py-2 bg-tnbBlue text-white rounded-lg text-sm font-medium shadow-sm transition-colors hover:bg-blue-900">
                <Download className="w-4 h-4 mr-2" /> Export Excel
              </button>
            </>
          )}
          {(user.role === UserRole.STAFF || user.role === UserRole.BASE_MANAGER) && (
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button onClick={() => { setStaffMode('borrow'); setSelectedItems([]); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${staffMode === 'borrow' ? 'bg-white shadow text-tnbBlue font-bold' : 'text-gray-500'}`}>Borrow</button>
              <button onClick={() => { setStaffMode('return'); setSelectedItems([]); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${staffMode === 'return' ? 'bg-white shadow text-green-600 font-bold' : 'text-gray-500'}`}>Return</button>
            </div>
          )}
        </div>
      </div>

      <InventoryTable 
        items={visibleItems} userRole={user.role} currentUserName={user.name}
        onSelectionChange={setSelectedItems} selectionMode={(user.role === UserRole.STAFF || user.role === UserRole.BASE_MANAGER) ? staffMode : 'none'}
        onUpdateItem={updateItem}
      />

      {(user.role === UserRole.STAFF || user.role === UserRole.BASE_MANAGER) && selectedItems.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button onClick={handleInitiateRequest} className={`${staffMode === 'borrow' ? 'bg-tnbBlue' : 'bg-green-600'} text-white px-8 py-4 rounded-full shadow-2xl flex items-center font-bold text-lg transition-transform hover:scale-105`}>
            {staffMode === 'borrow' ? <Package className="w-6 h-6 mr-3" /> : <ArrowRightLeft className="w-6 h-6 mr-3" />}
            {staffMode === 'borrow' ? 'Request to Borrow' : 'Request to Return'} ({selectedItems.length})
          </button>
        </div>
      )}

      <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onSubmit={handleSubmitRequest} itemCount={selectedItems.length} mode={staffMode} />
      {user.role === UserRole.ADMIN && (
        <div className={isDeleteModalOpen ? "fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" : "hidden"}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-sm overflow-hidden p-6 text-center">
             <Trash2 className="h-12 w-12 text-red-600 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Inventory Data?</h3>
             <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button onClick={async () => { await clearInventory(baseFilter); setIsDeleteModalOpen(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete Data</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- History Page ---
const HistoryPage = () => {
  const { user, users, requests, processRequest, inventory } = useApp();
  const [viewItemsRequest, setViewItemsRequest] = useState<MovementRequest | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<MovementRequest | null>(null);
  const [reportReason, setReportReason] = useState('');

  if (!user) return null;

  const pendingRequests = requests.filter(r => r.base === user.base && (
    (user.role === UserRole.STOREKEEPER && r.status === RequestStatus.PENDING) ||
    (user.role === UserRole.BASE_MANAGER && r.status === RequestStatus.PENDING_MANAGER)
  ));

  const historyRequests = requests.filter(r => {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.STAFF) return r.staffId === user.id;
    return r.base === user.base;
  });

  const handleApprove = (req: MovementRequest) => {
    // If it's a damage/scrap/lost request, we need a reason
    if ([RequestType.ROSAK, RequestType.SCRAP, RequestType.LOST].includes(req.type)) {
      setApprovingRequest(req);
      setReportReason(req.reportReason || ''); // Start with whatever is there
    } else {
      executeProcessRequest(req, true);
    }
  };

  const executeProcessRequest = async (req: MovementRequest, approved: boolean, reason?: string) => {
    await processRequest(req.id, approved, reason);
    if (approved) {
      const storekeeperName = user.role === UserRole.STOREKEEPER ? user.name : (users.find(u => u.id === req.storekeeperId)?.name || 'Authorized Storekeeper');
      const managerName = user.role === UserRole.BASE_MANAGER ? user.name : (users.find(u => u.id === req.managerId)?.name || '');
      
      // Auto generate PDF after final approval or certain types of verifications
      if ((user.role === UserRole.BASE_MANAGER && (req.type === RequestType.BORROW || req.type === RequestType.ROSAK || req.type === RequestType.SCRAP || req.type === RequestType.LOST)) || (user.role === UserRole.STOREKEEPER && req.type === RequestType.RETURN)) {
        // Refetch or use latest data
        const updatedReq = { ...req, status: approved ? (user.role === UserRole.STOREKEEPER ? RequestStatus.PENDING_MANAGER : RequestStatus.APPROVED) : RequestStatus.REJECTED, reportReason: reason || req.reportReason };
        generateQF21(updatedReq as MovementRequest, inventory, storekeeperName, managerName);
      }
    }
    setApprovingRequest(null);
    setReportReason('');
  };

  return (
    <div className="space-y-8">
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-orange-500 px-6 py-4 text-white font-bold flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Pending Action Required
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-widest">{pendingRequests.length} REQUESTS</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-orange-50/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      req.type === RequestType.BORROW ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                      req.type === RequestType.ROSAK ? 'bg-red-100 text-red-800 border-red-200' :
                      req.type === RequestType.SCRAP ? 'bg-gray-800 text-white' :
                      req.type === RequestType.LOST ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800 border-green-200'
                    }`}>{req.type}</span>
                    <p className="font-black text-gray-900 text-lg">{req.staffName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                       <Package className="w-4 h-4 mr-1 text-gray-400" /> {req.items.length} items {req.targetLocation ? `to ${req.targetLocation}` : ''}
                    </p>
                    <button 
                      onClick={() => setViewItemsRequest(req)}
                      className="text-xs font-black text-tnbBlue hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                    >
                      <Eye className="w-3 h-3" /> SEE ITEMS
                    </button>
                  </div>
                  {req.reportReason && (
                    <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded border border-yellow-100 mt-2 max-w-md">
                       <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                       <p className="text-xs text-yellow-800 italic">Report Reason: {req.reportReason}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{new Date(req.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => executeProcessRequest(req, false)} className="flex-1 md:flex-none px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-black text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">Reject</button>
                  <button onClick={() => handleApprove(req)} className="flex-1 md:flex-none px-8 py-2.5 bg-tnbBlue text-white rounded-lg text-sm font-black shadow-lg shadow-blue-900/10 hover:bg-blue-900 transition-all transform hover:-translate-y-0.5 active:scale-95">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve Reason Modal */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-tnbBlue p-6 flex justify-between items-center text-white">
                <h3 className="font-black text-xl uppercase tracking-tight">Report Details</h3>
                <button onClick={() => setApprovingRequest(null)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Type: {approvingRequest.type}</p>
                  <p className="text-sm text-blue-900 mt-1">Please provide a detailed reason/description for this {approvingRequest.type} report for KPI documentation.</p>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description / Reason Why {approvingRequest.type}</label>
                   <textarea 
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-tnbBlue outline-none transition-all"
                      placeholder={`Explain why these items are marked as ${approvingRequest.type}...`}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                   />
                </div>
             </div>
             <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                <button onClick={() => setApprovingRequest(null)} className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
                <button 
                   onClick={() => executeProcessRequest(approvingRequest, true, reportReason)} 
                   disabled={!reportReason.trim()}
                   className="px-8 py-2.5 bg-tnbBlue text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-900 transition-all disabled:opacity-50"
                >
                   Save & Approve
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Item Viewer Modal */}
      {viewItemsRequest && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-tnbBlue p-6 flex justify-between items-center text-white">
                <div>
                   <h3 className="font-black text-xl tracking-tight uppercase">Request Details</h3>
                   <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-1">Requested by: {viewItemsRequest.staffName}</p>
                </div>
                <button onClick={() => setViewItemsRequest(null)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             <div className="p-0 max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-100">
                   <thead className="bg-gray-50 sticky top-0">
                      <tr>
                         <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Bil.</th>
                         <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Description</th>
                         <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {viewItemsRequest.items.map((item, idx) => (
                        <tr key={item.itemId} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 text-sm font-black text-gray-900">{idx + 1}</td>
                           <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.description}</td>
                           <td className="px-6 py-4 text-sm font-mono text-tnbBlue bg-blue-50/50">{item.serialNo}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button onClick={() => setViewItemsRequest(null)} className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-sm font-black text-gray-700 hover:bg-gray-100 transition-all shadow-sm">Close Window</button>
             </div>
          </div>
        </div>
      )}

      {/* ADMIN TEMPLATE SECTION */}
      {user.role === UserRole.ADMIN && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
             <FileText className="w-5 h-5 text-tnbBlue" />
             <h3 className="font-bold text-gray-800 tracking-wide">Blank Form Templates</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { id: 'QF.100', type: RequestType.BORROW, label: 'Equipment Movement' },
               { id: 'QF.101', type: RequestType.ROSAK, label: 'Damage Report' },
               { id: 'QF.102', type: RequestType.SCRAP, label: 'Scrap Report' },
               { id: 'QF.103', type: RequestType.LOST, label: 'Lost Report' }
             ].map((tpl) => (
               <button 
                  key={tpl.id}
                  onClick={() => generateEmptyQF(tpl.type)}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 group transition-all"
               >
                  <Download className="w-6 h-6 text-gray-400 group-hover:text-tnbBlue mb-2" />
                  <span className="text-xs font-black text-tnbBlue">{tpl.id}</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1">{tpl.label}</span>
               </button>
             ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b bg-gray-50 font-bold flex justify-between items-center">
          <span>Request Logs / Transaction History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason/Notes</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {historyRequests.map(req => {
                const config = getFormConfig(req.type);
                return (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.staffName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.type === RequestType.BORROW ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {req.reportReason || req.rejectionReason || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center text-xs font-semibold ${
                        req.status === RequestStatus.APPROVED ? 'text-green-600' : 
                        req.status === RequestStatus.REJECTED ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {req.status === RequestStatus.APPROVED && <Check className="w-3 h-3 mr-1" />}
                        {req.status === RequestStatus.REJECTED && <X className="w-3 h-3 mr-1" />}
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === RequestStatus.APPROVED && (
                        <button onClick={() => {
                          const storekeeperUser = users.find(u => u.id === req.storekeeperId);
                          const storeName = storekeeperUser ? storekeeperUser.name : 'Authorized Storekeeper';
                          
                          const managerUser = users.find(u => u.id === req.managerId);
                          const managerName = managerUser ? managerUser.name : 'Authorized Manager';
                          
                          generateQF21(req, inventory, storeName, managerName);
                        }} className="text-tnbBlue hover:text-blue-900 flex items-center justify-end text-xs font-bold">
                          <Download className="w-3 h-3 mr-1" /> {config.id}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {historyRequests.length === 0 && (
            <div className="p-10 text-center text-gray-400">No requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- User Management Page ---
const UserManagementPage = () => {
  const { users, addUser } = useApp();
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.STAFF, base: SYSTEM_BASES[0] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.username && newUser.email && newUser.password) {
      await addUser({ ...newUser, id: `u-${Date.now()}` } as User);
      setNewUser({ role: UserRole.STAFF, base: SYSTEM_BASES[0], name: '', username: '', email: '', password: '' });
      alert('User created successfully');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-tnbBlue" /> Add New User
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input required placeholder="Full Name" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username (Login)</label>
            <input required placeholder="Username" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none" value={newUser.username || ''} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input required type="email" placeholder="Email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none" value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input required type="password" placeholder="Password" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Base</label>
            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tnbBlue outline-none bg-white" value={newUser.base} onChange={e => setNewUser({...newUser, base: e.target.value})}>
              {SYSTEM_BASES.map(b => <option key={b} value={b}>{b}</option>)}
              <option value="HQ">HQ</option>
            </select>
          </div>
          <button className="md:col-span-2 bg-tnbBlue text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-900 transition-colors mt-2">Create User Account</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b font-bold flex items-center">
          <Users className="w-5 h-5 mr-2 text-gray-500" /> System Users
        </div>
        <table className="min-w-full divide-y">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Base</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Username</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                    u.role === UserRole.BASE_MANAGER ? 'bg-teal-100 text-teal-800' :
                    u.role === UserRole.STOREKEEPER ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.base}</td>
                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{u.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- App Root ---
const AppContent = () => {
  const { user, loading } = useApp();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    if (user) setActivePage('dashboard');
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       <div className="w-16 h-16 border-4 border-tnbBlue border-t-tnbRed rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <LoginScreen />;

  const isInventoryPage = activePage.startsWith('inventory');
  const inventoryBaseFilter = isInventoryPage && activePage.includes(':') ? activePage.split(':')[1] : undefined;

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'dashboard' && <Dashboard />}
      {isInventoryPage && <InventoryPage baseFilter={inventoryBaseFilter} />}
      {activePage === 'history' && <HistoryPage />}
      {activePage === 'users' && <UserManagementPage />}
    </Layout>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;