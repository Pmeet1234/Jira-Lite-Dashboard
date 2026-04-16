import React from "react";

function TaskCard({ task, onDragStart, onTaskClick }) {
  const handleDragStart = () => {
    onDragStart(task.id);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onTaskClick?.(task);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarStyle = (name) => {
    if (!name) return { background: "linear-gradient(135deg, #64748b, #475569)" };
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 35) % 360}, 78%, 45%))`,
    };
  };

  return (
    <div 
      className="card task-card"
      draggable={task.status !== 'DONE'}
      onDragStart={handleDragStart}
      onClick={handleClick}
      title="Click to view details"
      style={{cursor: task.status !== 'DONE' ? 'pointer' : 'default'}}
    >
      <div className="task-card-top">
        <h5 className="task-id">{task.taskId || 'N/A'}</h5>
        <span className="task-card-team-pill">{task.team || 'General'}</span>
      </div>

      <h4 className="card-title">{task.summary}</h4>

      <div className="task-card-people">
        <div className="task-person">
          <span className="card-avatar" style={getAvatarStyle(task.assignee)} title={task.assignee || "Unassigned"}>
            {getInitials(task.assignee)}
          </span>
          <span className="task-person-name">{task.assignee || "Unassigned"}</span>
        </div>
        <div className="task-person">
          <span className="card-avatar" style={getAvatarStyle(task.taskOwner)} title={task.taskOwner || "No owner"}>
            {getInitials(task.taskOwner)}
          </span>
          <span className="task-person-name">{task.taskOwner || "No owner"}</span>
        </div>
      </div>

      <div className="task-card-footer">
        <span className={`priority ${task.priority?.toLowerCase() || 'medium'}`}>
          <span className="priority-icon" aria-hidden="true"></span>
          {task.priority || 'MEDIUM'}
        </span>
        <span className="task-card-open">View details</span>
      </div>
    </div>
  );
}

export default TaskCard;
