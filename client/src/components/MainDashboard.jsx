import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CircleProgress from './ui/CircleProgress';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MainDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emotionsRes, needsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/emotions/${userId}?days=7`),
          fetch(`${API_BASE_URL}/api/needs/${userId}?days=7`)
        ]);

        if (!emotionsRes.ok || !needsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const emotionsData = await emotionsRes.json();
        const needsData = await needsRes.json();

        setEmotions(emotionsData);
        setNeeds(needsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const calculateStats = () => {
    // Sort emotions by date in descending order
    const sortedEmotions = [...emotions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Calculate totals
    const totalPositive = sortedEmotions.reduce((sum, day) => sum + day.positiveCount, 0);
    const totalNegative = sortedEmotions.reduce((sum, day) => sum + day.negativeCount, 0);
    const totalNeeds = needs.reduce((sum, day) => sum + day.needs, 0);
    const totalPops = totalPositive + totalNegative + totalNeeds;
    const positiveRatio = totalPops ? Math.round((totalPositive / totalPops) * 100) : 0;
    
    // Calculate streak with sorted data
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
  const isWithinOneDay = (dateStr1, dateStr2) => {
          const date1 = new Date(dateStr1);
          const date2 = new Date(dateStr2);
          const diffTime = Math.abs(date2 - date1);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 1;
      };

      for (const day of sortedEmotions) {
          if (isWithinOneDay(day.date, today) || streak > 0) {
              if (day.positiveCount > 0 || day.negativeCount > 0) {
                  streak++;
              } else {
                  break;
              }
          }
      }
      
      // Calculate needs met ratio
      const daysWithNeeds = needs.filter(day => day.needs > 0).length;
      const needsMetRatio = needs.length ? Math.round((daysWithNeeds / needs.length) * 100) : 0;
      
      return {
          streak,
          totalPops,
          positiveRatio,
          needsMetRatio
      };
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  const stats = calculateStats();

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {/* Current Streak */}
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Current Streak</div>
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-sublabel">days</div>
          </div>
        </div>

        {/* Total Pops */}
        <div className="stat-card wide">
          <div className="stat-content">
            <div className="stat-label">All Pops</div>
            <div className="stat-value">{stats.totalPops}</div>
            <div className="stat-sublabel">last 7 days</div>
          </div>
        </div>

        {/* Progress Rings */}
        <div className="stat-card">
          <CircleProgress 
            value={stats.positiveRatio} 
            color="#87CEEB"
            label="Positive Ratio" 
          />
        </div>

        <div className="stat-card">
          <CircleProgress 
            value={stats.needsMetRatio} 
            color="#FFE4B5"
            label="Needs Met" 
          />
        </div>
      </div>

      <div className="charts-grid">
        {/* Daily Activity */}
        <div className="chart-card">
          <h3>Daily Activity</h3>
          <div className="activity-chart">
            {emotions.map((day, index) => {
              const total = day.positiveCount + day.negativeCount;
              // If we only have one day, use a reasonable scale (e.g., out of 100)
              // Otherwise, scale relative to the maximum value across days
              const maxTotal = emotions.length === 1 ? 100 : Math.max(...emotions.map(d => d.positiveCount + d.negativeCount));
              const height = total ? (total / maxTotal) * 100 : 0;

              return (
                <div key={day.date} className="activity-bar-container">
                  <div 
                    className="activity-bar"
                    style={{ 
                      height: `${height}%`,
                      minHeight: total > 0 ? '4px' : '0'
                    }}
                  >
                    <span className="activity-value">{total}</span>
                  </div>
                  <span className="activity-label">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotions Balance */}
        <div className="chart-card">
          <h3>Emotions Balance</h3>
          <div className="balance-chart">
            <div 
              className="balance-positive"
              style={{ width: `${stats.positiveRatio}%` }}
            >
              <span>{stats.positiveRatio}%</span>
            </div>
            <div 
              className="balance-negative"
              style={{ width: `${100 - stats.positiveRatio}%` }}
            >
              <span>{100 - stats.positiveRatio}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="chart-card">
          <h3>Weekly Overview</h3>
          <div className="weekly-chart">
            {emotions.map((day) => {
              // Find the maximum value between positive and negative counts for proper scaling
              const maxValue = Math.max(
                ...emotions.map(d => Math.max(d.positiveCount, d.negativeCount))
              );
              
              return (
                <div key={day.date} className="day-column">
                  <div className="day-bars">
                    {day.positiveCount > 0 && (
                      <div 
                        className="positive-bar"
                        style={{ 
                          height: `${(day.positiveCount / maxValue) * 100}%`,
                          minHeight: day.positiveCount > 0 ? '4px' : '0'
                        }}
                      >
                        <span>{day.positiveCount}</span>
                      </div>
                    )}
                    {day.negativeCount > 0 && (
                      <div 
                        className="negative-bar"
                        style={{ 
                          height: `${(day.negativeCount / maxValue) * 100}%`,
                          minHeight: day.negativeCount > 0 ? '4px' : '0'
                        }}
                      >
                        <span>{day.negativeCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="activity-label">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Needs Overview */}
        <div className="chart-card">
          <h3>Needs Overview</h3>
          <div className="needs-chart">
            {needs.map((day, index) => (
              <div key={day.date} className="need-row">
                <span className="need-date">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div 
                  className="need-bar"
                  style={{ width: `${(day.needs / 10) * 100}%` }}
                >
                  <span className="need-value">{day.needs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* After your stats grid */}
      <button 
        className="journey-button"
        onClick={() => navigate(`/controller/${userId}`)}
      >
        the Journey Starts Here
      </button>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#87CEEB' }}></span>
          <span className="legend-label">Positive</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF7F50' }}></span>
          <span className="legend-label">Negative</span>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;