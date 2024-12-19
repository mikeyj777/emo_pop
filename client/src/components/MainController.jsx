// MainController.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import EnhancedClusteringMoods from './EnhancedClusteringMoods';
import StageHeader from './StageHeader';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MainController = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [currentStage, setCurrentStage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [selections, setSelections] = useState({
    positive: [],
    negative: [],
    needs: []
  });

  const stages = [
    { 
      file: 'data/feelings_positive.csv',  // Updated path
      type: 'positive',  // Changed to lowercase for consistency
      title: 'Positive Feelings',
      categories: ['Elation and Excitement', 'Peaceful and Relaxed', 'Gratitude and Fulfillment', 
                  'Motivation and Determination', 'Contentment and Satisfaction']
    },
    { 
      file: 'data/feelings_negative.csv',  // Updated path
      type: 'negative',  // Changed to lowercase for consistency
      title: 'Challenging Feelings',
      categories: ['Anxiety and Worry', 'Depression and Despair', 'Anger and Frustration', 
                  'Fear and Insecurity', 'Exhaustion and Lethargy']
    },
    { 
      file: 'data/needs.csv',  // Updated path
      type: 'needs',
      title: 'Current Needs',
      categories: ['Safety', 'Spiritual', 'Recreation', 'Physical', 'Connection', 
                  'Autonomy', 'Integrity', 'Development']
    }
  ];

  useEffect(() => {
    loadCurrentStageData();
  }, [currentStage]);

  const loadCurrentStageData = async () => {
    try {
      // Instead of window.fs.readFile, use fetch with the public URL
      const response = await fetch(`${process.env.PUBLIC_URL}/${stages[currentStage].file}`);
      const text = await response.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Rest of your parsing logic remains the same
          const processedData = results.data.reduce((acc, item) => {
            const category = item.category;
            const value = item.feeling || item.need;
            
            if (category && value) {
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(value);
            }
            return acc;
          }, {});
          
          const formattedData = Object.entries(processedData).map(([category, items]) => ({
            category,
            items
          }));
          
          setCurrentData(formattedData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleSelectionComplete = async (selectedItems) => {
    const stageType = stages[currentStage].type;
    setSelections(prev => ({
      ...prev,
      [stageType]: selectedItems
    }));

    try {
      await axios.post(`${API_BASE_URL}/api/selections`, {
        userId,
        type: stageType,
        selections: selectedItems,
        timestamp: new Date().toISOString()
      });

      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
      } else {
        navigate(`/results/${userId}`);
      }
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };

  return (
    <div className="container">
      <StageHeader 
        stages={stages.map(stage => stage.title)}
        categories={stages[currentStage].categories}
        currentStage={currentStage}
      />
      
      <EnhancedClusteringMoods
        items={currentData}
        onSelectionComplete={handleSelectionComplete}
        categories={stages[currentStage].categories}
      />
    </div>
  );
};

export default MainController;