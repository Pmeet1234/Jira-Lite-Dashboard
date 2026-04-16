import React, { useEffect, useState, useCallback, useMemo } from "react";
import API from "../services/api";
import Column from "./column";
import CreateTaskModal from "./createTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import Filters from "./Filters";

const statuses = ["TODO", "IN_PROGRESS", "PEER_REVIEW", "TESTING", "DONE"];

function Board() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    statuses: [],
    priorities: [],
    startDate: '',
    dueDate: '',
    search: ''
  });


  const fetchTasks = useCallback(async () => {
    const res = await API.get("/tasks");
    setTasks(res.data.data || []);
  }, []);

  const applyFilters = useCallback((tasksList) => {
    return tasksList.filter(task => {
      // Statuses multi-select (OR match)
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;

      // Priorities multi-select (OR match)
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;

      // Date range
      if (filters.startDate) {
        const taskStart = new Date(task.startDate);
        const filterStart = new Date(filters.startDate);
        if (taskStart < filterStart) return false;
      }
      if (filters.dueDate) {
        const taskDue = new Date(task.dueDate);
        const filterDue = new Date(filters.dueDate);
        if (taskDue > filterDue) return false;
      }

      // Unified search: taskId, assignee, team (client fallback)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!task.taskId?.toLowerCase().includes(query) && 
            !task.id?.toString().includes(query) && 
            !task.assignee?.toLowerCase().includes(query) &&
            !task.team?.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const getActiveFilterCount = useCallback(() => {
    return (filters.statuses.length + filters.priorities.length + (filters.startDate ? 1 : 0) + (filters.dueDate ? 1 : 0));
  }, [filters]);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'statuses' || key === 'priorities') {
      setFilters(prev => {
        const current = prev[key] || [];
        const newVal = Array.isArray(value) ? value : current.includes(value) ? 
          current.filter(v => v !== value) : [...current, value];
        return { ...prev, [key]: newVal };
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, []);
  const handleSearch = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      filters.statuses.forEach(s => params.append('status', s));
      filters.priorities.forEach(p => params.append('priority', p));
      if (filters.search) params.append('search', filters.search);
      
      const res = await API.get(`/tasks/search?${params.toString()}`);
      // Always apply client-side filtering as final step to ensure consistency
      const finalFiltered = Array.isArray(res.data) ? applyFilters(res.data) : applyFilters(tasks);
      setFilteredTasks(finalFiltered);
    } catch (error) {
      console.error('Backend search failed:', error);
      const newFiltered = applyFilters(tasks);
      setFilteredTasks(newFiltered);
    }
  }, [filters, tasks, applyFilters]);


  const handleClear = useCallback(() => {
    setFilters({
      statuses: [],
      priorities: [],
      startDate: '',
      dueDate: '',
      search: ''
    });
    if (tasks.length > 0) {
      setFilteredTasks(tasks);
    }
  }, [tasks]);


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks.length > 0) {
      const newFiltered = applyFilters(tasks);
      setFilteredTasks(newFiltered);
    }
  }, [filters, tasks, applyFilters]);

  const handleDragStart = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDraggedTask(task);
  }, [tasks]);

  const handleDrop = useCallback(async (targetStatus) => {
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        await API.patch(`/tasks/${draggedTask.id}`, {
          status: targetStatus,
          ...(targetStatus === 'DONE' && { finishedAt: new Date().toISOString() })
        });
        fetchTasks();
      } catch (error) {
        console.error('Drop failed:', error);
      }
    }
    setDraggedTask(null);
  }, [draggedTask, fetchTasks]);

  const openDetail = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const allMembers = useMemo(() => {
    const names = [];
    tasks.forEach((task) => {
      if (task.assignee && !names.includes(task.assignee)) {
        names.push(task.assignee);
      }
    });
    return names;
  }, [tasks]);

  const teamMembers = allMembers.slice(0, 4);
  const extraMembers = Math.max(0, allMembers.length - teamMembers.length);

  return (
    <div className="board-shell">
      <div className="board-toolbar">
        <div className="filter-dropdown-wrap">
          <button
            className={`filter-fab ${showFilters ? 'active' : ''}`}
            onClick={handleToggleFilters}
          >
            <span className="filter-fab-icon">⚙</span>
            <span>Filters</span>
            <span className="filter-fab-count">{getActiveFilterCount()}</span>
          </button>
        </div>
        <div className="board-search-wrap">
          <span className="board-search-icon-plate" aria-hidden="true">
            <svg 
              className="board-search-icon"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
          <input
            className="board-search-input"
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
          />
        </div>
        <div className="toolbar-profiles" aria-label="Team profiles">
          {teamMembers.map((name, index) => (
            <span key={name} className={`toolbar-avatar avatar-tone-${index % 4}`} title={name}>
              {name.slice(0, 1).toUpperCase()}
            </span>
          ))}
          {extraMembers > 0 && (
            <span className="toolbar-avatar avatar-more" title={`${extraMembers} more members`}>
              +{extraMembers}
            </span>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-dropdown-panel" onClick={handleToggleFilters}>
          <div onClick={(e) => e.stopPropagation()}>
            <Filters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onClear={handleClear}
              onToggleFilters={handleToggleFilters}
            />
          </div>
        </div>
      )}

      <button className="create-btn" onClick={() => setModalOpen(true)}>
        + Create Task
      </button>

      <div className="board">

        {statuses.map((status) => (
          <Column 
            key={status} 
            status={status} 
            tasks={filteredTasks}
            draggedTask={draggedTask}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onTaskClick={openDetail}
          />
        ))}
      </div>

      <div className="filter-status">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        refresh={fetchTasks}
      />
      {selectedTask && (
        <TaskDetailModal
          isOpen={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
}

export default Board;

