
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InventoryItem, UserRole, RequestType } from '../types';
import { Edit2, X, Check, ChevronDown, ListFilter, CheckSquare, Square, FilterX } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ColumnConfig {
  key: keyof InventoryItem;
  label: string;
  width: string;
  align?: 'center' | 'left' | 'right';
}

interface FilterHeaderProps {
  colKey: keyof InventoryItem;
  label: string;
  width: string;
  align?: 'center' | 'left' | 'right';
  items: InventoryItem[];
  activeFilter: string[] | undefined;
  onApply: (selected: string[]) => void;
  isOpen: boolean;
  setOpenCol: (col: string | null) => void;
}

interface InventoryTableProps {
  items: InventoryItem[];
  userRole: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectionMode?: 'borrow' | 'return' | 'none';
  onUpdateItem?: (item: InventoryItem) => void;
}

const getValue = (item: InventoryItem, key: keyof InventoryItem): string => {
  const val = item[key];
  return val !== undefined && val !== null ? String(val) : '';
};

const COLUMNS: ColumnConfig[] = [
  { key: 'no', label: 'NO.', width: 'w-16' },
  { key: 'description', label: 'DESCRIPTION', width: 'min-w-[200px]' },
  { key: 'currentLocation', label: 'ITEM LOCATION', width: 'min-w-[150px]' },
  { key: 'personInCharge', label: 'PERSON IN CHARGE', width: 'min-w-[150px]' },
  { key: 'lastMovementDate', label: 'DATE OUT/MOVED', width: 'min-w-[120px]' },
  { key: 'maker', label: 'MAKER / BRAND', width: 'w-32' },
  { key: 'range', label: 'RANGE / CAPACITY', width: 'w-32' },
  { key: 'typeModel', label: 'TYPE / MODEL', width: 'min-w-[120px]' },
  { key: 'serialNo', label: 'SERIAL NO.', width: 'min-w-[120px]' },
  { key: 'unitPrice', label: 'UNIT PRICE', width: 'min-w-[100px]' },
  { key: 'date', label: 'PURCHASE DATE', width: 'min-w-[100px]' },
  { key: 'poNo', label: 'P.O. NO.', width: 'min-w-[120px]' },
  { key: 'quantity', label: 'QUANTITY', width: 'w-24', align: 'center' },
  { key: 'assetNo', label: 'ASSET NO.', width: 'min-w-[120px]' },
  { key: 'location', label: 'STORE LOCATION', width: 'min-w-[150px]' },
  { key: 'equipmentStatus', label: 'EQUIPMENT STATUS', width: 'min-w-[150px]' },
  { key: 'documentStatus', label: 'DOCUMENT STATUS', width: 'min-w-[150px]' },
  { key: 'dateOfQfRecorded', label: 'DATE OF QF RECORDED', width: 'min-w-[150px]' },
  { key: 'hsemCategory', label: 'HSEM CATEGORY', width: 'min-w-[120px]' },
  { key: 'remarks', label: 'REMARKS', width: 'min-w-[150px]' },
];

