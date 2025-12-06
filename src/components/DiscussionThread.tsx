import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../AppContext';
import { BudgetComment, BudgetItem } from '../mockData';

interface DiscussionThreadProps {
  budgetItem: BudgetItem;
  onClose?: () => void;
  showResolveButton?: boolean;
}

export function DiscussionThread({ budgetItem, onClose, showResolveButton }: DiscussionThreadProps) {
  const { comments, currentUser, addComment, resolveClarification, markCommentsAsRead } = useApp();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const itemComments = comments
    .filter(c => c.budgetItemId === budgetItem.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    addComment(budgetItem.id, newComment, replyingTo || undefined);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleResolve = () => {
    if (confirm('Czy na pewno chcesz oznaczyć tę dyskusję jako rozwiązaną?')) {
      resolveClarification(budgetItem.id);
      if (onClose) onClose();
    }
  };

  const handleMarkAsRead = () => {
    markCommentsAsRead(budgetItem.id);
  };

  const getClarificationStatusText = () => {
    switch (budgetItem.clarificationStatus) {
      case 'requested':
        return 'Oczekuje na wyjaśnienie';
      case 'responded':
        return 'Wyjaśnienie zostało dodane';
      case 'resolved':
        return 'Dyskusja rozwiązana';
      default:
        return 'Dyskusja';
    }
  };

  const getClarificationStatusColor = () => {
    switch (budgetItem.clarificationStatus) {
      case 'requested':
        return 'text-amber-600';
      case 'responded':
        return 'text-blue-600';
      case 'resolved':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Dyskusja</span>
          </h3>
          {budgetItem.hasUnreadComments && (
            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
              Nowe
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${getClarificationStatusColor()}`}>
            {getClarificationStatusText()}
          </p>
          <div className="flex items-center space-x-2">
            {budgetItem.hasUnreadComments && (
              <button
                onClick={handleMarkAsRead}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Oznacz jako przeczytane
              </button>
            )}
            {showResolveButton && budgetItem.clarificationStatus !== 'resolved' && itemComments.length > 0 && (
              <button
                onClick={handleResolve}
                className="flex items-center space-x-1 text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Rozwiąż</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">Kategoria:</span> {budgetItem.category}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Opis:</span> {budgetItem.description}
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto space-y-4">
        {itemComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Brak komentarzy. Rozpocznij dyskusję poniżej.</p>
          </div>
        ) : (
          itemComments.map(comment => {
            const isCurrentUser = comment.authorId === currentUser?.id;
            return (
              <div key={comment.id} className={`${comment.isResponse ? 'ml-8' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {comment.authorName}
                      {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(Ty)</span>}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  {!comment.isResponse && (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Odpowiedz
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between bg-blue-50 p-2 rounded">
            <span className="text-sm text-blue-700">Odpowiadasz na komentarz</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Anuluj
            </button>
          </div>
        )}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? 'Napisz odpowiedź...' : 'Dodaj komentarz...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Wyślij</span>
          </button>
        </div>
      </div>
    </div>
  );
}
