// Mock data store for Rolled platform
// Uses localStorage for persistence until Firebase is integrated

export interface Company {
  id: string;
  name: string;
  logo: string;
  currency: string;
  taxConfig: TaxSlab[];
  createdAt: string;
  address: string;
  phone: string;
  email: string;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'super_admin' | 'accountant' | 'hr_manager' | 'employee';
  companyIds: string[];
  activeCompanyId: string;
  avatar: string;
  preferences: { darkMode: boolean };
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  invoiceCount: number;
  totalBilled: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  number: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
  paidAt: string | null;
  sharedToken: string;
  templateId: string;
  notes: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employeeId: string;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatar: string;
  salaryStructure: {
    basic: number;
    allowances: { label: string; amount: number }[];
    deductions: { label: string; amount: number }[];
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
}

export interface PayrollRun {
  id: string;
  companyId: string;
  month: number;
  year: number;
  totalExpense: number;
  employeeCount: number;
  status: 'COMPLETED' | 'ROLLED_BACK';
  processedAt: string;
  insights: string;
}

export interface SalarySlip {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  payrollRunId: string;
  month: number;
  year: number;
  grossPay: number;
  totalAllowances: number;
  totalDeductions: number;
  taxDeduction: number;
  netPay: number;
  snapshot: {
    name: string;
    designation: string;
    department: string;
    basic: number;
    allowances: { label: string; amount: number }[];
    deductions: { label: string; amount: number }[];
  };
}

export interface InvoiceTemplate {
  id: string;
  companyId: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  font: string;
  layout: 'minimal' | 'corporate' | 'bold' | 'classic';
  isDefault: boolean;
  logo?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  action: 'created' | 'updated' | 'deleted';
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
}

// ── SEED DATA ──

const COMPANY: Company = {
  id: 'comp_001',
  name: 'Vertex Technologies',
  logo: '',
  currency: 'PKR',
  taxConfig: [
    { min: 0, max: 600000, rate: 0, label: 'Up to 600,000' },
    { min: 600001, max: 1200000, rate: 2.5, label: '600,001 – 1,200,000' },
    { min: 1200001, max: 2400000, rate: 12.5, label: '1,200,001 – 2,400,000' },
    { min: 2400001, max: 3600000, rate: 22.5, label: '2,400,001 – 3,600,000' },
    { min: 3600001, max: Infinity, rate: 32.5, label: 'Above 3,600,000' },
  ],
  createdAt: '2025-01-15',
  address: '42 Blue Area, Islamabad, Pakistan',
  phone: '+92 51 2345678',
  email: 'info@vertextech.pk',
};

const CURRENT_USER: User = {
  uid: 'user_001',
  name: 'Yaseen Ahmed',
  email: 'yaseen@vertextech.pk',
  role: 'super_admin',
  companyIds: ['comp_001'],
  activeCompanyId: 'comp_001',
  avatar: '',
  preferences: { darkMode: false },
};

const CLIENTS: Client[] = [
  { id: 'cli_001', companyId: 'comp_001', name: 'Acme Corporation', email: 'billing@acme.com', phone: '+92 300 1234567', address: '15 Main Boulevard, Lahore', invoiceCount: 8, totalBilled: 1250000, createdAt: '2025-02-01' },
  { id: 'cli_002', companyId: 'comp_001', name: 'Nexus Solutions', email: 'finance@nexus.pk', phone: '+92 321 9876543', address: '7 Tech Park, Karachi', invoiceCount: 5, totalBilled: 875000, createdAt: '2025-03-10' },
  { id: 'cli_003', companyId: 'comp_001', name: 'Zenith Digital', email: 'accounts@zenith.io', phone: '+92 333 5551234', address: '22 Civic Center, Islamabad', invoiceCount: 3, totalBilled: 450000, createdAt: '2025-04-20' },
  { id: 'cli_004', companyId: 'comp_001', name: 'Horizon Media', email: 'pay@horizon.pk', phone: '+92 345 6789012', address: '99 Press Club, Rawalpindi', invoiceCount: 6, totalBilled: 980000, createdAt: '2025-01-25' },
  { id: 'cli_005', companyId: 'comp_001', name: 'Pinnacle Systems', email: 'ar@pinnacle.com', phone: '+92 311 4443322', address: '55 IT Tower, Faisalabad', invoiceCount: 2, totalBilled: 320000, createdAt: '2025-05-05' },
];

const INVOICES: Invoice[] = [
  { id: 'inv_001', companyId: 'comp_001', clientId: 'cli_001', clientName: 'Acme Corporation', number: 'INV-2025-001', items: [{ id: 'item_1', description: 'Web Development - Phase 1', quantity: 1, rate: 350000, total: 350000 }, { id: 'item_2', description: 'UI/UX Design', quantity: 1, rate: 150000, total: 150000 }], subtotal: 500000, taxRate: 5, taxAmount: 25000, total: 525000, status: 'PAID', dueDate: '2025-03-01', createdAt: '2025-02-15', paidAt: '2025-02-28', sharedToken: 'tok_001', templateId: 'tpl_001', notes: 'Thank you for your business!' },
  { id: 'inv_002', companyId: 'comp_001', clientId: 'cli_002', clientName: 'Nexus Solutions', number: 'INV-2025-002', items: [{ id: 'item_3', description: 'API Integration Services', quantity: 40, rate: 5000, total: 200000 }], subtotal: 200000, taxRate: 5, taxAmount: 10000, total: 210000, status: 'SENT', dueDate: '2025-07-15', createdAt: '2025-06-01', paidAt: null, sharedToken: 'tok_002', templateId: 'tpl_001', notes: '' },
  { id: 'inv_003', companyId: 'comp_001', clientId: 'cli_003', clientName: 'Zenith Digital', number: 'INV-2025-003', items: [{ id: 'item_4', description: 'Mobile App Development', quantity: 1, rate: 450000, total: 450000 }], subtotal: 450000, taxRate: 5, taxAmount: 22500, total: 472500, status: 'OVERDUE', dueDate: '2025-05-30', createdAt: '2025-05-01', paidAt: null, sharedToken: 'tok_003', templateId: 'tpl_002', notes: 'Payment due within 30 days' },
  { id: 'inv_004', companyId: 'comp_001', clientId: 'cli_004', clientName: 'Horizon Media', number: 'INV-2025-004', items: [{ id: 'item_5', description: 'SEO Consultation', quantity: 3, rate: 50000, total: 150000 }, { id: 'item_6', description: 'Content Strategy', quantity: 1, rate: 80000, total: 80000 }], subtotal: 230000, taxRate: 5, taxAmount: 11500, total: 241500, status: 'DRAFT', dueDate: '2025-07-30', createdAt: '2025-06-18', paidAt: null, sharedToken: 'tok_004', templateId: 'tpl_001', notes: '' },
  { id: 'inv_005', companyId: 'comp_001', clientId: 'cli_001', clientName: 'Acme Corporation', number: 'INV-2025-005', items: [{ id: 'item_7', description: 'Web Development - Phase 2', quantity: 1, rate: 400000, total: 400000 }], subtotal: 400000, taxRate: 5, taxAmount: 20000, total: 420000, status: 'PAID', dueDate: '2025-05-01', createdAt: '2025-04-01', paidAt: '2025-04-25', sharedToken: 'tok_005', templateId: 'tpl_001', notes: '' },
  { id: 'inv_006', companyId: 'comp_001', clientId: 'cli_005', clientName: 'Pinnacle Systems', number: 'INV-2025-006', items: [{ id: 'item_8', description: 'Cloud Infrastructure Setup', quantity: 1, rate: 320000, total: 320000 }], subtotal: 320000, taxRate: 5, taxAmount: 16000, total: 336000, status: 'SENT', dueDate: '2025-07-20', createdAt: '2025-06-10', paidAt: null, sharedToken: 'tok_006', templateId: 'tpl_002', notes: '' },
  { id: 'inv_007', companyId: 'comp_001', clientId: 'cli_002', clientName: 'Nexus Solutions', number: 'INV-2025-007', items: [{ id: 'item_9', description: 'Monthly Retainer - June', quantity: 1, rate: 180000, total: 180000 }], subtotal: 180000, taxRate: 5, taxAmount: 9000, total: 189000, status: 'PAID', dueDate: '2025-06-15', createdAt: '2025-06-01', paidAt: '2025-06-14', sharedToken: 'tok_007', templateId: 'tpl_001', notes: '' },
];

const EMPLOYEES: Employee[] = [
  { id: 'emp_001', companyId: 'comp_001', name: 'Ali Hassan', email: 'ali@vertextech.pk', phone: '+92 300 1112233', department: 'Engineering', designation: 'Senior Engineer', employeeId: 'VTX-001', joinDate: '2024-01-15', status: 'Active', avatar: '', salaryStructure: { basic: 80000, allowances: [{ label: 'House Rent', amount: 20000 }, { label: 'Medical', amount: 5000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'HBL', accountNumber: '1234567890', iban: 'PK36HABB0012345678901234' } },
  { id: 'emp_002', companyId: 'comp_001', name: 'Sara Khan', email: 'sara@vertextech.pk', phone: '+92 321 4445566', department: 'Design', designation: 'Lead Designer', employeeId: 'VTX-002', joinDate: '2024-03-01', status: 'Active', avatar: '', salaryStructure: { basic: 70000, allowances: [{ label: 'House Rent', amount: 18000 }, { label: 'Medical', amount: 5000 }, { label: 'Transport', amount: 8000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'MCB', accountNumber: '9876543210', iban: 'PK50MUCB0098765432101234' } },
  { id: 'emp_003', companyId: 'comp_001', name: 'Usman Malik', email: 'usman@vertextech.pk', phone: '+92 333 7778899', department: 'Engineering', designation: 'Full Stack Developer', employeeId: 'VTX-003', joinDate: '2024-06-15', status: 'Active', avatar: '', salaryStructure: { basic: 65000, allowances: [{ label: 'House Rent', amount: 15000 }, { label: 'Medical', amount: 5000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'UBL', accountNumber: '5555666677', iban: 'PK22UNIL0055556666770000' } },
  { id: 'emp_004', companyId: 'comp_001', name: 'Fatima Noor', email: 'fatima@vertextech.pk', phone: '+92 345 1234567', department: 'Marketing', designation: 'Marketing Manager', employeeId: 'VTX-004', joinDate: '2024-02-10', status: 'Active', avatar: '', salaryStructure: { basic: 75000, allowances: [{ label: 'House Rent', amount: 18000 }, { label: 'Medical', amount: 5000 }, { label: 'Phone', amount: 3000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'Alfalah', accountNumber: '3333444455', iban: 'PK44ALFH0033334444550000' } },
  { id: 'emp_005', companyId: 'comp_001', name: 'Ahmed Raza', email: 'ahmed@vertextech.pk', phone: '+92 311 9998877', department: 'Engineering', designation: 'Junior Developer', employeeId: 'VTX-005', joinDate: '2025-01-10', status: 'Active', avatar: '', salaryStructure: { basic: 45000, allowances: [{ label: 'House Rent', amount: 10000 }, { label: 'Medical', amount: 3000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'HBL', accountNumber: '1111222233', iban: 'PK36HABB0011112222330000' } },
  { id: 'emp_006', companyId: 'comp_001', name: 'Ayesha Siddiqi', email: 'ayesha@vertextech.pk', phone: '+92 300 5556677', department: 'HR', designation: 'HR Coordinator', employeeId: 'VTX-006', joinDate: '2024-07-01', status: 'Active', avatar: '', salaryStructure: { basic: 55000, allowances: [{ label: 'House Rent', amount: 12000 }, { label: 'Medical', amount: 5000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'MCB', accountNumber: '7777888899', iban: 'PK50MUCB0077778888990000' } },
  { id: 'emp_007', companyId: 'comp_001', name: 'Bilal Iqbal', email: 'bilal@vertextech.pk', phone: '+92 321 3332211', department: 'Design', designation: 'UI Designer', employeeId: 'VTX-007', joinDate: '2024-09-15', status: 'On Leave', avatar: '', salaryStructure: { basic: 50000, allowances: [{ label: 'House Rent', amount: 12000 }, { label: 'Medical', amount: 3000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'UBL', accountNumber: '4444555566', iban: 'PK22UNIL0044445555660000' } },
  { id: 'emp_008', companyId: 'comp_001', name: 'Zara Sheikh', email: 'zara@vertextech.pk', phone: '+92 333 1119900', department: 'Marketing', designation: 'Content Writer', employeeId: 'VTX-008', joinDate: '2025-03-01', status: 'Active', avatar: '', salaryStructure: { basic: 40000, allowances: [{ label: 'House Rent', amount: 8000 }, { label: 'Medical', amount: 3000 }], deductions: [{ label: 'EOBI', amount: 1600 }] }, bankDetails: { bankName: 'Alfalah', accountNumber: '6666777788', iban: 'PK44ALFH0066667777880000' } },
];

const PAYROLL_RUNS: PayrollRun[] = [
  { id: 'pr_001', companyId: 'comp_001', month: 3, year: 2025, totalExpense: 687200, employeeCount: 7, status: 'COMPLETED', processedAt: '2025-03-28', insights: 'Total payroll cost was PKR 687,200 for 7 employees. Engineering department accounts for 43% of payroll costs.' },
  { id: 'pr_002', companyId: 'comp_001', month: 4, year: 2025, totalExpense: 695800, employeeCount: 7, status: 'COMPLETED', processedAt: '2025-04-28', insights: 'Payroll grew 1.3% this month. No new hires or exits.' },
  { id: 'pr_003', companyId: 'comp_001', month: 5, year: 2025, totalExpense: 738400, employeeCount: 8, status: 'COMPLETED', processedAt: '2025-05-28', insights: 'Payroll grew 6.1% driven by 1 new hire in Marketing. Engineering remains the largest cost center at 41%.' },
];

const SALARY_SLIPS: SalarySlip[] = EMPLOYEES.filter(e => e.status === 'Active').map((emp, i) => {
  const totalAllowances = emp.salaryStructure.allowances.reduce((s, a) => s + a.amount, 0);
  const totalDeductions = emp.salaryStructure.deductions.reduce((s, d) => s + d.amount, 0);
  const gross = emp.salaryStructure.basic + totalAllowances;
  const annualGross = gross * 12;
  let tax = 0;
  if (annualGross > 600000) tax = Math.round((annualGross * 0.025) / 12);
  if (annualGross > 1200000) tax = Math.round((annualGross * 0.125) / 12);
  const net = gross - totalDeductions - tax;

  return {
    id: `slip_may_${i}`,
    companyId: 'comp_001',
    employeeId: emp.id,
    employeeName: emp.name,
    payrollRunId: 'pr_003',
    month: 5,
    year: 2025,
    grossPay: gross,
    totalAllowances,
    totalDeductions,
    taxDeduction: tax,
    netPay: net,
    snapshot: {
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      basic: emp.salaryStructure.basic,
      allowances: [...emp.salaryStructure.allowances],
      deductions: [...emp.salaryStructure.deductions],
    },
  };
});

const TEMPLATES: InvoiceTemplate[] = [
  { id: 'tpl_001', companyId: 'comp_001', name: 'Minimal', primaryColor: '#0F0E0C', accentColor: '#6B6860', font: 'DM Sans', layout: 'minimal', isDefault: true },
  { id: 'tpl_002', companyId: 'comp_001', name: 'Corporate Blue', primaryColor: '#1D3557', accentColor: '#457B9D', font: 'DM Sans', layout: 'corporate', isDefault: false },
  { id: 'tpl_003', companyId: 'comp_001', name: 'Bold Purple', primaryColor: '#7C3AED', accentColor: '#A78BFA', font: 'Inter', layout: 'bold', isDefault: false },
  { id: 'tpl_004', companyId: 'comp_001', name: 'Classic', primaryColor: '#1a1a1a', accentColor: '#666666', font: 'Georgia', layout: 'classic', isDefault: false },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: 'al_001', companyId: 'comp_001', action: 'created', entityType: 'invoice', entityId: 'inv_007', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Created invoice INV-2025-007 for Nexus Solutions', timestamp: '2025-06-01T10:30:00Z' },
  { id: 'al_002', companyId: 'comp_001', action: 'updated', entityType: 'invoice', entityId: 'inv_007', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Marked invoice INV-2025-007 as PAID', timestamp: '2025-06-14T14:20:00Z' },
  { id: 'al_003', companyId: 'comp_001', action: 'created', entityType: 'employee', entityId: 'emp_008', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Added new employee Zara Sheikh to Marketing', timestamp: '2025-03-01T09:00:00Z' },
  { id: 'al_004', companyId: 'comp_001', action: 'created', entityType: 'payroll', entityId: 'pr_003', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Ran payroll for May 2025 — 8 employees, PKR 738,400 total', timestamp: '2025-05-28T16:45:00Z' },
  { id: 'al_005', companyId: 'comp_001', action: 'updated', entityType: 'employee', entityId: 'emp_007', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Changed Bilal Iqbal status to On Leave', timestamp: '2025-06-10T11:15:00Z' },
  { id: 'al_006', companyId: 'comp_001', action: 'created', entityType: 'invoice', entityId: 'inv_006', userId: 'user_001', userName: 'Yaseen Ahmed', description: 'Created invoice INV-2025-006 for Pinnacle Systems', timestamp: '2025-06-10T09:30:00Z' },
];

// ── DATA STORE ──

export function getCompany(): Company {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rolled_company");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing rolled_company:", e);
      }
    }
    localStorage.setItem("rolled_company", JSON.stringify(COMPANY));
  }
  return { ...COMPANY };
}

export function saveCompany(company: Company): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rolled_company", JSON.stringify(company));
  }
}

export function getCurrentUser(): User {
  return CURRENT_USER;
}

export function getClients(): Client[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rolled_clients");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing rolled_clients:", e);
      }
    }
    // Seed initial clients if not set
    localStorage.setItem("rolled_clients", JSON.stringify(CLIENTS));
  }
  return [...CLIENTS];
}

export function getClient(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function saveClients(clientsList: Client[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rolled_clients", JSON.stringify(clientsList));
  }
}

export function getInvoices(): Invoice[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rolled_invoices");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing rolled_invoices:", e);
      }
    }
    // Seed initial invoices if not set
    localStorage.setItem("rolled_invoices", JSON.stringify(INVOICES));
  }
  return [...INVOICES];
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find(i => i.id === id);
}

export function getInvoiceByToken(token: string): Invoice | undefined {
  return getInvoices().find(i => i.sharedToken === token);
}

export function saveInvoices(invoicesList: Invoice[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rolled_invoices", JSON.stringify(invoicesList));
  }
}

export function getEmployees(): Employee[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rolled_employees");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing rolled_employees:", e);
      }
    }
    // Seed initial employees if not set
    localStorage.setItem("rolled_employees", JSON.stringify(EMPLOYEES));
  }
  return [...EMPLOYEES];
}

export function getEmployee(id: string): Employee | undefined {
  return getEmployees().find(e => e.id === id);
}

export function saveEmployees(employeesList: Employee[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rolled_employees", JSON.stringify(employeesList));
  }
}

export function getPayrollRuns(): PayrollRun[] {
  return [...PAYROLL_RUNS];
}

export function getSalarySlips(payrollRunId?: string): SalarySlip[] {
  if (payrollRunId) return SALARY_SLIPS.filter(s => s.payrollRunId === payrollRunId);
  return [...SALARY_SLIPS];
}

export function getTemplates(): InvoiceTemplate[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rolled_templates");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing rolled_templates:", e);
      }
    }
    // Seed initial templates if not set
    localStorage.setItem("rolled_templates", JSON.stringify(TEMPLATES));
  }
  return [...TEMPLATES];
}

