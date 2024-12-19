import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const StatCard = ({ title, value, icon: Icon }) => (
  <div style={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1',
    minWidth: '200px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  }}>
    <div style={{ fontSize: '1.5rem' }}>{Icon}</div>
    <div>
      <h3 style={{ 
        color: 'white',
        fontSize: '0.875rem',
        opacity: '0.75',
        marginBottom: '0.25rem'
      }}>{title}</h3>
      <p style={{
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '500'
      }}>{value}</p>
    </div>
  </div>
);

function MainDashboard() {
  const [emotionData, setEmotionData] = useState([]);
  const [needsData, setNeedsData] = useState([]);
  const [daysToView, setDaysToView] = useState(7);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only include days parameter if it's positive
        const daysParam = daysToView > 0 ? `?days=${daysToView}` : '';
        const res = await axios.get(`${API_BASE_URL}/api/emotions/${userId}${daysParam}`);
        setEmotionData(res.data);
        console.info(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userId, daysToView]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only include days parameter if it's positive
        const daysParam = daysToView > 0 ? `?days=${daysToView}` : '';
        const res = await axios.get(`${API_BASE_URL}/api/needs/${userId}${daysParam}`);
        setNeedsData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userId, daysToView]);

  const handleTrackNewDay = () => {
    navigate('/track-new-day');
  };

  const handleReturnToLogin = () => {
    navigate('/');
  };

  const totalEmotions = emotionData.reduce((acc, day) => acc + day.positiveCount + day.negativeCount, 0);
  const positiveRatio = emotionData.length > 0
    ? (emotionData.reduce((acc, day) => acc + day.positiveCount, 0) / totalEmotions * 100).toFixed(1)
    : 0;

  const handleDaysChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setDaysToView(value);
  };

  return (
    <div className="container">
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>Emo Pop</h1>
        
        <p style={{
          textAlign: 'center',
          opacity: '0.75',
          marginBottom: '2rem'
        }}>Your daily path to emotional well-being</p>

        <button
          onClick={handleTrackNewDay}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.75rem',
            color: 'white',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          Please Start Your Journey by Clicking Here
        </button>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <StatCard title="Total Emotions" value={totalEmotions} icon="📊" />
          <StatCard title="Positive Ratio" value={`${positiveRatio}%`} icon="🌟" />
          <StatCard title="Days Tracked" value={emotionData.length} icon="📅" />
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1.5rem'
          }}>Emotion Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={emotionData}>
              <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.75)" />
              <YAxis stroke="rgba(255, 255, 255, 0.75)" />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="positiveCount" name="Positive" stroke="#6A65F2" strokeWidth={2} dot={{ fill: '#6A65F2', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="negativeCount" name="Negative" stroke="#E8489C" strokeWidth={2} dot={{ fill: '#E8489C', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1.5rem'
          }}>Needs Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={needsData}>
              <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.75)" />
              <YAxis stroke="rgba(255, 255, 255, 0.75)" />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="needs" name="Needs" stroke="#6A65F2" strokeWidth={2} dot={{ fill: '#6A65F2', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReturnToLogin}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Logout
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ color: 'white' }}>
              {daysToView <= 0 ? 'Showing all data' : 'Days to view:'}
            </span>
            <input
              type="number"
              value={daysToView}
              onChange={handleDaysChange}
              style={{
                width: '80px',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;