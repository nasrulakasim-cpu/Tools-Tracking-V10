
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STOREKEEPER = 'STOREKEEPER',
  BASE_MANAGER = 'BASE_MANAGER',
}

export enum ItemStatus {
  WORKING = 'Working',
  FAULTY = 'Faulty',
  SCRAP = 'Scrap',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  PENDING_MANAGER = 'PENDING_MANAGER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RequestType {
  BORROW = 'BORROW',
  RETURN = 'RETURN',
  ROSAK = 'ROSAK',
  SCRAP = 'SCRAP',
  LOST = 'LOST',
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  base: string;
  email: string;
  password?: string;
}

export interface InventoryItem {
  id: string;
  no: string; 
  description: string;
  maker: string;
  range: string;
  typeModel: string;
  serialNo: string;
  unitPrice: string;
  date: string;
  poNo: string;
  quantity: number;
  assetNo: string;
  location: string; 
  equipmentStatus: string;
  documentStatus: string;
  dateOfQfRecorded: string;
  hsemCategory: string;
  physicalStatus: string;
  remarks?: string;
  
  // Tracking Fields
  currentLocation: string;
  personInCharge: string | null;
  lastMovementDate: string | null;
  
  base: string;
}

export interface RequestItem {
  itemId: string;
  description: string;
  serialNo: string;
}

export interface MovementRequest {
  id: string;
  type: RequestType;
  staffId: string;
  staffName: string;
  storekeeperId?: string;
  managerId?: string;
  base: string;
  items: RequestItem[];
  status: RequestStatus;
  timestamp: string;
  rejectionReason?: string;
  reportReason?: string;
  targetLocation?: string;
  targetDate?: string;
}

export interface BaseStats {
  baseName: string;
  totalItems: number;
  skrapCount: number;
  rosakCount: number;
  inUseCount: number;
  lostCount: number;
  okCount: number;
}
