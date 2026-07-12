import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, addDoc, serverTimestamp, orderBy, getCountFromServer, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Complaint, Notice, VisitorPass, GateLog, Expense, MaintenanceBill, UserProfile } from '../types';

const SOCIETY_DOC = 'SOCIETY_001';

// --- COMPLAINTS ---

export const useComplaints = (userId?: string) => {
  return useQuery({
    queryKey: ['complaints', userId],
    queryFn: async () => {
      const complaintsRef = collection(db, SOCIETY_DOC, 'data', 'complaints');
      
      let q;
      if (userId) {
        q = query(complaintsRef, where('reportedBy', '==', userId), orderBy('createdAt', 'desc'));
      } else {
        q = query(complaintsRef, orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    },
  });
};

export const usePendingComplaintsCount = () => {
  return useQuery({
    queryKey: ['complaints-count', 'pending'],
    queryFn: async () => {
      const complaintsRef = collection(db, SOCIETY_DOC, 'data', 'complaints');
      const q = query(complaintsRef, where('status', '==', 'pending'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
  });
};

export const useAddComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (complaint: Omit<Complaint, 'id' | 'createdAt'>) => {
      const complaintsRef = collection(db, SOCIETY_DOC, 'data', 'complaints');
      const docRef = await addDoc(complaintsRef, {
        ...complaint,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints-count'] });
    }
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Complaint['status'] }) => {
      const docRef = doc(db, SOCIETY_DOC, 'data', 'complaints', id);
      await updateDoc(docRef, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints-count'] });
    }
  });
};

// --- NOTICES ---

export const useNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const noticesRef = collection(db, SOCIETY_DOC, 'data', 'notices');
      const q = query(noticesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
    },
  });
};

export const useAddNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notice: Omit<Notice, 'id' | 'createdAt'>) => {
      const noticesRef = collection(db, SOCIETY_DOC, 'data', 'notices');
      const docRef = await addDoc(noticesRef, {
        ...notice,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    }
  });
};

// --- USERS ---

export const useUsers = (role?: string) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const usersRef = collection(db, SOCIETY_DOC, 'data', 'users');
      const q = role ? query(usersRef, where('role', '==', role)) : usersRef;
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    },
  });
};

export const useUsersCount = () => {
  return useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const usersRef = collection(db, SOCIETY_DOC, 'data', 'users');
      // Count residents
      const q = query(usersRef, where('role', '==', 'resident'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
  });
};

export const useGuardsCount = () => {
  return useQuery({
    queryKey: ['guards-count'],
    queryFn: async () => {
      const usersRef = collection(db, SOCIETY_DOC, 'data', 'users');
      // Count guards
      const q = query(usersRef, where('role', '==', 'guard'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
  });
};

// --- VISITOR PASSES ---

export const useGeneratePass = () => {
  return useMutation({
    mutationFn: async (pass: Omit<VisitorPass, 'id' | 'createdAt'>) => {
      const passesRef = collection(db, SOCIETY_DOC, 'data', 'passes');
      const docRef = await addDoc(passesRef, {
        ...pass,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  });
};

export const useVerifyPass = () => {
  return useMutation({
    mutationFn: async (passCode: string) => {
      const passesRef = collection(db, SOCIETY_DOC, 'data', 'passes');
      const q = query(passesRef, where('passCode', '==', passCode), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Invalid or expired pass code');
      }
      
      const passDoc = snapshot.docs[0];
      return { id: passDoc.id, ...passDoc.data() } as VisitorPass;
    }
  });
};

// --- GATE LOGS ---

export const useLogEntry = () => {
  return useMutation({
    mutationFn: async (log: Omit<GateLog, 'id' | 'entryTime'>) => {
      const logsRef = collection(db, SOCIETY_DOC, 'data', 'gate_logs');
      await addDoc(logsRef, {
        ...log,
        entryTime: serverTimestamp()
      });
      
      // If there's a passId, mark it as used
      if (log.passId) {
        const passRef = doc(db, SOCIETY_DOC, 'data', 'passes', log.passId);
        await updateDoc(passRef, { status: 'used' });
      }
    }
  });
};

export const useGateLogs = () => {
  return useQuery({
    queryKey: ['gate-logs'],
    queryFn: async () => {
      const logsRef = collection(db, SOCIETY_DOC, 'data', 'gate_logs');
      // Typically we'd filter by today's date, but for simplicity we'll fetch recent
      const q = query(logsRef, orderBy('entryTime', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GateLog));
    }
  });
};

// --- FINANCIALS ---

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const expensesRef = collection(db, SOCIETY_DOC, 'data', 'expenses');
      const q = query(expensesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    }
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      const expensesRef = collection(db, SOCIETY_DOC, 'data', 'expenses');
      await addDoc(expensesRef, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
};

export const useBills = (userId?: string) => {
  return useQuery({
    queryKey: ['bills', userId],
    queryFn: async () => {
      const billsRef = collection(db, SOCIETY_DOC, 'data', 'bills');
      const q = userId ? query(billsRef, where('userId', '==', userId)) : billsRef;
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceBill));
    }
  });
};

export const useAddBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Omit<MaintenanceBill, 'id'>) => {
      const billsRef = collection(db, SOCIETY_DOC, 'data', 'bills');
      await addDoc(billsRef, bill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });
};

export const useUpdateBillStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MaintenanceBill['status'] }) => {
      const docRef = doc(db, SOCIETY_DOC, 'data', 'bills', id);
      await updateDoc(docRef, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });
};
