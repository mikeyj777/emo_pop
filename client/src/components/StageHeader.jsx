import React from 'react';

const StageHeader = ({ currentStage = '', currentCategory = '' }) => {
  return (
    <header className="stage-header">
      <div className="stage-header-content">
        <div className="stage-title-container">
          <h1 className="stage-title fade-in">
            {currentStage}
          </h1>
        </div>
        
        <div className="category-title-container">
          <h2 className="category-title fade-in">
            {currentCategory}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default StageHeader;