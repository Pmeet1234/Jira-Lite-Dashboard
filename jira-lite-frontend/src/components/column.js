import React from "react";
import TaskCard from "./taskCard";
import { FaListUl, FaSpinner, FaUserCheck, FaVial, FaCheckCircle } from "react-icons/fa";

const statusIcons = {
  TODO: <FaListUl />,
  IN_PROGRESS: <FaSpinner />,
  PEER_REVIEW: <FaUserCheck />,
  TESTING: <FaVial />,
  DONE: <FaCheckCircle />
};

function Column({ status, tasks, draggedTask, onDragStart, onDrop, onTaskClick }) {
  const filtered = tasks.filter((t) => t.status === status);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(status);
  };

  const isDraggingOver = draggedTask && draggedTask.status !== status;

  return (
    <div 
      className={`column ${isDraggingOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3>
        <span className="column-title-left">
          <span className="column-status-icon">{statusIcons[status] || <FaListUl />}</span>
          <span>{status.replace('_', ' ')}</span>
        </span>
        <span>{filtered.length}</span>
      </h3>


      {filtered.map((task) => (
        <TaskCard key={task.id} task={task} onDragStart={onDragStart} onTaskClick={onTaskClick} />
      ))}
      
      {draggedTask && !isDraggingOver && (
        <div className="drop-hint">Drop here to change to {status}</div>
      )}
    </div>
  );
}

export default Column;
