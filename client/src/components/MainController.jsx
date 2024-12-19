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
      file: '../data/feelings_positive.csv', 
      type: 'Positive',
      title: 'Positive Feelings',
      categories: ['Elation and Excitement', 'Peaceful and Relaxed', 'Gratitude and Fulfillment', 
                  'Motivation and Determination', 'Contentment and Satisfaction']
    },
    { 
      file: '../data/feelings_negative.csv', 
      type: 'Negative',
      title: 'Challenging Feelings',
      categories: ['Anxiety and Worry', 'Depression and Despair', 'Anger and Frustration', 
                  'Fear and Insecurity', 'Exhaustion and Lethargy']
    },
    { 
      file: '../data/needs.csv', 
      type: 'Needs',
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
      const response = await window.fs.readFile(stages[currentStage].file, { encoding: 'utf8' });
      Papa.parse(response, {
        header: true,
        complete: (results) => {
          setCurrentData(results.data);
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

  // Pass stage titles and categories to StageHeader
  const stageTitles = stages.map(stage => stage.title);
  const currentCategories = stages[currentStage].categories;

  return (
    <div className="container">
      <StageHeader 
        stages={stageTitles}
        categories={currentCategories}
      />
      
      <EnhancedClusteringMoods
        items={currentData}
        onSelectionComplete={handleSelectionComplete}
      />
    </div>
  );
};

export default MainController;