import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  BudgetItem,
  BudgetSubmission,
  BudgetComment,
  OrganizationalUnit,
  getParentUnit,
  getAllDescendantUnits,
} from './mockData';
import { supabase } from './lib/supabase';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  units: OrganizationalUnit[];
  budgetItems: BudgetItem[];
  submissions: BudgetSubmission[];
  comments: BudgetComment[];
  loading: boolean;
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  submitBudget: (unitId: string) => Promise<void>;
  approveBudgetItem: (itemId: string, comment?: string) => Promise<void>;
  rejectBudgetItem: (itemId: string, comment: string) => Promise<void>;
  forwardBudgetToParent: (unitId: string) => Promise<void>;
  returnBudgetToChild: (itemId: string, comment: string) => Promise<void>;
  approveBudgetGroup: (unitId: string, year: number, comment?: string) => Promise<void>;
  rejectBudgetGroup: (unitId: string, year: number, comment: string) => Promise<void>;
  returnBudgetGroupToChild: (unitId: string, year: number, comment: string) => Promise<void>;
  requestClarification: (itemId: string, comment: string) => Promise<void>;
  addComment: (itemId: string, content: string, parentCommentId?: string) => Promise<void>;
  markCommentsAsRead: (itemId: string) => Promise<void>;
  resolveClarification: (itemId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [submissions, setSubmissions] = useState<BudgetSubmission[]>([]);
  const [comments, setComments] = useState<BudgetComment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [unitsRes, usersRes, itemsRes, submissionsRes, commentsRes] = await Promise.all([
        supabase.from('organizational_units').select('*'),
        supabase.from('users').select('*'),
        supabase.from('budget_items').select('*'),
        supabase.from('budget_submissions').select('*'),
        supabase.from('budget_comments').select('*'),
      ]);

      if (unitsRes.data) {
        setUnits(unitsRes.data.map(u => ({
          id: u.id,
          name: u.name,
          type: u.type,
          parentId: u.parent_id,
        })));
      }

      if (usersRes.data) {
        setUsers(usersRes.data.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          unitId: u.unit_id,
        })));
      }

      if (itemsRes.data) {
        setBudgetItems(itemsRes.data.map(i => ({
          id: i.id,
          unitId: i.unit_id,
          budgetSection: i.budget_section,
          budgetDivision: i.budget_division,
          budgetChapter: i.budget_chapter,
          category: i.category,
          description: i.description,
          year: i.year,
          amount: Number(i.amount),
          status: i.status,
          comment: i.comment || undefined,
          submittedTo: i.submitted_to || undefined,
          clarificationStatus: i.clarification_status,
          hasUnreadComments: i.has_unread_comments || false,
        })));
      }

      if (submissionsRes.data) {
        const submissionsWithItems = await Promise.all(
          submissionsRes.data.map(async (s) => {
            const { data: items } = await supabase
              .from('budget_submission_items')
              .select('budget_item_id')
              .eq('submission_id', s.id);

            return {
              id: s.id,
              fromUnitId: s.from_unit_id,
              toUnitId: s.to_unit_id,
              status: s.status,
              budgetItemIds: items?.map(i => i.budget_item_id) || [],
              submittedAt: s.submitted_at ? new Date(s.submitted_at) : undefined,
            };
          })
        );
        setSubmissions(submissionsWithItems);
      }

      if (commentsRes.data) {
        setComments(commentsRes.data.map(c => ({
          id: c.id,
          budgetItemId: c.budget_item_id,
          authorId: c.author_id,
          authorName: c.author_name,
          content: c.content,
          createdAt: new Date(c.created_at),
          isResponse: c.is_response || false,
          parentCommentId: c.parent_comment_id || undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      setCurrentUser(users[0]);
    }
  }, [users, currentUser]);

  const addBudgetItem = async (item: Omit<BudgetItem, 'id'>) => {
    if (!currentUser) return;

    const { error } = await supabase.from('budget_items').insert({
      unit_id: item.unitId,
      budget_section: item.budgetSection,
      budget_division: item.budgetDivision,
      budget_chapter: item.budgetChapter,
      category: item.category,
      description: item.description,
      year: item.year,
      amount: item.amount,
      status: item.status,
      clarification_status: item.clarificationStatus,
    });

    if (error) {
      console.error('Error adding budget item:', error);
      return;
    }

    await refreshData();
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.comment !== undefined) dbUpdates.comment = updates.comment;
    if (updates.submittedTo !== undefined) dbUpdates.submitted_to = updates.submittedTo;
    if (updates.clarificationStatus) dbUpdates.clarification_status = updates.clarificationStatus;
    if (updates.hasUnreadComments !== undefined) dbUpdates.has_unread_comments = updates.hasUnreadComments;
    if (updates.amount) dbUpdates.amount = updates.amount;

    const { error } = await supabase
      .from('budget_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating budget item:', error);
      return;
    }

    await refreshData();
  };

  const submitBudget = async (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || !unit.parentId) return;

    const itemsToSubmit = budgetItems.filter(
      item => item.unitId === unitId && item.status === 'draft'
    );

    if (itemsToSubmit.length === 0) return;

    for (const item of itemsToSubmit) {
      await supabase
        .from('budget_items')
        .update({ status: 'pending', submitted_to: unit.parentId })
        .eq('id', item.id);
    }

    const { data: submission, error: submissionError } = await supabase
      .from('budget_submissions')
      .insert({
        from_unit_id: unitId,
        to_unit_id: unit.parentId,
        status: 'pending',
      })
      .select()
      .single();

    if (submissionError || !submission) {
      console.error('Error creating submission:', submissionError);
      return;
    }

    for (const item of itemsToSubmit) {
      await supabase.from('budget_submission_items').insert({
        submission_id: submission.id,
        budget_item_id: item.id,
      });
    }

    await refreshData();
  };

  const approveBudgetItem = async (itemId: string, comment?: string) => {
    await updateBudgetItem(itemId, {
      status: 'approved',
      comment: comment || undefined,
    });
  };

  const rejectBudgetItem = async (itemId: string, comment: string) => {
    await updateBudgetItem(itemId, {
      status: 'rejected',
      comment,
    });
  };

  const returnBudgetToChild = async (itemId: string, comment: string) => {
    await updateBudgetItem(itemId, {
      status: 'draft',
      comment,
      submittedTo: undefined,
    });
  };

  const forwardBudgetToParent = async (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || !unit.parentId) return;

    const descendantUnits = getAllDescendantUnits(unitId, units);
    const descendantUnitIds = [unitId, ...descendantUnits.map(u => u.id)];

    const itemsToForward = budgetItems.filter(
      item =>
        descendantUnitIds.includes(item.unitId) &&
        item.status === 'approved' &&
        item.submittedTo === unitId
    );

    if (itemsToForward.length === 0) return;

    for (const item of itemsToForward) {
      await supabase
        .from('budget_items')
        .update({ submitted_to: unit.parentId, status: 'pending' })
        .eq('id', item.id);
    }

    const { data: submission, error: submissionError } = await supabase
      .from('budget_submissions')
      .insert({
        from_unit_id: unitId,
        to_unit_id: unit.parentId,
        status: 'pending',
      })
      .select()
      .single();

    if (submissionError || !submission) {
      console.error('Error creating submission:', submissionError);
      return;
    }

    for (const item of itemsToForward) {
      await supabase.from('budget_submission_items').insert({
        submission_id: submission.id,
        budget_item_id: item.id,
      });
    }

    await refreshData();
  };

  const approveBudgetGroup = async (unitId: string, year: number, comment?: string) => {
    const { error } = await supabase
      .from('budget_items')
      .update({ status: 'approved', comment: comment || null })
      .eq('unit_id', unitId)
      .eq('year', year)
      .eq('status', 'pending');

    if (error) {
      console.error('Error approving budget group:', error);
      return;
    }

    await refreshData();
  };

  const rejectBudgetGroup = async (unitId: string, year: number, comment: string) => {
    const { error } = await supabase
      .from('budget_items')
      .update({ status: 'rejected', comment })
      .eq('unit_id', unitId)
      .eq('year', year)
      .eq('status', 'pending');

    if (error) {
      console.error('Error rejecting budget group:', error);
      return;
    }

    await refreshData();
  };

  const returnBudgetGroupToChild = async (unitId: string, year: number, comment: string) => {
    const { error } = await supabase
      .from('budget_items')
      .update({ status: 'draft', comment, submitted_to: null })
      .eq('unit_id', unitId)
      .eq('year', year)
      .eq('status', 'pending');

    if (error) {
      console.error('Error returning budget group:', error);
      return;
    }

    await refreshData();
  };

  const requestClarification = async (itemId: string, content: string) => {
    if (!currentUser) return;

    const { error } = await supabase.from('budget_comments').insert({
      budget_item_id: itemId,
      author_id: currentUser.id,
      author_name: currentUser.name,
      content,
    });

    if (error) {
      console.error('Error adding clarification:', error);
      return;
    }

    await updateBudgetItem(itemId, {
      clarificationStatus: 'requested',
      hasUnreadComments: true,
    });
  };

  const addComment = async (itemId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) return;

    const { error } = await supabase.from('budget_comments').insert({
      budget_item_id: itemId,
      author_id: currentUser.id,
      author_name: currentUser.name,
      content,
      is_response: !!parentCommentId,
      parent_comment_id: parentCommentId || null,
    });

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    const item = budgetItems.find(i => i.id === itemId);
    if (item && item.clarificationStatus === 'requested' && !parentCommentId) {
      await updateBudgetItem(itemId, {
        clarificationStatus: 'responded',
        hasUnreadComments: true,
      });
    } else {
      await updateBudgetItem(itemId, {
        hasUnreadComments: true,
      });
    }
  };

  const markCommentsAsRead = async (itemId: string) => {
    await updateBudgetItem(itemId, {
      hasUnreadComments: false,
    });
  };

  const resolveClarification = async (itemId: string) => {
    await updateBudgetItem(itemId, {
      clarificationStatus: 'resolved',
      hasUnreadComments: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        units,
        budgetItems,
        submissions,
        comments,
        loading,
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
        refreshData,
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
