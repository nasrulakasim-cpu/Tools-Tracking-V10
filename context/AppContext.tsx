
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { InventoryItem, MovementRequest, User, RequestStatus, RequestType, RequestItem, UserRole } from '../types';
import { INITIAL_INVENTORY, MOCK_USERS } from '../constants';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (newUser: User) => Promise<void>;
  inventory: InventoryItem[];
  importInventoryFromExcel: (fileBuffer: ArrayBuffer, targetBase?: string) => void;
  exportInventoryToExcel: (items: InventoryItem[], baseName?: string) => void;
  clearInventory: (targetBase?: string) => Promise<void>;
  requests: MovementRequest[];
  createRequest: (itemIds: string[], type: RequestType, location?: string, date?: string) => Promise<void>;
  processRequest: (requestId: string, approved: boolean, reason?: string) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<MovementRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const { data: userData } = await supabase.from('users').select('*');
        setUsers((userData as User[]) || MOCK_USERS);

        // Fetch Inventory (Fixing the 1000 item limit)
        let allInventory: InventoryItem[] = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .range(from, from + step - 1);

          if (error) throw error;
          if (data && data.length > 0) {
            allInventory = [...allInventory, ...(data as InventoryItem[])];
            if (data.length < step) {
              hasMore = false;
            } else {
              from += step;
            }
          } else {
            hasMore = false;
          }
        }
        setInventory(allInventory.length > 0 ? allInventory : INITIAL_INVENTORY);

        // Fetch Requests
        const { data: reqData } = await supabase.from('requests').select('*').order('timestamp', { ascending: false });
        setRequests((reqData as MovementRequest[]) || []);
      } catch (error) {
        console.error("Supabase Error:", error);
        setUsers(MOCK_USERS);
        setInventory(INITIAL_INVENTORY);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find((u: User) => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addUser = async (newUser: User) => {
    setUsers((prev: User[]) => [...prev, newUser]);
    await supabase.from('users').insert(newUser);
  };

  const importInventoryFromExcel = async (fileBuffer: ArrayBuffer, targetBase?: string) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' }) as string[][];

      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(jsonData.length, 25); i++) {
        const row = jsonData[i].map((cell: string) => String(cell).toLowerCase());
        if (row.some(c => c.includes('description')) && row.some(c => c.includes('serial'))) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        alert('Could not find header row.');
        return;
      }

      const headers = jsonData[headerRowIndex].map((h: string) => String(h).trim().toLowerCase());
      const findColIndex = (keywords: string[]) => 
        headers.findIndex((h: string) => keywords.some(k => h.includes(k)));

      const map = {
        no: findColIndex(['no.', 'no', 'bil']),
        desc: findColIndex(['description']),
        itemLoc: findColIndex(['item location']),
        pic: findColIndex(['person in charge']),
        dateOut: findColIndex(['date out', 'moved']),
        maker: findColIndex(['maker', 'brand']),
        range: findColIndex(['range', 'capacity']),
        model: findColIndex(['type', 'model']),
        serial: findColIndex(['serial', 's/n']),
        price: findColIndex(['unit price']),
        purDate: findColIndex(['purchase date']),
        poNo: findColIndex(['p.o.', 'po no']),
        qty: findColIndex(['quantity', 'qty']),
        asset: findColIndex(['asset no']),
        storeLoc: findColIndex(['store location']),
        eqpStatus: findColIndex(['equipment status']),
        docStatus: findColIndex(['document status']),
        qfDate: findColIndex(['date of qf']),
        hsem: findColIndex(['hsem category']),
        remarks: findColIndex(['remarks', 'remark']),
        physical: findColIndex(['physical status'])
      };

      const newItems: InventoryItem[] = [];

      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0 || (map.desc > -1 && !row[map.desc])) continue;

        const getVal = (index: number) => (index > -1 && row[index] !== undefined ? String(row[index]).trim() : '-');

        const newItem: InventoryItem = {
          id: `IMP-${Date.now()}-${i}`,
          no: getVal(map.no) !== '-' ? getVal(map.no) : String(i - headerRowIndex),
          description: getVal(map.desc),
          currentLocation: getVal(map.itemLoc) !== '-' ? getVal(map.itemLoc) : getVal(map.storeLoc),
          personInCharge: getVal(map.pic) !== '-' ? getVal(map.pic) : null,
          lastMovementDate: getVal(map.dateOut) !== '-' ? getVal(map.dateOut) : null,
          maker: getVal(map.maker),
          range: getVal(map.range),
          typeModel: getVal(map.model),
          serialNo: getVal(map.serial),
          unitPrice: getVal(map.price),
          date: getVal(map.purDate),
          poNo: getVal(map.poNo),
          quantity: parseInt(getVal(map.qty)) || 1,
          assetNo: getVal(map.asset),
          location: getVal(map.storeLoc),
          equipmentStatus: getVal(map.eqpStatus),
          documentStatus: getVal(map.docStatus),
          dateOfQfRecorded: getVal(map.qfDate),
          hsemCategory: getVal(map.hsem),
          physicalStatus: getVal(map.physical),
          remarks: getVal(map.remarks),
          base: targetBase || user?.base || 'HQ' 
        };
        newItems.push(newItem);
      }

      setInventory((prev: InventoryItem[]) => [...prev, ...newItems]);
      await supabase.from('inventory').insert(newItems);
    } catch (error) {
      console.error(error);
      alert("Import failed.");
    }
  };

  const clearInventory = async (targetBase?: string) => {
    setInventory((prev: InventoryItem[]) => targetBase ? prev.filter((i: InventoryItem) => i.base !== targetBase) : []);
    let query = supabase.from('inventory').delete();
    if (targetBase) query = query.eq('base', targetBase);
    else query = query.neq('id', 'placeholder');
    await query;
  };

  const exportInventoryToExcel = (items: InventoryItem[], baseName?: string) => {
    const dataToExport = items.map((item: InventoryItem, idx: number) => ({
      'No.': item.no || idx + 1,
      'Description': item.description,
      'ITEM LOCATION': item.currentLocation,
      'PERSON IN CHARGE': item.personInCharge || '',
      'DATE OUT/MOVED': item.lastMovementDate || '',
      'Maker / Brand': item.maker,
      'Range / Capacity': item.range,
      'Type / Model': item.typeModel,
      'Serial No.': item.serialNo,
      'Unit Price': item.unitPrice,
      'PURCHASE DATE': item.date,
      'P.O. No.': item.poNo,
      'Quantity': item.quantity,
      'Asset No.': item.assetNo,
      'STORE LOCATION': item.location,
      'EQUIPMENT STATUS': item.equipmentStatus,
      'DOCUMENT STATUS': item.documentStatus,
      'DATE OF QF RECORDED': item.dateOfQfRecorded,
      'HSEM Category': item.hsemCategory,
      'Remarks': item.remarks
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `Inventory_${baseName || 'Master'}.xlsx`);
  };

  const createRequest = async (itemIds: string[], type: RequestType, location?: string, date?: string) => {
    if (!user) return;
    const requestItems: RequestItem[] = itemIds.map((id: string) => {
      const item = inventory.find((i: InventoryItem) => i.id === id);
      return { itemId: id, description: item?.description || 'Unknown', serialNo: item?.serialNo || 'Unknown' };
    });

    const newRequest: MovementRequest = {
      id: `REQ-${Date.now()}`,
      type,
      staffId: user.id,
      staffName: user.name,
      base: user.base,
      items: requestItems,
      status: RequestStatus.PENDING,
      timestamp: new Date().toISOString(),
      targetLocation: location,
      targetDate: date
    };

    setRequests((prev: MovementRequest[]) => [newRequest, ...prev]);
    await supabase.from('requests').insert(newRequest);
  };

  const processRequest = async (requestId: string, approved: boolean, reason?: string) => {
    if (!user) return;
    const targetRequest = requests.find((r: MovementRequest) => r.id === requestId);
    if (!targetRequest) return;

    let newStatus = RequestStatus.REJECTED;
    let processorUpdates: Partial<MovementRequest> = {};

    if (approved) {
      if (user.role === UserRole.STOREKEEPER) {
        const needsManagerApproval = [RequestType.BORROW, RequestType.ROSAK, RequestType.SCRAP, RequestType.LOST].includes(targetRequest.type);
        newStatus = needsManagerApproval ? RequestStatus.PENDING_MANAGER : RequestStatus.APPROVED;
        processorUpdates.storekeeperId = user.id;
        if (reason) processorUpdates.reportReason = reason;
      } else {
        newStatus = RequestStatus.APPROVED;
        processorUpdates.managerId = user.id;
        if (reason) processorUpdates.reportReason = reason;
      }
    } else {
      if (reason) processorUpdates.rejectionReason = reason;
    }

    setRequests((prev: MovementRequest[]) => prev.map((req: MovementRequest) => req.id === requestId ? { ...req, status: newStatus, ...processorUpdates } : req));
    await supabase.from('requests').update({ status: newStatus, ...processorUpdates }).eq('id', requestId);

    if (newStatus === RequestStatus.APPROVED) {
      const itemIds = targetRequest.items.map((i: RequestItem) => i.itemId);
      const updates: Partial<InventoryItem> = {};

      if (targetRequest.type === RequestType.BORROW) {
        updates.currentLocation = targetRequest.targetLocation;
        updates.personInCharge = targetRequest.staffName;
        updates.lastMovementDate = targetRequest.targetDate;
      } else if (targetRequest.type === RequestType.RETURN) {
        updates.currentLocation = targetRequest.targetLocation || 'In Store';
        updates.personInCharge = null;
        updates.lastMovementDate = targetRequest.targetDate;
        updates.equipmentStatus = 'OK';
      } else if (targetRequest.type === RequestType.ROSAK) {
        updates.equipmentStatus = 'ROSAK';
      } else if (targetRequest.type === RequestType.SCRAP) {
        updates.equipmentStatus = 'SKRAP';
      } else if (targetRequest.type === RequestType.LOST) {
        updates.equipmentStatus = 'HILANG';
      }

      setInventory((prev: InventoryItem[]) => prev.map((i: InventoryItem) => itemIds.includes(i.id) ? { ...i, ...updates } as InventoryItem : i));
      await Promise.all(itemIds.map((id: string) => supabase.from('inventory').update(updates).eq('id', id)));
    }
  };

  const updateItem = async (item: InventoryItem) => {
    setInventory((prev: InventoryItem[]) => prev.map((i: InventoryItem) => i.id === item.id ? item : i));
    await supabase.from('inventory').update(item).eq('id', item.id);
  };

  return (
    <AppContext.Provider value={{ user, users, login, logout, addUser, inventory, importInventoryFromExcel, exportInventoryToExcel, clearInventory, requests, createRequest, processRequest, updateItem, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
