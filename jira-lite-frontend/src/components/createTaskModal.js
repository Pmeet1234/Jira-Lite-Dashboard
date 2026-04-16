import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import API from "../services/api";

Modal.setAppElement("#root");

const statuses = ["TODO", "IN_PROGRESS", "PEER_REVIEW", "TESTING", "DONE"];

function CreateTaskModal({ isOpen, onClose, refresh, initialForm }) {
  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const isEdit = !!initialForm;
  const defaultForm = useMemo(() => ({
    summary: initialForm?.summary || "",
    description: initialForm?.description || "",
    status: initialForm?.status || "TODO",
    priority: initialForm?.priority || "MEDIUM",
    taskOwner: initialForm?.taskOwner || "",
    assignee: initialForm?.assignee || "",
    team: initialForm?.team || "",
    startDate: normalizeDate(initialForm?.startDate) || new Date().toISOString().split("T")[0],
    dueDate: normalizeDate(initialForm?.dueDate) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }), [initialForm]);


  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen, defaultForm]);

  const validate = () => {
    const nextErrors = {};
    if (!form.summary.trim()) nextErrors.summary = "Summary is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.taskOwner.trim()) nextErrors.taskOwner = "Task owner is required.";
    if (!form.assignee.trim()) nextErrors.assignee = "Assignee is required.";
    if (!form.team.trim()) nextErrors.team = "Team is required.";
    if (!form.startDate) nextErrors.startDate = "Start date is required.";
    if (!form.dueDate) nextErrors.dueDate = "Due date is required.";
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
      nextErrors.dueDate = "Due date must be on/after start date.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && initialForm?.id) {
        await API.patch(`/tasks/${initialForm.id}`, form);
      } else {
        await API.post("/tasks", form);
      }
      setLoading(false);
      refresh();
      if (!isEdit) {
        // Success animation: clap/balloons
        const celebration = document.createElement('div');
        celebration.innerHTML = `
          <div style="
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 10001; pointer-events: none; font-size: 48px;
            animation: celebrate 2s ease-out forwards;
          ">
            🎉🎊✨ Task Created! ✨🎊🎉
          </div>
          <style>
            @keyframes celebrate {
              0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(1.2) rotate(10deg); opacity: 0; }
            }
            @keyframes balloonFloat {
              0% { transform: translateY(0) rotate(0deg); }
              100% { transform: translateY(-200vh) rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 3000);
      }
      onClose();
    } catch (error) {
      console.error(isEdit ? 'Update failed' : 'Create failed', error);
      setLoading(false);
    }
  };

const handleCancel = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleCancel} className="create-modal">
      <div className="modal-header">
        <h2>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
        <button className="close-btn" onClick={handleCancel}>×</button>
      </div>

      <div className="modal-body">
        {/* Task Details */}
        <div className="form-section">
          <h3>Task details</h3>
          <div className="form-group">
            <label>Summary *</label>
            <input 
              name="summary" 
              placeholder="Enter task summary" 
              value={form.summary}
              onChange={handleChange}
              className={`form-input ${errors.summary ? "field-error" : ""}`}
            />
            {errors.summary && <p className="error-text">{errors.summary}</p>}
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              placeholder="Enter description" 
              value={form.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? "field-error" : ""}`}
              rows={4}
            />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-select">
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-select priority-select">
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
              <span className={`priority-badge priority-${form.priority?.toLowerCase()}`}>
                {form.priority || 'MEDIUM'}
              </span>
            </div>
          </div>
        </div>

        {/* People */}
        <div className="form-section">
          <h3>People</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Task owner</label>
              <input 
                name="taskOwner" 
                placeholder="@username" 
                value={form.taskOwner}
                onChange={handleChange}
                className={`form-input ${errors.taskOwner ? "field-error" : ""}`}
              />
              {errors.taskOwner && <p className="error-text">{errors.taskOwner}</p>}
            </div>
            <div className="form-group">
              <label>Assignee</label>
              <input 
                name="assignee" 
                placeholder="@username" 
                value={form.assignee}
                onChange={handleChange}
                className={`form-input ${errors.assignee ? "field-error" : ""}`}
              />
              {errors.assignee && <p className="error-text">{errors.assignee}</p>}
            </div>
          </div>
          <div className="form-group">
            <label>Team</label>
            <input 
              name="team" 
              placeholder="Engineering" 
              value={form.team}
              onChange={handleChange}
              className={`form-input ${errors.team ? "field-error" : ""}`}
            />
            {errors.team && <p className="error-text">{errors.team}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="form-section">
          <h3>Dates</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Start date</label>
              <input 
                type="date" 
                name="startDate" 
                value={form.startDate}
                onChange={handleChange}
                className={`form-input date-input ${errors.startDate ? "field-error" : ""}`}
              />
              {errors.startDate && <p className="error-text">{errors.startDate}</p>}
            </div>
            <div className="form-group">
              <label>Due date</label>
              <input 
                type="date" 
                name="dueDate" 
                value={form.dueDate}
                onChange={handleChange}
                className={`form-input date-input ${errors.dueDate ? "field-error" : ""}`}
              />
              {errors.dueDate && <p className="error-text">{errors.dueDate}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          className="btn btn-secondary" 
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update' : 'Create'
          )}
        </button>
      </div>
    </Modal>
  );
}

export default CreateTaskModal;