const FilterHeader: React.FC<FilterHeaderProps> = ({ 
  colKey, label, width, align, items, activeFilter, onApply, isOpen, setOpenCol 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set<string>());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const uniqueOptions = useMemo(() => {
    const opts = new Set<string>(items.map((i: InventoryItem) => getValue(i, colKey)));
    return Array.from(opts).sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [items, colKey]);

  const visibleOptions = useMemo(() => 
    uniqueOptions.filter((opt: string) => opt.toLowerCase().includes(searchTerm.toLowerCase())), 
    [uniqueOptions, searchTerm]
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTempSelected(activeFilter && activeFilter.length > 0 ? new Set<string>(activeFilter) : new Set<string>(uniqueOptions));
    }
  }, [isOpen, uniqueOptions, activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpenCol(null);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpenCol]);

  const toggleOption = (opt: string) => {
    const newSet = new Set<string>(tempSelected);
    if (newSet.has(opt)) newSet.delete(opt); else newSet.add(opt);
    setTempSelected(newSet);
  };

  const handleApply = () => {
    onApply(tempSelected.size === uniqueOptions.length ? [] : Array.from(tempSelected));
    setOpenCol(null);
  };

  const isFiltered = activeFilter && activeFilter.length > 0;
  const isLeftAligned = colKey === 'no' || colKey === 'description';

  return (
    <th className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300 ${width} relative group select-none border-r border-white/10 last:border-0`}>
      <div className={`flex items-center justify-between cursor-pointer hover:text-white ${isFiltered ? 'text-blue-400' : ''}`}
           onClick={() => setOpenCol(isOpen ? null : colKey)}>
        <span className={align === 'center' ? 'mx-auto' : ''}>{label}</span>
        <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div ref={dropdownRef} className={`absolute top-full mt-1 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 text-gray-800 font-normal normal-case ${isLeftAligned ? 'left-0' : 'right-0'}`}>
          <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <input 
              type="text" placeholder="Search..." 
              className="w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-tnbBlue/20 focus:border-tnbBlue shadow-sm transition-all"
              value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-4 mt-2 px-1">
              <button 
                type="button"
                onClick={() => setTempSelected(new Set(uniqueOptions))}
                className="text-[10px] font-black text-tnbBlue uppercase hover:underline"
              >
                Select All
              </button>
              <button 
                type="button"
                onClick={() => setTempSelected(new Set())}
                className="text-[10px] font-black text-tnbRed uppercase hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
            {visibleOptions.map((opt: string) => (
              <label key={opt} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-50 rounded cursor-pointer text-sm group transition-colors">
                <input 
                  type="checkbox" 
                  checked={tempSelected.has(opt)} 
                  onChange={() => toggleOption(opt)} 
                  className="rounded text-tnbBlue border-gray-300 focus:ring-tnbBlue"
                />
                <span className="truncate group-hover:text-tnbBlue">{opt || '(Blanks)'}</span>
              </label>
            ))}
            {visibleOptions.length === 0 && <p className="text-center py-4 text-xs text-gray-400">No matching items</p>}
          </div>
          <div className="p-2 border-t flex justify-between bg-gray-50 rounded-b-lg">
             <button onClick={() => onApply([])} className="text-xs text-gray-500 hover:text-tnbRed font-bold px-3 py-1.5 hover:bg-white rounded transition-colors">Reset Filter</button>
             <button onClick={handleApply} className="text-xs bg-tnbBlue text-white font-bold px-5 py-1.5 rounded-md shadow-sm hover:bg-blue-900 transition-all">Apply</button>
          </div>
        </div>
      )}
    </th>
  );
};

// Fix: Redefining without React.FC can sometimes help with strict property inference on line 189
export const InventoryTable = ({ 
  items, userRole, currentUserName, onSelectionChange, selectionMode = 'none', onUpdateItem
}: InventoryTableProps) => {
  const { createRequest } = useApp();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set<string>());
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setSelectedIds(new Set<string>());
    onSelectionChange?.([]);
    // Fix: Explicitly ensuring items is treated as an array in the dependency list to avoid unknown property errors
  }, [selectionMode, onSelectionChange, (items as any[]).length]); // Reset selection if mode or item count changes

  const filteredItems = useMemo(() => {
    return items.filter((item: InventoryItem) => 
      Object.entries(activeFilters).every(([key, selectedValues]) => {
        const values = selectedValues as string[];
        return !values.length || values.includes(getValue(item, key as keyof InventoryItem));
      })
    ).sort((a: InventoryItem, b: InventoryItem) => String(a.no).localeCompare(String(b.no), undefined, { numeric: true }));
  }, [items, activeFilters]);

  // Fix: Adding explicit type for f in some to prevent 'unknown' property access errors
  const hasActiveFilters = Object.values(activeFilters).some((f: string[]) => f.length > 0);

  const clearAllFilters = () => {
    setActiveFilters({});
    setOpenFilterCol(null);
  };

  // Check if an item is available for selection
  const checkIsDisabled = (item: InventoryItem) => {
    const status = (item.equipmentStatus || '').toUpperCase().trim();
    const isBorrowed = item.personInCharge !== null && item.personInCharge !== '' && item.personInCharge !== '-';
    const isUnavailable = ['ROSAK', 'SKRAP', 'HILANG', 'LOST'].includes(status);
    
    // Borrow mode: restricted to available items
    if (selectionMode === 'borrow') {
      return isBorrowed || isUnavailable;
    }
    // Return mode: restricted to items PIC'd by current user
    if (selectionMode === 'return') {
      return item.personInCharge !== currentUserName;
    }
    // All other roles/modes: allow selecting everything
    return false;
  };

  const selectableItems = useMemo(() => 
    filteredItems.filter(item => !checkIsDisabled(item)),
    [filteredItems, selectionMode, currentUserName]
  );

  const isAllSelected = selectableItems.length > 0 && selectableItems.every(item => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    const next = new Set<string>(selectedIds);
    if (isAllSelected) {
      selectableItems.forEach(item => next.delete(item.id));
    } else {
      selectableItems.forEach(item => next.add(item.id));
    }
    setSelectedIds(next);
    onSelectionChange?.(Array.from(next));
  };

  const getEquipmentStatusBadge = (status: string) => {
    const s = status.toUpperCase().trim();
    if (s === 'OK') return 'bg-green-100 text-green-700 border-green-200 ring-1 ring-green-600/20';
    if (s === 'ROSAK') return 'bg-red-100 text-red-700 border-red-200 ring-1 ring-green-600/20';
    if (s === 'DIBAIKI') return 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-1 ring-yellow-600/20';
    if (s === 'SKRAP') return 'bg-red-900 text-white border-red-950 ring-1 ring-black/20';
    if (s === 'HILANG' || s === 'LOST') return 'bg-orange-100 text-orange-700 border-orange-200 ring-1 ring-orange-600/20';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleEditClick = (item: InventoryItem) => setEditingItem({ ...item });

  const handleSaveEdit = async () => {
    if (editingItem && onUpdateItem) {
      const originalItem = items.find(i => i.id === editingItem.id);
      const newStatus = (editingItem.equipmentStatus || '').toUpperCase().trim();
      const oldStatus = (originalItem?.equipmentStatus || '').toUpperCase().trim();

      const qfTypeMap: Record<string, RequestType> = {
        'ROSAK': RequestType.ROSAK,
        'SKRAP': RequestType.SCRAP,
        'HILANG': RequestType.LOST,
        'LOST': RequestType.LOST
      };

      if (newStatus !== oldStatus && qfTypeMap[newStatus]) {
        await createRequest(
          [editingItem.id], 
          qfTypeMap[newStatus], 
          editingItem.location, 
          new Date().toISOString().split('T')[0]
        );
        alert(`Status change to ${newStatus} requires Manager approval. Request notified.`);
        setEditingItem(null);
      } else {
        onUpdateItem(editingItem);
        setEditingItem(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Table Information Bar */}
      <div className="bg-gray-50 px-4 py-2 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border px-3 py-1 rounded-full shadow-sm">
             <ListFilter className="w-3.5 h-3.5 text-tnbBlue" />
             <span className="text-xs font-bold text-gray-600">Showing <span className="text-tnbBlue">{filteredItems.length}</span> of {items.length} items</span>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1 rounded-full text-tnbRed hover:bg-red-100 transition-colors shadow-sm animate-in fade-in"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span className="text-xs font-black">Clear All Filters</span>
            </button>
          )}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full animate-in zoom-in-95">
              <Check className="w-3.5 h-3.5 text-tnbBlue" />
              <span className="text-xs font-black text-tnbBlue">{selectedIds.size} items selected</span>
            </div>
          )}
        </div>
        
        {/* Enabled Select All for all roles */}
        <button 
          onClick={toggleSelectAll}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black transition-all transform active:scale-95 ${
            isAllSelected 
              ? 'bg-tnbRed text-white shadow-md' 
              : 'bg-white border border-gray-300 text-gray-700 hover:border-tnbBlue hover:text-tnbBlue shadow-sm'
          }`}
        >
          {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {isAllSelected ? 'Deselect Visible' : `Select All Visible (${selectableItems.length})`}
        </button>
      </div>

      <div className="overflow-x-auto flex-1 pb-32">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-tnbBlue text-white sticky top-0 z-30">
            <tr>
              {/* Checkbox column now always visible */}
              <th className="px-3 py-3 text-left w-10 sticky left-0 bg-tnbBlue z-40 border-r border-white/20">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded w-4 h-4 text-tnbRed border-white/20 focus:ring-0 cursor-pointer"
                  />
                </div>
              </th>
              {COLUMNS.map((col: ColumnConfig) => (
                <FilterHeader key={col.key} colKey={col.key} label={col.label} width={col.width} align={col.align} items={items} activeFilter={activeFilters[col.key]} onApply={(s: string[]) => setActiveFilters({ ...activeFilters, [col.key]: s })} isOpen={openFilterCol === col.key} setOpenCol={setOpenFilterCol} />
              ))}
              {userRole === UserRole.STOREKEEPER && <th className="px-4 py-3 text-right sticky right-0 bg-tnbBlue z-30 w-16">Edit</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredItems.map((item: InventoryItem, idx: number) => {
              const status = (item.equipmentStatus || '').toUpperCase().trim();
              const isSelectionDisabled = checkIsDisabled(item);
              const isSkrap = status.includes('SKRAP');
              
              const rowBgClass = isSkrap 
                ? 'bg-red-50' 
                : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50');
                
              const hoverClass = isSkrap ? 'hover:bg-red-100' : 'hover:bg-blue-50/50';

              return (
                <tr key={item.id} className={`${rowBgClass} ${hoverClass} transition-colors ${isSelectionDisabled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  {/* Selection Checkbox always visible */}
                  <td className={`px-3 py-3 sticky left-0 z-20 ${rowBgClass} shadow-sm border-r border-gray-100`}>
                    <input 
                      type="checkbox" 
                      disabled={isSelectionDisabled}
                      checked={selectedIds.has(item.id)} 
                      onChange={() => {
                        const next = new Set<string>(selectedIds);
                        if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                        setSelectedIds(next);
                        onSelectionChange?.(Array.from(next));
                      }} 
                      className={`rounded w-4 h-4 ${isSelectionDisabled ? 'cursor-not-allowed border-gray-200 text-gray-200' : 'text-tnbBlue cursor-pointer'}`} 
                    />
                  </td>
                  {COLUMNS.map((col: ColumnConfig) => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap`}>
                      {col.key === 'equipmentStatus' ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${getEquipmentStatusBadge(item.equipmentStatus)}`}>
                          {item.equipmentStatus || '-'}
                        </span>
                      ) : (
                        getValue(item, col.key) || '-'
                      )}
                    </td>
                  ))}
                  {userRole === UserRole.STOREKEEPER && (
                    <td className={`px-4 py-3 sticky right-0 ${rowBgClass} z-20 text-right`}>
                      <button onClick={() => handleEditClick(item)} className="text-gray-400 hover:text-tnbBlue transition-colors p-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
             <ListFilter className="w-12 h-12 mb-4 opacity-20" />
             <p className="font-bold">No matching equipment found</p>
             <button onClick={clearAllFilters} className="text-tnbBlue text-sm mt-2 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-tnbBlue px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold uppercase tracking-widest flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-blue-300" /> Edit Record
              </h3>
              <button onClick={() => setEditingItem(null)} className="hover:bg-white/10 p-1 rounded transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
              {COLUMNS.map((col: ColumnConfig) => (
                <div key={col.key} className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">{col.label}</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tnbBlue focus:border-tnbBlue transition-all shadow-sm" 
                    value={getValue(editingItem, col.key)} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem({ ...editingItem, [col.key]: e.target.value })} 
                  />
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button onClick={() => setEditingItem(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-7 py-2 bg-tnbBlue text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-900 transition-all">Update Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
