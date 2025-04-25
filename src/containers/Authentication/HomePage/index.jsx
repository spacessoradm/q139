import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { ChevronDown, Check, ArrowUp } from "lucide-react"
import './index.css'

export default function HomePage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [plans, setPlans] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*");
      if (error) {
        console.error("Error fetching subscription plans:", error);
      } else {
        setPlans(data);
      }

      const { data: testimonialData, error: testimonialError } = await supabase
        .from("testimonials")
        .select("displayname, subject, content, profilepic_path")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching testimonials:", testimonialError);
      } else {
        setTestimonials(testimonialData);
      }
    };

    fetchPlans();

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
        .select("role_id, username, is_PA, is_Physics")
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

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem("profileId"); // Clear token
    setIsLoggedIn(false);
    window.location.href = "/homepage"; // Redirect to homepage (optional)
  };

  const handleAccept = () => {
    console.log("Button clicked! Hiding cookie notice...");
    setIsVisible(false);
  };

  return (
    <main className="main">
      {/* Top navigation bar */}

      {/* Main navigation */}
      <header className="main-nav" style={{ fontFamily: 'Poppins' }}>
                <div className="flex items-center">
                <a href="/homepage" className="logo">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" alt="logo" style={{ width: '100px', height: '100px' }} />
                </a>
                </div>

                <nav className="nav-menu">
                <div className="nav-item">
                    <span className="text-gray-600">About Us</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">Exams</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">Sample</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">FAQs</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">Contact Us</span>
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
                          style={{ padding: '6px' }}
                          href={isLoggedIn ? "exam" : "#"}
                          aria-disabled={!isLoggedIn}
                          onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation
                      >
                          2A Exam
                      </a>
                      <br />
                      <a
                          style={{ padding: '6px' }}
                          href={isLoggedIn ? "physicsexam" : "#"}
                          aria-disabled={!isLoggedIn}
                          onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation
                      >
                          Physics Exam
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
                  href={
                    isLoggedIn
                      ? userRole[0]?.is_Physics === true
                        ? "/userdashboardphysics"
                        : userRole[0]?.is_PA === true
                        ? "/userdashboard"
                        : "/homepage"
                      : "#"
                  }
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
                <a href="/login" className="btn btn-outline">
                    Sign in
                </a>
                <a href="/demo" className="btn btn-dashboard">
                    Try a Demo
                </a>
                </>
            )}
                </div>
      </header>

      {/* Hero section */}
      <section className="hero-section" style={{fontFamily: "Poppins"}}>
        <div className="hero-content">
          <h1 className="text-4xl font-bold text-secondary mb-6">
            Flexible and secure platform for comprehensive assessments
          </h1>
          <p className="text-secondary mb-8 text-lg">
            From exam creation to anti-cheating safeguards, AceFRCR provides organizations with all the tools they
            need to create tailored online assessments and conduct detailed evaluations of individuals—all within a
            single, powerful web platform.
          </p>
          <div className="flex flex-col sm-flex-row gap-4">
            <a href="/demo" className="btn btn-dashboard w-full sm-w-auto">
              Try a Demo
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute top-1/4 left-1/4 bg-white rounded-lg p-2 shadow-lg z-10" style={{ width: '32rem', margin: '10rem'}}>
                <div style={{ backgroundColor: "#6a1b9a" }} className="text-white text-xs p-1 rounded text-center">
                  English Test
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      style={{ backgroundColor: "#9c27b0" }}
                      className="text-white text-xs p-1 rounded w-20 text-center"
                    >
                      Reading
                    </div>
                    <div className="h-1 bg-gray-200 w-24"></div>
                    <div style={{ backgroundColor: "#9c27b0" }} className="h-2 w-2 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div
                      style={{ backgroundColor: "#9c27b0" }}
                      className="text-white text-xs p-1 rounded w-20 text-center"
                    >
                      Vocabulary
                    </div>
                    <div className="h-1 bg-gray-200 w-24"></div>
                    <div style={{ backgroundColor: "#e91e63" }} className="h-2 w-2 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div
                      style={{ backgroundColor: "#9c27b0" }}
                      className="text-white text-xs p-1 rounded w-20 text-center"
                    >
                      Listening
                    </div>
                    <div className="h-1 bg-gray-200 w-24"></div>
                    <div style={{ backgroundColor: "#2196f3" }} className="h-2 w-2 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      style={{ backgroundColor: "#9c27b0" }}
                      className="text-white text-xs p-1 rounded w-20 text-center"
                    >
                      Writing
                    </div>
                    <div className="h-1 bg-gray-200 w-24"></div>
                    <div style={{ backgroundColor: "#4caf50" }} className="h-2 w-2 rounded-full"></div>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-600 mt-1">
                  <span className="mr-4">Average: 92%</span>
                  <span>Anna: 78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof section */}
      <section className="py-16 px-8 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">Join the 5,000+ upgrading their evaluations</h2>
        <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
          Our clients enhance their assessments with added security and deeper insights
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 max-w-4xl mx-auto">
          <div className="w-32 h-16 relative grayscale opacity-70">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">B/S/H/</span>
            </div>
          </div>
          <div className="w-32 h-16 relative grayscale opacity-70">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">DHL</span>
            </div>
          </div>
          <div className="w-32 h-16 relative grayscale opacity-70">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">SIEMENS</span>
            </div>
          </div>
          <div className="w-32 h-16 relative grayscale opacity-70">
            <div className="absolute inset-0 flex items-center justify-center rounded-full border border-gray-300">
              <span className="text-xl font-bold text-gray-500">W</span>
            </div>
          </div>
          <div className="w-32 h-16 relative grayscale opacity-70">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-500">TOYOTA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-8 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">All-in-one assessment platform</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              AceFRCR provides a comprehensive solution for creating, delivering, and analyzing assessments with
              advanced security features.
            </p>
          </div>

          <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#e1f5fe" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0288d1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Exam Creation</h3>
              <p className="text-gray-600">
                Create sophisticated assessments with various question types, randomization, and conditional logic.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#e8f5e9" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#43a047"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Anti-Cheating</h3>
              <p className="text-gray-600">
                Prevent cheating with advanced proctoring, browser lockdown, and AI-powered monitoring.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#fff8e1" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffa000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20v-6M6 20V10M18 20V4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Analytics</h3>
              <p className="text-gray-600">
                Gain insights with detailed reports, item analysis, and performance metrics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#e8eaf6" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3949ab"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">User Management</h3>
              <p className="text-gray-600">
                Manage candidates, proctors, and administrators with role-based access control.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#ffebee" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e53935"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Security</h3>
              <p className="text-gray-600">
                Protect your assessments with encryption, secure authentication, and data protection.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: "#e0f7fa" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00acc1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Customization</h3>
              <p className="text-gray-600">
                Tailor the platform to your needs with branding, custom workflows, and integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases section */}
      <section className="py-16 px-8 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2d4654] mb-4">Trusted across industries</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              See how organizations use AceFRCR to transform their assessment processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3189b0] rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2d4654] mb-2">Education</h3>
              <p className="text-gray-600 mb-4">
                Schools and universities use AceFRCR for secure online exams, placement tests, and assessments.
              </p>
              <a href="#" className="text-[#3189b0] font-medium hover:underline flex items-center">
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3189b0] rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2d4654] mb-2">Corporate</h3>
              <p className="text-gray-600 mb-4">
                Companies rely on AceFRCR for employee assessments, certification programs, and skills testing.
              </p>
              <a href="#" className="text-[#3189b0] font-medium hover:underline flex items-center">
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3189b0] rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2d4654] mb-2">Government</h3>
              <p className="text-gray-600 mb-4">
                Government agencies use AceFRCR for civil service exams, regulatory assessments, and compliance
                testing.
              </p>
              <a href="#" className="text-[#3189b0] font-medium hover:underline flex items-center">
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2d4654] mb-4">
            What our customers say
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Hear from organizations that have transformed their assessment
            processes with AceFRCR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#f8f9fa] p-6 rounded-lg border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ffc107"
                    stroke="#ffc107"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>

              <p className="text-gray-600 italic mb-4 max-w-md">
                "{testimonial.content}"
              </p>

              {testimonial.profilepic_path ? (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/users/${testimonial.profilepic_path}`}
                  alt={testimonial.displayname}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}

              <p className="font-semibold text-[#2d4654] text-lg">
                {testimonial.displayname}
              </p>
              <p className="text-sm text-gray-500">{testimonial.subject}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Pricing section */}
      <section className="py-16 px-8 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2d4654] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Choose the plan that's right for your organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-[#2d4654] mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-[#3189b0] mb-1">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    <span className="text-sm font-normal text-gray-500">
                      / {plan.duration} days
                    </span>
                  </div>
                  <p className="text-gray-500">Best for {plan.name.toLowerCase()} users</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features &&
                    plan.features.split("\n").map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4caf50"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span className="text-gray-600">{feature.trim()}</span>
                      </li>
                    ))}
                </ul>
                <a
                  href="#"
                  className="block text-center bg-white border border-[#3189b0] text-[#3189b0] rounded-lg py-2 px-4 font-medium hover:bg-[#3189b0] hover:text-white transition-colors"
                >
                  Get started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2d4654] mb-4">Frequently asked questions</h2>
            <p className="text-gray-600">Find answers to common questions about AceFRCR</p>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d4654] mb-2">How secure is AceFRCR?</h3>
              <p className="text-gray-600">
                AceFRCR employs multiple layers of security including encryption, secure authentication, and advanced
                anti-cheating measures. Our platform is regularly audited and complies with industry standards for data
                protection.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d4654] mb-2">
                Can I customize the look and feel of my assessments?
              </h3>
              <p className="text-gray-600">
                Yes, AceFRCR offers extensive customization options. You can add your organization's logo, customize
                colors, and create branded assessment experiences that align with your organization's identity.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d4654] mb-2">What types of questions can I create?</h3>
              <p className="text-gray-600">
                AceFRCR supports a wide range of question types including multiple choice, essay, fill-in-the-blank,
                matching, ranking, hotspot, and many more. You can also include multimedia elements like images, audio,
                and video in your questions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d4654] mb-2">How does AceFRCR prevent cheating?</h3>
              <p className="text-gray-600">
                AceFRCR offers various anti-cheating features including browser lockdown, webcam proctoring, AI-based
                behavior monitoring, randomized questions and answer choices, time limits, and IP tracking to ensure the
                integrity of your assessments.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d4654] mb-2">
                Can AceFRCR integrate with my existing systems?
              </h3>
              <p className="text-gray-600">
                Yes, AceFRCR offers API access and integrations with popular LMS platforms, HR systems, and other
                tools. Our Enterprise plan includes custom integrations tailored to your specific needs.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="#"
              className="inline-block bg-[#3189b0] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#2a7a9d] transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d4654] text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative h-8 w-8 mr-2">
                  <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3189b0"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className="text-xl font-medium text-white">
                  Ace<span className="font-normal">FRCR</span>
                </span>
              </div>
              <p className="text-gray-300 mb-4">Flexible and secure platform for comprehensive assessments</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Updates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Exams
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Terms of service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" style={{ marginTop: '32px'}}>
            <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2025 AceFRCR. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cookie notice */}
      {isVisible && (
        <div className="cookie-notice">
          <div className="mb-4 sm-mb-0">
            <p className="font-medium mb-1">🍪 Cookie notice</p>
            <p className="text-sm">
              We use cookies to improve your experience on our website and the performance of our marketing activities.
              For more info please visit:
              <a href="/privacy" style={{ color: "#64b5f6" }} className="hover-underline ml-1">
                Privacy policy
              </a>
            </p>
          </div>
          <button
            className="btn"
            style={{ backgroundColor: "white", color: "#2d4654", width: "20%" }}
            onClick={handleAccept}
          >
            ACCEPT
          </button>
        </div>
      )}

      {/* WhatsApp button */}
      <button className="whatsapp-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </button>
    </main>
  )
}

