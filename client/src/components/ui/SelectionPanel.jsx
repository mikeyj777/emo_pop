// components/ui/SelectionPanel.jsx
import React from 'react';
import { ChevronUp, ChevronDown } from './Chevron';

const SelectionPanel = ({ 
  isVisible, 
  selectedMood, 
  selectedCategory, 
  onToggleVisibility 
}) => (
  <div className={`selection-panel ${isVisible ? 'visible' : ''}`}>
    <button
      onClick={onToggleVisibility}
      className="toggle-button"
    >
      {isVisible ? <ChevronDown /> : <ChevronUp />}
    </button>
    
    <div className="selection-content">
      <p className="selection-text">
        You're feeling <span className="mood-highlight">{selectedMood.mood}</span>
        <br />
        <span className="category-text">Category: {selectedCategory}</span>
      </p>
    </div>
  </div>
);

export default SelectionPanel;