import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EnhancedClusteringMoods from "./EnhancedClusteringMoods";
import StageHeader from "./StageHeader";
import { loadEmotions, loadNeeds } from "../utils/getData";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const CATEGORY_DISPLAY_TIME = 30000;

const MainController = () => {
  // set state

  const { userId } = useParams();
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [stageData, setStageData] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [error, setError] = useState(null);

  // load data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [emotionsData, needsData] = await Promise.all([
                loadEmotions(),
                loadNeeds()
            ]);
            setEmotions(emotionsData);
            setNeeds(needsData);
        } catch (err) {
            setError(err.message);
        }
    };

    fetchData();
}, []);

if (error) return <div>Error: {error}</div>;

  

  // iterate across data

    // iterate across files

      // iterate across categories

  return  (
    <div className="main-controller">
      <StageHeader />
      <EnhancedClusteringMoods />
    </div>
  )

}

export default MainController;