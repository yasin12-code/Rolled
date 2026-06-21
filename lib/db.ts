import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { Company, User, Client, Invoice, Employee, PayrollRun, SalarySlip } from "./data";

// ── DATA ACCESS FUNCTIONS ──

export async function getCompany(companyId: string): Promise<Company | null> {
  const docRef = doc(db, "companies", companyId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Company;
  }
  return null;
}

export async function getCurrentUser(uid: string): Promise<User | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
}

export async function getClients(companyId: string): Promise<Client[]> {
  const q = query(collection(db, "clients"), where("companyId", "==", companyId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
}

export async function getInvoices(companyId: string): Promise<Invoice[]> {
  const q = query(collection(db, "invoices"), where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
}

export async function getEmployees(companyId: string): Promise<Employee[]> {
  const q = query(collection(db, "employees"), where("companyId", "==", companyId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
}

export async function getPayrollRuns(companyId: string): Promise<PayrollRun[]> {
  const q = query(collection(db, "payroll_runs"), where("companyId", "==", companyId), orderBy("month", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayrollRun));
}

export async function getSalarySlips(companyId: string, payrollRunId?: string): Promise<SalarySlip[]> {
  let q;
  if (payrollRunId) {
    q = query(collection(db, "salary_slips"), where("companyId", "==", companyId), where("payrollRunId", "==", payrollRunId));
  } else {
    q = query(collection(db, "salary_slips"), where("companyId", "==", companyId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalarySlip));
}

export async function getDepartments(companyId: string): Promise<string[]> {
  const employees = await getEmployees(companyId);
  const deps = new Set(employees.map(e => e.department));
  return Array.from(deps);
}
