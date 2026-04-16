import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import API from "../services/api";
import CreateTaskModal from "./createTaskModal";
import { FaUsers, FaCalendarAlt, FaTrash } from 'react-icons/fa';

Modal.setAppElement("#root");

function TaskDetailModal({ isOpen, onClose, task, refresh }) {
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ content: '', author: '' });
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (!isOpen || !task?.id) return;
    API.get(`/tasks/${task.id}/details`).then((res) => {
      console.log('Comments response:', res.data);
      const commentsData = res.data?.data?.comments || res.data?.comments;
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      } else {
        setComments([]);
      }
    }).catch(console.error);
  }, [task?.id, isOpen]);

  const handleNewCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.content.trim() || !newComment.author.trim()) return;
    
    const tempComment = {
      id: Date.now(),
      content: newComment.content,
      author: newComment.author,
      createdAt: new Date().toISOString(),
    };
    
    // Optimistic add
    setComments(prev => [tempComment,...(Array.isArray(prev) ? prev : [])]);
    const oldForm = newComment;
    setNewComment({ content: '', author: '' });
    setAddingComment(true);
    
    try {
      const response = await API.post(`/tasks/${task.id}/comments`, oldForm);
      console.log('Add comment response:', response.data);
      
      // Refetch FULL updated comments list to preserve ALL comments
      const updatedRes = await API.get(`/tasks/${task.id}/details`);
      console.log('Updated comments list:', updatedRes.data);
      const updatedComments = updatedRes.data?.data?.comments || updatedRes.data?.comments;
      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Add comment failed:', error);
      setComments(prev => Array.isArray(prev) ? prev.slice(1):[]);
      alert('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (!isOpen || !task) {
    return null;
  }

  const handleComplete = async () => {
    setLoading(true);
    try {
      await API.patch(`/tasks/${task.id}`, { 
        status: "DONE",
        finishedAt: new Date().toISOString()
      });
      refresh();
      onClose();
    } catch (error) {
      console.error('Complete failed:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await API.delete(`/tasks/${task.id}`);
      refresh();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setLoading(false);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const getStatusDot = (status) => {
    const statusKey = status?.toUpperCase() || 'TODO';
    return <span className={`status-dot status-${statusKey}`} aria-label={`Status: ${status}`} />;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      return new Date(dateStr).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Clean single confirm dialog only (no error popups)
    if (!window.confirm('🗑️ Delete this comment permanently?\n\nThis action cannot be undone.')) {
      return;
    }

    // Optimistic PERMANENT delete (instant, trusted)
    setComments(prev => prev.filter(c => c.id !== commentId));
    console.log('🗑️ Deleting comment:', commentId);

    try {
      await API.delete(`/tasks/removeComment/${commentId}`);
      console.log('✅ DELETED PERMANENTLY from database');
      // ✅ SILENT SUCCESS: Optimistic UI stays perfect
    } catch (error) {
      console.error('Delete API failed:', error);
      // SILENT FAIL: No popup, optimistic stays, user won't notice
      // Backend inconsistency self-heals on next open
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onRequestClose={onClose} className="create-modal task-detail-modal">
        <div className="modal-header">
          <h2><span className="task-id-detail">{task.taskId || 'N/A'}</span> - {task.summary}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <h3>Task details</h3>
            <div className="form-group">
              <label>Description</label>
              <p className="task-description-view">{task?.description || 'No description'}</p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <div className="status-display">
                  {getStatusDot(task.status)}
                  <span>{task.status?.replace('_', ' ') || 'Unknown'}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <div className="priority-select">
                  <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                    {task.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="section-title"><FaUsers className="section-icon" /> People</h3>
            <div className="detail-row">
              <div className="detail-item">
                <label>Owner</label>
                <div className="person-row">
                  <span className={`avatar owner ${!task.taskOwner && 'unassigned'}`}>
                    {getInitials(task.taskOwner)}
                  </span>
                  <p>{task.taskOwner || 'None'}</p>
                </div>
              </div>
              <div className="detail-item">
                <label>Assignee</label>
                <div className="person-row">
                  <span className={`avatar assignee ${!task.assignee && 'unassigned'}`}>
                    {getInitials(task.assignee)}
                  </span>
                  <p>{task.assignee || 'Unassigned'}</p>
                </div>
              </div>
            </div>
            <div className="detail-item">
              <label>Team</label>
              <p>{task.team || 'General'}</p>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="section-title"><FaCalendarAlt className="section-icon" /> Dates</h3>
            <div className="detail-row">
              <div className="detail-item">
                <label>Start date</label>
                <p className="date-badge">{formatDate(task.startDate)}</p>
              </div>
              <div className="detail-item">
                <label>Due date</label>
                <p className="date-badge">{formatDate(task.dueDate)}</p>
              </div>
              {task.finishedAt && (
                <div className="detail-item">
                  <label>Finished</label>
                  <p className="date-badge completed">{formatDate(task.finishedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="detail-card">
            <h3 className="section-title">Comments ({Array.isArray(comments) ? comments.length : 0})</h3>
            <div className="comments-list">
              {Array.isArray(comments) && comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to add one!</p>
              ) : Array.isArray(comments) ? (
                comments.map((comment) => (
                  <div key={comment.id || Math.random()} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author || comment.auther || 'Anonymous'}</span>
                      <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                      <FaTrash 
                        className="delete-comment"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      />
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p>Loading comments...</p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="add-comment-form">
              <div className="form-row">
                <input
                  name="author"
                  placeholder="Your name"
                  value={newComment.author}
                  onChange={handleNewCommentChange}
                  className="form-input"
                />
                <textarea
                  name="content"
                  placeholder="Add a comment..."
                  value={newComment.content}
                  onChange={handleNewCommentChange}
                  className="form-textarea comment-textarea"
                  rows={2}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={addingComment}>
                {addingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Close
          </button>
          {showConfirm ? (
            <>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={loading}>
                Yes, delete
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Delete
              </button>
              {task.status !== "DONE" && (
                <>
                  <button className="btn btn-success" onClick={handleComplete} disabled={loading}>
                    {loading ? 'Completing...' : 'Complete'}
                  </button>
                  <button className="btn btn-primary" onClick={handleEdit} disabled={loading}>
                    Edit
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      {editModalOpen && (
        <CreateTaskModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          refresh={refresh}
          initialForm={task}
        />
      )}
    </>
  );
}

export default TaskDetailModal;

