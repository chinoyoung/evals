import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  User,
  Question,
  Evaluation,
  EvaluationTemplate,
  Response,
} from "@/types";

// Convert Firestore Timestamp to Date
const convertTimestamp = (timestamp: Timestamp | undefined): Date => {
  return timestamp ? timestamp.toDate() : new Date();
};

// Convert Date to Firestore Timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// User operations
export const userService = {
  async createUser(userData: Omit<User, "createdAt">): Promise<void> {
    // Use setDoc with the user's UID as document ID to prevent duplicates
    const docRef = doc(db, "users", userData.uid);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  },

  async getUser(uid: string): Promise<User | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        uid: docSnap.id,
        createdAt: convertTimestamp(data.createdAt),
      } as User;
    }
    return null;
  },

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, updates);
  },

  async getUsersByRole(role: User["role"]): Promise<User[]> {
    const q = query(collection(db, "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as User;
    });
  },

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as User;
    });
  },

  // Utility function to clean up duplicate users
  async cleanupDuplicateUsers(): Promise<{ removed: number; kept: number }> {
    const users = await this.getAllUsers();
    const emailMap = new Map<string, User[]>();

    // Group users by email
    users.forEach((user) => {
      if (!emailMap.has(user.email)) {
        emailMap.set(user.email, []);
      }
      emailMap.get(user.email)!.push(user);
    });

    const batch = writeBatch(db);
    let removed = 0;
    let kept = 0;

    // Process each email group
    for (const [email, userGroup] of emailMap) {
      if (userGroup.length > 1) {
        // Sort by creation date, keep the oldest (first created)
        userGroup.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Keep the first user, remove the rest
        const [keepUser, ...duplicateUsers] = userGroup;
        kept++;

        // Remove duplicates
        duplicateUsers.forEach((duplicateUser) => {
          const docRef = doc(db, "users", duplicateUser.uid);
          batch.delete(docRef);
          removed++;
        });

        console.log(
          `Email ${email}: Keeping ${keepUser.uid}, removing ${duplicateUsers.length} duplicates`
        );
      } else {
        kept++;
      }
    }

    if (removed > 0) {
      await batch.commit();
      console.log(
        `Cleanup complete: Removed ${removed} duplicate users, kept ${kept} users`
      );
    } else {
      console.log("No duplicate users found");
    }

    return { removed, kept };
  },
};

// Question operations
export const questionService = {
  async createQuestion(
    questionData: Omit<Question, "id" | "createdAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "questions"), {
      ...questionData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getQuestions(): Promise<Question[]> {
    const q = query(collection(db, "questions"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as Question;
    });
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<void> {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, updates);
  },

  async deleteQuestion(id: string): Promise<void> {
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
  },
};

// Evaluation operations
export const evaluationService = {
  async createEvaluation(
    evaluationData: Omit<Evaluation, "id" | "createdAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "evaluations"), {
      ...evaluationData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getEvaluation(id: string): Promise<Evaluation | null> {
    const docRef = doc(db, "evaluations", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        dueDate: convertTimestamp(data.dueDate),
        assignedDate: convertTimestamp(data.assignedDate),
        completedDate: data.completedDate
          ? convertTimestamp(data.completedDate)
          : undefined,
        createdAt: convertTimestamp(data.createdAt),
      } as Evaluation;
    }
    return null;
  },

  async getUserEvaluations(
    userId: string,
    type?: "pending" | "completed"
  ): Promise<Evaluation[]> {
    let q = query(
      collection(db, "evaluations"),
      where("evaluatorId", "==", userId)
    );

    if (type) {
      q = query(q, where("status", "==", type));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dueDate: convertTimestamp(data.dueDate),
        assignedDate: convertTimestamp(data.assignedDate),
        completedDate: data.completedDate
          ? convertTimestamp(data.completedDate)
          : undefined,
        createdAt: convertTimestamp(data.createdAt),
      } as Evaluation;
    });
  },

  async getAllEvaluations(): Promise<Evaluation[]> {
    const q = query(
      collection(db, "evaluations"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dueDate: convertTimestamp(data.dueDate),
        assignedDate: convertTimestamp(data.assignedDate),
        completedDate: data.completedDate
          ? convertTimestamp(data.completedDate)
          : undefined,
        createdAt: convertTimestamp(data.createdAt),
      } as Evaluation;
    });
  },

  async updateEvaluation(
    id: string,
    updates: Partial<Evaluation>
  ): Promise<void> {
    const docRef = doc(db, "evaluations", id);
    const firestoreUpdates: Record<string, unknown> = { ...updates };
    if (updates.dueDate)
      firestoreUpdates.dueDate = convertToTimestamp(updates.dueDate);
    if (updates.completedDate)
      firestoreUpdates.completedDate = convertToTimestamp(
        updates.completedDate
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(docRef, firestoreUpdates as any);
  },

  async submitEvaluation(id: string, responses: Response[]): Promise<void> {
    const docRef = doc(db, "evaluations", id);
    await updateDoc(docRef, {
      responses,
      status: "completed",
      completedDate: serverTimestamp(),
    });
  },
};

// Template operations
export const templateService = {
  async createTemplate(
    templateData: Omit<EvaluationTemplate, "id" | "createdAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "templates"), {
      ...templateData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getTemplates(): Promise<EvaluationTemplate[]> {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as EvaluationTemplate;
    });
  },
};
