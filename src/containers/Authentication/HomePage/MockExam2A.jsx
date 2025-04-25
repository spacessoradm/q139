import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import UserHeader from '../../../components/UserHeader';
import UserSidebar from '../../../components/UserSideBar';

const MockExam2A = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("profileId");

  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);

  const [formData, setFormData] = useState({
    style: '',
    module: '',
    familiarity: '',
    number: '',
    timer: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_PA, is_Physics')
        .eq('id', userId)
        .single();
      if (!error) setProfile(data);
    };

    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('question_subcategory')
        .select('*')
        .eq('parent', 3);
      if (!error) setModules(data);
    };

    fetchProfile();
    fetchModules();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStart = async () => {
    let questions = [];
  
    if (formData.style === 'Standard') {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_type', 'single')
        .limit(120);
  
      if (!error) {
        questions = data;
      }
  
    } else if (formData.style === 'Test by Module') {
      if (!formData.module || !formData.familiarity) {
        alert("Please complete all fields for 'Test by Module' mode.");
        return;
      }
  
      let query = supabase
        .from('exam_a_records')
        .select('question_id')
        .eq('user_id', userId)
        .eq('subcategory_name', "2A");
  
      if (formData.familiarity === 'Correct') {
        query = query.eq('result', true);
      } else if (formData.familiarity === 'Incorrect') {
        query = query.eq('result', false);
      }
  
      const { data: records, error: recordsError } = await query;
  
      if (!recordsError) {
        const questionIds = records.map(r => r.question_id);
  
        if (questionIds.length === 0 || formData.familiarity === 'All') {
          const { data: moduleQuestions, error: moduleError } = await supabase
            .from('questions')
            .select('*')
            .eq('module', formData.module);
  
          if (!moduleError) {
            questions = moduleQuestions;
          }
        } else {
          const { data: filteredQuestions, error: filterError } = await supabase
            .from('questions')
            .select('*')
            .in('id', questionIds);
  
          if (!filterError) {
            questions = filteredQuestions;
          }
        }
      }
    }
  
    // Limit questions
    const number = parseInt(formData.number);
    const selectedNumber = isNaN(number) ? 30 : number;
    const limitedQuestions = questions.slice(0, selectedNumber);
    const questionIds = limitedQuestions.map(q => q.id);
  
    // Timer logic
    const now = new Date();
    const endTime = formData.timer === 'On'
      ? new Date(now.getTime() + selectedNumber * 60 * 1000)
      : null;
  
    // Save to exam_sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('exam_sessions')
      .insert([{
        user_id: userId,
        style: formData.style,
        module: formData.module || null,
        familiarity: formData.familiarity || null,
        number_of_questions: selectedNumber,
        timer_on: formData.timer === 'On',
        start_time: now.toISOString(),
        end_time: endTime ? endTime.toISOString() : null,
        question_ids: questionIds,
      }])
      .select()
      .single();
  
    if (sessionError) {
      console.error('Error saving exam session:', sessionError.message);
      return;
    }
    
    console.log(sessionData.id);
    // Navigate with session ID
    navigate('/mock_exam_2A_question', {
      state: {
        sessionId: sessionData.id
      }
    });
  };
  
  
  return (
    <div className="dashboard-container">
      <UserSidebar />
      <main className="main-content">
        <UserHeader profile={profile} />

        <div style={{
          backgroundColor: '#f3f3f3',
          maxWidth: '800px',
          margin: '50px auto',
          borderRadius: '30px',
          padding: '40px 30px',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#333' }}>
            MOCK EXAM - Question Filter
          </h2>

          {/* Dropdown Row */}
          {[
            { label: 'Styles*', name: 'style', options: ['Standard', 'Test by Module'] },
            { label: 'Modules', name: 'module', options: modules.map(mod => mod.subcategory_name) },
            { label: 'Familiarity', name: 'familiarity', options: ['All', 'Correct', 'Incorrect'] },
            { label: 'Numbers of Questions', name: 'number', options: ['10 questions', '30 questions', '60 questions', '90 questions'] },
            { label: 'Timer', name: 'timer', options: ['On', 'Off'] }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', margin: '15px 0' }}>
              <div style={{
                backgroundColor: '#007a78',
                color: '#fff',
                width: '300px',
                padding: '12px',
                borderTopLeftRadius: '5px',
                borderBottomLeftRadius: '5px',
                fontWeight: 'bold'
              }}>
                {item.label}
              </div>
              <select
                name={item.name}
                value={formData[item.name]}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: 'none',
                  backgroundColor: '#e6e6e6',
                  borderTopRightRadius: '5px',
                  borderBottomRightRadius: '5px',
                  width: '500px',
                }}
              >
                <option
                    value="">Please Select</option>
                {item.options.map((option, i) => (
                  <option key={i} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Start Button */}
          <button
            onClick={handleStart}
            style={{
              marginTop: '30px',
              width: '100%',
              padding: '15px',
              backgroundColor: '#007a78',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start
          </button>
        </div>
      </main>
    </div>
  );
};

export default MockExam2A;
