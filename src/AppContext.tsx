import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User,
  BudgetItem,
  BudgetSubmission,
  BudgetComment,
  OrganizationalUnit,
  users as initialUsers,
  organizationalUnits,
  initialBudgetItems,
  initialSubmissions,
  initialComments,
  getParentUnit,
  getAllDescendantUnits,
} from './mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  units: OrganizationalUnit[];
  budgetItems: BudgetItem[];
  submissions: BudgetSubmission[];
  comments: BudgetComment[];
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  submitBudget: (unitId: string) => void;
  approveBudgetItem: (itemId: string, comment?: string) => void;
  rejectBudgetItem: (itemId: string, comment: string) => void;
  forwardBudgetToParent: (unitId: string) => void;
  returnBudgetToChild: (itemId: string, comment: string) => void;
  approveBudgetGroup: (unitId: string, year: number, comment?: string) => void;
  rejectBudgetGroup: (unitId: string, year: number, comment: string) => void;
  returnBudgetGroupToChild: (unitId: string, year: number, comment: string) => void;
  requestClarification: (itemId: string, comment: string) => void;
  addComment: (itemId: string, content: string, parentCommentId?: string) => void;
  markCommentsAsRead: (itemId: string) => void;
  resolveClarification: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [submissions, setSubmissions] = useState<BudgetSubmission[]>(initialSubmissions);
  const [comments, setComments] = useState<BudgetComment[]>(initialComments);

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}`,
    };
    setBudgetItems(prev => [...prev, newItem]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const submitBudget = (unitId: string) => {
    const unit = organizationalUnits.find(u => u.id === unitId);
    if (!unit || !unit.parentId) {
      return;
    }

    let submittedItemIds: string[] = [];

    setBudgetItems(prev => {
      const itemsToSubmit = prev.filter(
        item => item.unitId === unitId && item.status === 'draft'
      );

      if (itemsToSubmit.length === 0) return prev;

      submittedItemIds = itemsToSubmit.map(item => item.id);

      const updatedItems = prev.map(item =>
        submittedItemIds.includes(item.id)
          ? { ...item, status: 'pending' as const, submittedTo: unit.parentId! }
          : item
      );

      return updatedItems;
    });

    if (submittedItemIds.length > 0) {
      const submission: BudgetSubmission = {
        id: `s-${Date.now()}`,
        fromUnitId: unitId,
        toUnitId: unit.parentId,
        status: 'pending',
        budgetItemIds: submittedItemIds,
        submittedAt: new Date(),
      };

      setSubmissions(prev => [...prev, submission]);
    }
  };

  const approveBudgetItem = (itemId: string, comment?: string) => {
    updateBudgetItem(itemId, {
      status: 'approved',
      comment: comment || undefined,
    });
  };

  const rejectBudgetItem = (itemId: string, comment: string) => {
    updateBudgetItem(itemId, {
      status: 'rejected',
      comment,
    });
  };

  const returnBudgetToChild = (itemId: string, comment: string) => {
    updateBudgetItem(itemId, {
      status: 'draft',
      comment,
      submittedTo: undefined,
    });
  };

  const forwardBudgetToParent = (unitId: string) => {
    const unit = organizationalUnits.find(u => u.id === unitId);
    if (!unit || !unit.parentId) return;

    const descendantUnits = getAllDescendantUnits(unitId, organizationalUnits);
    const descendantUnitIds = [unitId, ...descendantUnits.map(u => u.id)];

    let forwardedItemIds: string[] = [];

    setBudgetItems(prev => {
      const itemsToForward = prev.filter(
        item =>
          descendantUnitIds.includes(item.unitId) &&
          item.status === 'approved' &&
          item.submittedTo === unitId
      );

      if (itemsToForward.length === 0) return prev;

      forwardedItemIds = itemsToForward.map(item => item.id);

      return prev.map(item =>
        forwardedItemIds.includes(item.id)
          ? { ...item, submittedTo: unit.parentId!, status: 'pending' as const }
          : item
      );
    });

    if (forwardedItemIds.length > 0) {
      const submission: BudgetSubmission = {
        id: `s-${Date.now()}`,
        fromUnitId: unitId,
        toUnitId: unit.parentId,
        status: 'pending',
        budgetItemIds: forwardedItemIds,
        submittedAt: new Date(),
      };

      setSubmissions(prev => [...prev, submission]);
    }
  };

  const approveBudgetGroup = (unitId: string, year: number, comment?: string) => {
    setBudgetItems(prev =>
      prev.map(item =>
        item.unitId === unitId && item.year === year && item.status === 'pending'
          ? { ...item, status: 'approved' as const, comment: comment || undefined }
          : item
      )
    );
  };

  const rejectBudgetGroup = (unitId: string, year: number, comment: string) => {
    setBudgetItems(prev =>
      prev.map(item =>
        item.unitId === unitId && item.year === year && item.status === 'pending'
          ? { ...item, status: 'rejected' as const, comment }
          : item
      )
    );
  };

  const returnBudgetGroupToChild = (unitId: string, year: number, comment: string) => {
    setBudgetItems(prev =>
      prev.map(item =>
        item.unitId === unitId && item.year === year && item.status === 'pending'
          ? { ...item, status: 'draft' as const, comment, submittedTo: undefined }
          : item
      )
    );
  };

  const requestClarification = (itemId: string, content: string) => {
    if (!currentUser) return;

    const newComment: BudgetComment = {
      id: `c-${Date.now()}`,
      budgetItemId: itemId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: new Date(),
    };

    setComments(prev => [...prev, newComment]);

    updateBudgetItem(itemId, {
      clarificationStatus: 'requested',
      hasUnreadComments: true,
    });
  };

  const addComment = (itemId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) return;

    const newComment: BudgetComment = {
      id: `c-${Date.now()}`,
      budgetItemId: itemId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: new Date(),
      isResponse: !!parentCommentId,
      parentCommentId,
    };

    setComments(prev => [...prev, newComment]);

    const item = budgetItems.find(i => i.id === itemId);
    if (item && item.clarificationStatus === 'requested' && !parentCommentId) {
      updateBudgetItem(itemId, {
        clarificationStatus: 'responded',
        hasUnreadComments: true,
      });
    } else {
      updateBudgetItem(itemId, {
        hasUnreadComments: true,
      });
    }
  };

  const markCommentsAsRead = (itemId: string) => {
    updateBudgetItem(itemId, {
      hasUnreadComments: false,
    });
  };

  const resolveClarification = (itemId: string) => {
    updateBudgetItem(itemId, {
      clarificationStatus: 'resolved',
      hasUnreadComments: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users: initialUsers,
        units: organizationalUnits,
        budgetItems,
        submissions,
        comments,
        addBudgetItem,
        updateBudgetItem,
        submitBudget,
        approveBudgetItem,
        rejectBudgetItem,
        forwardBudgetToParent,
        returnBudgetToChild,
        approveBudgetGroup,
        rejectBudgetGroup,
        returnBudgetGroupToChild,
        requestClarification,
        addComment,
        markCommentsAsRead,
        resolveClarification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