export function saveTemplates(templatesList: InvoiceTemplate[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rolled_templates", JSON.stringify(templatesList));
  }
}

export function getAuditLogs(): AuditLog[] {
  return [...AUDIT_LOGS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDepartments(): string[] {
  const deps = new Set(EMPLOYEES.map(e => e.department));
  return Array.from(deps);
}

// ── UTILITY FUNCTIONS ──

export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  return `${currency} ${amount.toLocaleString('en-PK')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── DASHBOARD STATS ──

export function getDashboardStats() {
  const invoices = getInvoices();
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

  const statusCounts = {
    DRAFT: invoices.filter(i => i.status === 'DRAFT').length,
    SENT: invoices.filter(i => i.status === 'SENT').length,
    PAID: invoices.filter(i => i.status === 'PAID').length,
    OVERDUE: invoices.filter(i => i.status === 'OVERDUE').length,
  };

  const employees = getEmployees();
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const totalHeadcount = employees.length;

  const payrollRuns = getPayrollRuns();
  const lastPayroll = payrollRuns[payrollRuns.length - 1];

  // Revenue by month (last 6 months)
  const revenueByMonth = [
    { month: 'Jan', revenue: 525000, payroll: 0 },
    { month: 'Feb', revenue: 0, payroll: 0 },
    { month: 'Mar', revenue: 420000, payroll: 687200 },
    { month: 'Apr', revenue: 0, payroll: 695800 },
    { month: 'May', revenue: 189000, payroll: 738400 },
    { month: 'Jun', revenue: 210000 + 336000, payroll: 0 },
  ];

  // Department payroll breakdown
  const deptBreakdown = [
    { name: 'Engineering', value: 302600, color: '#7C3AED' },
    { name: 'Design', value: 115600, color: '#2E5BFF' },
    { name: 'Marketing', value: 152600, color: '#E05A3A' },
    { name: 'HR', value: 70400, color: '#0F7A4A' },
  ];

  return {
    totalInvoiced,
    totalCollected,
    outstanding,
    overdueCount,
    statusCounts,
    activeEmployees,
    totalHeadcount,
    lastPayroll,
    revenueByMonth,
    deptBreakdown,
    clients: getClients(),
  };
}
