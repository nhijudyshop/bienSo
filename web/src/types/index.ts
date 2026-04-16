export interface Province {
  code: string;
  priority: number;
  fullName: string;
}

export interface AnnouncementPlan {
  bksId: string;
  bks: string;
  provinceName: string;
  vehicleType: string;
  auctionDate: string;
  announcementNumber: string;
  totalInterested: number;
  receiveCount: number;
  timeEndRegister: number | null;
  siteId: number;
  districtName: string;
  districtCode: string;
  wardName: string;
  wardCode: string;
  totalRegisteringPeople: number;
  provinceCode: string;
  colorCode: number;
  startingPrice: number;
  hideTotalRegistered: boolean;
  hideTotalRegisteredDate: number;
  lockTime: number;
  interested: boolean;
  registered: boolean;
}

export interface WarehousePlate {
  whLicensePlateId: string;
  idKy: string;
  licensePlate: string;
  colorCode: string;
  requestId: string;
  siteId: number;
  historyId: number;
  provinceCode: string;
  announcementName: string;
  seqNumber: string;
  plateType: number;
  plateSubType: number;
  provincePriority: number;
}

export interface AuctionResultSession {
  totalPlate: number;
  maxPrice: number;
  minPrice: number;
  licensePlate: string;
  auctionDate: string;
  id: number;
  colorCode?: number;
}

export interface AnnouncementPlanCode {
  announcementPlanCode: string;
  announcementPlateId: string | null;
  announcementCode: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  id: number;
  lastUpdated: number;
  attachments: unknown[];
}

export interface PublicFile {
  documentFile: string;
  nameFile: string;
  timePublic: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

export interface MenuItem {
  id: number;
  page: string;
  code: string;
  parentId: number;
  status: number;
  level: number;
  title: string;
  iconUrl: string;
  menuIndex: number;
  leaf: boolean;
  expanded: boolean;
  index: number;
  children: MenuItem[] | null;
}
