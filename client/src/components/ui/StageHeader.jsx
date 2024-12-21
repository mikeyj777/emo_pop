import React from 'react';

const StageHeader = ({ currentCategory = '', currentHeader = '' }) => {
  const instruction = {
    'positive': "Pop the Positive Emotions that you're connecting with.",
    'negative': "Pop any Negative Emotions that you may be feeling.",
    'needs': "Pop any Needs that you may have.",
  };
  
  return (
    <header className="stage-header">
      <div className="stage-header-content">
        <div className="stage-title-container">
          <h1 className="stage-title fade-in">
            {currentCategory}
          </h1>
        </div>

        <div className="stage-title-container">
          <h1 className="stage-title fade-in">
            {instruction[currentCategory]}
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