import React from 'react';

const StageHeader = ({ currentCategory = '', currentHeader = '' }) => {
  return (
    <header className="stage-header">
      <div className="stage-header-content">
        <div className="stage-title-container">
          <h1 className="stage-title fade-in">
            {currentCategory}
          </h1>
        </div>
        
        <div className="category-title-container">
          <h2 className="category-title fade-in">
            {currentHeader}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default StageHeader;