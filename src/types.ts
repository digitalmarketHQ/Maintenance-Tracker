export type UserRole = 'Director' | 'Head of School' | 'Facility Manager' | 'Staff';

export interface MaintenanceRecord {
  id: string;
  date: string;       // YYYY-MM-DD
  department: string; // "Administrative / Offices", "IT Unit", "Facilities / Buildings", "Hostel / Dormitories", etc.
  subject: string;    // "Principal's Official Car", "Office Generator", etc.
  details: string;    // "General Servicing", "Bought Battery", etc.
  description: string; // Additional detailed notes
  whoDidIt: string;   // Person who logged / performed
  role: UserRole;     // Role of the person
  cost: number;       // Numeric cost
  proofName?: string; // Filename of proof
  proofType?: string; // e.g. "application/pdf"
  proofData?: string; // base64 string or mock image link
  status: 'Pending' | 'Approved' | 'Rejected'; // Approval status
  createdAt: string;  // ISO timestamp
}

export interface DepartmentInfo {
  name: string;
  items: string[];
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    name: "Administrative / Office",
    items: [
      "Principal's Official Car",
      "Director's Suite AC",
      "Boardroom Smart Projector",
      "Admin Office Printers",
      "School Reception Lobby Furniture",
      "Main Conference Table & Chairs",
      "Registrar's Cabin Server Backup UPS"
    ]
  },
  {
    name: "IT Unit",
    items: [
      "School Core Switch / Router",
      "Server Rack Backup Battery",
      "Computer Lab Student Desktops",
      "Fiber Optic Internet Line Gateway",
      "Staff Common Room WiFi AP",
      "Digital Signage Display Boards"
    ]
  },
  {
    name: "Facilities / Buildings",
    items: [
      "Classroom Ceiling Fans & Lighting",
      "Main Water Dispenser Filters",
      "School Entrance Security Gates",
      "Restroom Fittings & Plumbing",
      "Assembly Hall Sound System",
      "General School Water Pumps",
      "Playground Swings & Turf"
    ]
  },
  {
    name: "Hostel / Dormitories",
    items: [
      "Dormitory Water Geysers",
      "Dormitory Air Conditioning",
      "Hostel Bunk Bed Repairs",
      "Cafeteria Industrial Stove Range",
      "Hostel Emergency Generators",
      "Laundry Room Washers & Dryers"
    ]
  },
  {
    name: "Sports & Recreation",
    items: [
      "Football Pitch Turf & Goal Nets",
      "Indoor Sports Gymnasium Equipment",
      "Swimming Pool Filtration System",
      "Basketball Hoop Stands",
      "School Sports Pavilion Seating"
    ]
  }
];

export interface RoleConfig {
  name: UserRole;
  description: string;
  badgeColor: string;
  iconName: string;
}

export const ROLES: RoleConfig[] = [
  {
    name: 'Director',
    description: 'Full oversight, reviews and approves capital expenditure logs, views reports.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
    iconName: 'ShieldAlert'
  },
  {
    name: 'Head of School',
    description: 'Oversees day-to-day logs, approves standard servicing requests, exports CSVs.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
    iconName: 'Award'
  },
  {
    name: 'Facility Manager',
    description: 'Submits detailed logs, purchases equipment, uploads receipts, triggers repairs.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    iconName: 'Wrench'
  },
  {
    name: 'Staff',
    description: 'Submits general maintenance requests, reports broken items or direct purchases.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    iconName: 'User'
  }
];
