import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';
import { ChevronDown, Check, ArrowUp } from "lucide-react"

const ExamRecords = () => {

  // navigation stuff here
  const userId = localStorage.getItem("profileId");
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [progress, setProgress] = useState([]);
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  // navigation stuff here
    const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    };
    
    const handleSignOut = () => {
        localStorage.removeItem("profileId"); // Clear token
        setIsLoggedIn(false);
        window.location.href = "/Chiongster/homepage"; // Redirect to homepage (optional)
    };
    
    const handleAccept = () => {
        console.log("Button clicked! Hiding cookie notice...");
        setIsVisible(false);
    };

    useEffect(() => {
        // Check if user is logged in
        const profileId = localStorage.getItem("profileId");
        setIsLoggedIn(!!profileId);

        const fetchCategories = async () => {
        const { data, error } = await supabase
            .from("tbl_sequence")
            .select("category")
            .neq("category", "Demo Question")
            .order("category", { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error);
        } else {
            setCategories(data);
        }

        const { data: userRoleData, error: userRoleDataError } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", profileId);


        console.log(userRoleData);

        if (userRoleDataError) {
          console.error("Error fetching role data:", userRoleDataError);
        } else {
          setUserRole(userRoleData);
        }
      };

        if (profileId) {
        fetchCategories();
        }
    }, []);

  // Table of each exam question records
  const [selectedExam, setSelectedExam] = useState(null);
  const [questionDetails, setQuestionDetails] = useState([]);

  // Popup for details
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchProgress(page);
  }, [page]);

  const fetchProgress = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) throw new Error("Profile ID not found in localStorage");

      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data, error } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('user_id', profileId)
        .range(start, end);

      if (error) throw error;

      // Ensure progress_data is parsed properly if it's a string
      const parsedData = data.map(item => ({
        ...item,
        progress_data: typeof item.progress_data === 'string' 
          ? JSON.parse(item.progress_data) 
          : item.progress_data
      }));

      const { count } = await supabase
        .from('user_quiz_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profileId);

      setTotalPages(Math.ceil(count / limit));
      setProgress(parsedData);
      setFilteredProgress(parsedData);
    } catch (error) {
      showToast("Failed to fetch quiz progress.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredProgress(term ? progress.filter(item => item.quiz_title.toLowerCase().includes(term)) : progress);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchProgress(newPage);
    }
  };

  const handleCardClick = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    
    try {
      if (!exam.progress_data?.questionOrder?.length) {
        setQuestionDetails([]);
        return;
      }
  
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('id', exam.progress_data.questionOrder);
  
      if (error) throw error;
  
      // Sort questions to match progress_data.questionOrder order
      const orderedQuestions = exam.progress_data.questionOrder.map(
        (id) => data.find(q => q.id === id)
      );
  
      setQuestionDetails(orderedQuestions);
    } catch (error) {
      showToast("Failed to fetch question details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (question, userAnswer, correctAnswer) => {
    console.log("Selected Question:", question);
    setSelectedQuestion({
      ...question,
      userAnswer,
      correctAnswer,
      options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options
    });
    setShowModal(true);
  };
  
  return (
    <main className="main">
            {/* Top navigation bar */}

            {/* Main navigation */}
            <header className="main-nav" style={{ fontFamily: 'Poppins' }}>
                <div className="flex items-center">
                <a href="/Chiongster/homepage" className="logo">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" alt="logo" style={{ width: '100px', height: '100px' }} />
                </a>
                </div>

                <nav className="nav-menu">
                <div className="nav-item">
                    <span className="text-gray-600">Product</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">Use cases</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <a href="#" className="nav-link">
                    Pricing
                </a>
                <div className="nav-item">
                    <span className="text-gray-600">Resources</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                {isLoggedIn && (
                <div className="nav-item relative">
                    <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                    <span className="text-gray-600">Question Bank</span>
                    <ChevronDown
                        className={`h-4 w-4 ml-1 text-gray-600 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                    </div>

                    {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <a
                          href={isLoggedIn ? "../exam" : "#"}
                          aria-disabled={!isLoggedIn}
                          onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation
                      >
                          2A Exam
                      </a>
                    </div>
                    )}
                </div>
                )}
                </nav>

                <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                <>
                <a
                    href={isLoggedIn ? (userRole[0]?.role_id === 1 ? "admin/dashboard" : "examrecords") : "#"}
                    className={`btn btn-dashboard ${!isLoggedIn ? "disabled-link" : ""}`}
                    aria-disabled={!isLoggedIn}
                    onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation when not logged in
                >
                    Dashboard
                </a>

                <button onClick={handleSignOut} className="btn btn-outline">
                    Sign Out
                </button>
                </>
            ) : (
                <>
                <a href="/Chiongster/login" className="btn btn-outline">
                    Sign in
                </a>
                <a href="/Chiongster/demo" className="btn btn-primary">
                    Try a Demo
                </a>
                </>
            )}
                </div>
            </header>
            <div className='whole-page' style={{ fontFamily: 'Poppins' }}>
              <p className='title-page'>Exam Records</p>
              <p className='subtitle-page'>View your exam history and scores.</p>

              <div hidden={true} ><SearchBar 
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onRefresh={() => fetchProgress(page)}
              /></div>

              {loading && <p className='loading-message'>Loading progress...</p>}
              {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

              <div className="blog-grid">
                {filteredProgress.length > 0 ? (
                  <>
                    <div className="grid-container">
                      {filteredProgress.map((item) => (
                        <div key={item.id} className="blog-card" onClick={() => handleCardClick(item)}>
                          <div className="blog-content">
                            <h3 className="blog-title">{new Date(item.created_at).toLocaleDateString()}</h3>
                            <p className="sub-title">No of Attempt: {item.cycle}</p>
                            <p className="sub-title">Score: {item.progress_data?.correctAnswersCount ?? 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

                    {selectedExam && (
                      <div className="exam-details">
                        <h3>Exam Details - {new Date(selectedExam.created_at).toLocaleDateString()}</h3>
                        <table className="exam-table">
                          <thead>
                            <tr>
                              <th>Question</th>
                              <th>Your Answer</th>
                              <th>Correct Answer</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questionDetails
                              .filter((question, index) => selectedExam.progress_data.selectedAnswers?.[index]) // Remove unanswered questions
                              .map((question, index) => {
                                const userAnswer = selectedExam.progress_data.selectedAnswers?.[index];
                                const correctAnswer = question.correct_answer;

                                return (
                                  <tr key={question.id} onClick={() => handleRowClick(question, userAnswer, correctAnswer)} style={{ cursor: "pointer" }}>
                                    <td>{question.question_text}</td>
                                    <td>{userAnswer}</td>
                                    <td>{correctAnswer}</td>
                                    <td>
                                      {selectedExam.progress_data.correctQuestions.includes(index) ? (
                                        <span className="correct">✔ Correct</span>
                                      ) : (
                                        <span className="incorrect">✘ Incorrect</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>

                        </table>
                      </div>
                    )}

                    {showModal && selectedQuestion && (
                      <div className="modal-overlay">
                        <div className="modal-content">
                          <h4>Question:</h4>
                          <h3>{selectedQuestion.question_text}</h3>

                          <p style={{color: 'black', fontSize: '13px', paddingTop: '16px'}}>Options</p>
                          <ul className="options-list">
                            {Array.isArray(selectedQuestion?.options) ? (
                              selectedQuestion.options.map((option, index) => {
                                const optionLetter = String.fromCharCode(65 + index); // Convert 0 -> A, 1 -> B, etc.
                                const isCorrect = optionLetter === selectedQuestion.correctAnswer;
                                const isSelected = optionLetter === selectedQuestion.userAnswer;

                                return (
                                  <li key={index} className={`option ${isCorrect ? "correct-answer" : isSelected ? "wrong-answer" : ""}`}>
                                    <strong>{optionLetter}.</strong> {option}
                                  </li>
                                );
                              })
                            ) : (
                              <p>No options available</p>
                            )}
                          </ul>
                          <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                      </div>
                    )}

                  </>
                ) : (
                  !loading && <p>No exam progress found.</p>
                )}
              </div>
            </div>
          </main>
  );
};

export default ExamRecords;
