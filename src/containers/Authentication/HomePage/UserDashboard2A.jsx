import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import Sidebar from '../../../components/UserSideBar/index';
import UserHeader from '../../../components/UserHeader/index';

import './FRCRDashboard.css';

const FRCRDashboard = () => {
    const styles = {
        container: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        },
        header: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: 'white'
        },
        headerTitle: {
          fontSize: '20px',
          fontWeight: '600',
          color: '#4a5568'
        },
        saveButton: {
          border: '2px solid #4a5568',
          borderRadius: '50%',
          padding: '4px',
          cursor: 'pointer'
        },
        saveButtonHover: {
          backgroundColor: '#f7fafc'
        },
        notesContent: {
          padding: '16px 24px',
          borderTop: '1px solid #f1f1f1'
        },
        savedNote: {
          padding: '12px',
          marginBottom: '8px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          textAlign: 'start'
        },
        textareaWrapper: {
          display: 'flex',
          flexDirection: 'column'
        },
        textarea: {
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          minHeight: '80px',
          resize: 'vertical',
          outline: 'none',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: 'Poppins'
        },
        textareaFocus: {
          borderColor: '#38b2ac',
          boxShadow: '0 0 0 3px rgba(56, 178, 172, 0.2)'
        },
        helperText: {
          fontSize: '12px',
          color: '#718096',
          marginTop: '4px'
        },
        divider: {
          position: 'relative',
          height: '32px',
          backgroundColor: '#285e61',
          borderBottomLeftRadius: '100%',
          borderBottomRightRadius: '100%',
          transform: 'scaleX(1.1)'
        },
        quickFacts: {
          padding: '16px 24px',
          backgroundColor: '#f7fafc'
        },
        quickFactsTitle: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#4a5568',
          textAlign: 'center'
        },
        quickFactsContent: {
          marginTop: '16px',
          textAlign: 'center'
        },
        question: {
          color: '#4a5568'
        },
        answer: {
          fontSize: '20px',
          fontWeight: '600',
          marginTop: '24px'
        },
        bottomDivider: {
          position: 'relative',
          height: '32px',
          backgroundColor: '#e6fffa',
          opacity: '0.5',
          borderTopLeftRadius: '100%',
          borderTopRightRadius: '100%',
          transform: 'scaleX(1.1)'
        }
      };
  const daysLeft = 22;
  const months = [
    '0–10%', '11–20%', '21–30%', '31–40%', '41–50%', 
    '51–60%', '61–70%', '71–80%', '81–90%', '91–100%'
  ];

  const navigate = useNavigate();
  const userId = localStorage.getItem("profileId");
  //const module = localStorage.getItem("module");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_PA, is_Physics')
        .eq('id', userId)
        .single(); // use .single() if you're fetching one user's profile

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  const CircularProgress = ({ percent, label }) => {
    const dashOffset = 100 - percent;
  
    return (
      <div className="card">
        <h3 className="title">{label}</h3>
        <div className="circle-container">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${percent}, 100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="percentage-text">{percent}%</div>
        </div>
      </div>
    );
  };
  
  const Gauge = ({ percent, label, description }) => {
    const rotation = (percent / 100) * 180 - 90;
  
    return (
      <div className="card">
        <h3 className="title">{label}</h3>
        <div className="gauge-wrapper">
        <div className="gauge-percent">{percent}%</div>
          <div className="gauge">
            <div className="gauge-needle" style={{ transform: `rotate(${rotation}deg)` }} />
            <div className="gauge-circle" />
          </div>
          <div className="gauge-desc" style={{paddingTop: '50px', fontSize: '20px', fontWeight: '700px'}}>{description}</div>
        </div>
      </div>
    );
  };

  const [notes, setNotes] = useState(['Demo Note']);
  const [currentNote, setCurrentNote] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    setCurrentNote(e.target.value);
  };

  const handleSaveNote = () => {
    if (currentNote.trim()) {
      setNotes([...notes, currentNote]);
      setCurrentNote('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveNote();
    }
  };

  const handlePreviousSession = async () => {
    const { data, error } = await supabase
      .from('last_session')
      .select('id, open_session, session_id')
      .order('modified_at', { ascending: false })
      .limit(1)
      .single(); // returns a single object instead of array

    if (error) {
      console.error('Supabase error:', error.message);
      return;
    }

    if (data) {
    
      const { id, open_session, session_id } = data;

      if (open_session === '2A') {
        navigate('/mock_exam_2A_questions', {
          state: { sessionId: session_id }
        });
      } else {
        navigate(`/test_module_2A_questions/${open_session}`);
      }
    }
  };


  return (
    <div className="dashboard-container">
        
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <UserHeader profile={profile} />

        <h1 className="dashboard-title" style={{marginLeft: '50px', marginRight: '50px'}}>My Dashboard</h1>

        {/* Welcome Section */}
        <div className="dashboard-grid" style={{marginLeft: '50px', marginRight: '50px'}}>
          <div className="welcome-card grid-span-2">
            <div className="welcome-text">
              <h2>Hi {profile?.username},</h2>
              <p>Welcome to the ACE community. Get started with the largest question bank and ace your exam!</p>
            </div>
            <div className="welcome-image">
              <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//user_dashboard_main.png" alt="User Illustration" />
            </div>
          </div>

          {/* Score Cards */}
          <CircularProgress percent={41} label="Overall Score" />
          <Gauge percent={50} label="Overall Progress" description="Attempted Questions" />

        </div>

        {/* Buttons + Chart */}
        <div className="dashboard-chart-grid" style={{marginLeft: '50px', marginRight: '50px'}}>
            <div className="button-card">
                <div className="button-row">
                    <div className="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-big-icon lucide-library-big"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></svg>
                    </div>
                    <button>Test by Modules</button>
                </div>

                <div className="button-row">
                    <div className="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-notebook-pen-icon lucide-notebook-pen"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>
                    </div>
                    <button
                      onClick={() => navigate('/mock_exam_2A')}
                    >Mock Exam</button>
                </div>

                <div className="button-row">
                    <div className="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-fading-icon lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>
                    </div>
                    <button onClick={ handlePreviousSession }>Previous Session</button>
                </div>
            </div>

          <div className="chart-card grid-span-2">
            <h3>User's score graph</h3>
            <div className="chart-container">
            <svg className="chart-line" viewBox="0 0 360 150">
                {/* Bars */}
                <rect x="290" y="60" width="20" height="90" fill="red" />
                <rect x="330" y="50" width="20" height="100" fill="green" />

                {/* Polyline for scores */}
                <polyline
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    points="
                    10,140
                    50,130
                    90,100
                    130,80
                    170,60
                    210,80
                    250,100
                    290,120
                    330,140
                    "
                />
                </svg>


                <div className="chart-labels">
                    {months.map((month, index) => (
                    <div key={index} className="chart-month">{month}</div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* Notes & Facts */}
        <div className="dashboard-chart-grid" style={{marginLeft: '50px', marginRight: '50px'}}>
            <div className="notes-card">
                <h2>Overview</h2>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/1.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '10%'}}></div>
                    </div>
                </div>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/2_1.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '40%'}}></div>
                    </div>
                </div>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/3.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '20%'}}></div>
                    </div>
                </div>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/4.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '60%'}}></div>
                    </div>
                </div>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/6.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '60%'}}></div>
                    </div>
                </div>
                <div class="overview-row">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general/5.png" style={{width: '80px', height: '50px'}} />
                    <div class="progress">
                        <div class="bar" style={{width: '80%'}}></div>
                    </div>
                </div>
            </div>
            <div className="fact-card grid-span-2">
                {/* Notes Header */}
                <div style={styles.header}>
                    <h2 style={styles.headerTitle}>NOTES</h2>
                    <div 
                    style={{
                        ...styles.saveButton,
                        ...(isHovering ? styles.saveButtonHover : {})
                    }}
                    onClick={handleSaveNote}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    </div>
                </div>
                
                {/* Notes Content */}
                <div style={styles.notesContent}>
                    {/* Previous notes */}
                    {notes.map((note, index) => (
                    <div key={index} style={styles.savedNote}>
                        {note}
                    </div>
                    ))}
                    
                    {/* Current note textarea */}
                    <div style={styles.textareaWrapper}>
                    <textarea
                        value={currentNote}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter note here..."
                        style={{
                        ...styles.textarea,
                        ...(isFocused ? styles.textareaFocus : {})
                        }}
                        rows={3}
                    />
                    <p style={styles.helperText}>Press Ctrl+Enter to save or click the arrow</p>
                    </div>
                </div>
                
                {/* Divider */}
                <div style={styles.divider}></div>
                
                {/* Quick Facts */}
                <div style={styles.quickFacts}>
                    <h3 style={styles.quickFactsTitle}>QUICK FACTS!</h3>
                    
                    <div style={styles.quickFactsContent}>
                    <p style={styles.question}>Which is the best sequence to visualized bone marrow edema?</p>
                    
                    <div style={styles.answer}>
                        <p>T1W</p>
                    </div>
                    </div>
                </div>
                
                {/* Bottom Divider */}
                <div style={styles.bottomDivider}></div>
            </div>
        </div>

        {/* Subscription */}
        <div className="subscription-row" style={{marginLeft: '50px', marginRight: '50px'}}>
          <div style={{fontSize: '1.25rem'}}>{daysLeft} days until your subscription ends. <br /><span style={{fontSize: '1rem'}}>(01.04.2025 - 30.04.2025)</span></div>
          <button className="extend-button" style={{width: '50px !important'}}>Extend your subscription here</button>
        </div>

        <footer className="dashboard-footer">© 2025 ACEFRCR. All rights reserved.</footer>
      </main>
    </div>
  );
};

export default FRCRDashboard;
