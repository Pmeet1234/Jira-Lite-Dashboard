import React from 'react';

const priorities = ['LOW', 'MEDIUM', 'HIGH'];
const statuses = ['TODO', 'IN_PROGRESS', 'PEER_REVIEW', 'TESTING', 'DONE'];


function Filters({ filters, onFilterChange, onSearch, onClear, onToggleFilters }) {

const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
    onToggleFilters(); // Auto-close modal after applying filters
  };

  return (
    <div className="filters-panel">
      <div className="filters-panel-header">
        <h3>Filters</h3>
        <button className="filters-close-btn" onClick={onToggleFilters}>×</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div>
            <label className="filter-label">Status</label>
            {statuses.map(s => (
              <label key={s} className="filter-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={filters.statuses.includes(s)}
                  onChange={() => onFilterChange('statuses', s)}
                />
                {s.replace('_', ' ')}
              </label>
            ))}
          </div>
          <div>
            <label className="filter-label">Priority</label>
            {priorities.map(p => (
              <label key={p} className="filter-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={filters.priorities.includes(p)}
                  onChange={() => onFilterChange('priorities', p)}
                />
                {p}
              </label>
            ))}
          </div>

          <div>
            <label className="filter-label">Start Date From</label>
            <input
              className="filter-date-input"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="filter-label">Due Date To</label>
            <input
              className="filter-date-input"
              type="date"
              value={filters.dueDate}
              onChange={(e) => onFilterChange('dueDate', e.target.value)}
            />
          </div>
          </div>
        <div className="filters-panel-actions">
          <button type="submit" className="btn btn-primary">Apply Filters</button>
          <button type="button" onClick={onClear} className="btn btn-secondary">Clear All</button>
        </div>
      </form>
    </div>
  );

}

export default Filters;

