import { useEffect, useState } from "react";
import supabase from "../../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./index.css";

const AdminDashboard = () => {
    const [adminUser, setAdminUser] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    const [questionStats, setQuestionStats] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;

    const [topCorrectQuestions, setTopCorrectQuestions] = useState([]);
    const [topIncorrectQuestions, setTopIncorrectQuestions] = useState([]);
    const [latestSubscriptions, setLatestSubscriptions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminUser = async () => {
            const ur = localStorage.getItem("role");
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching admin user:", error.message);
                navigate("/login");
            } else {
                const user = data?.session?.user || null;
                if (ur !== "admin") {
                    navigate("/");
                } else {
                    setAdminUser(user);
                }
            }
        };

        const fetchStats = async () => {
            // Fetch total users, questions, revenue, and categories
            const { count: usersCount } = await supabase.from("profiles").select("id", { count: "exact" });
            setTotalUsers(usersCount || 0);
        
            const { count: questionsCount } = await supabase.from("questions").select("id", { count: "exact" });
            setTotalQuestions(questionsCount || 0);
        
            const { data: revenueData } = await supabase.from("transactions").select("amount");
            setTotalRevenue(revenueData ? revenueData.reduce((acc, t) => acc + t.amount, 0) : 0);
        
            // Fetch question subcategories
        const { data: subcategories, error: subcategoryError } = await supabase
            .from("question_subcategory")
            .select("*");

        if (subcategoryError) {
            console.error("Error fetching subcategories:", subcategoryError);
            return;
        }

        // Map parentis values to specific category names
        const mappedSubcategories = subcategories.map(subcategory => {
            let categoryName = subcategory.name; // Default to the subcategory name
            if (subcategory.parentis === 3) {
                categoryName = "2A";
            } else if (subcategory.parentis === 4) {
                categoryName = "Physics";
            }
            return { ...subcategory, categoryName };
        });

        // Fetch questions
        const { data: questions, error: questionsError } = await supabase
            .from("questions")
            .select("category");

        if (questionsError) {
            console.error("Error fetching questions:", questionsError);
            return;
        }

        // Count how many questions match each mapped subcategory
            const questionCounts = questions.reduce((acc, question) => {
            acc[question.category] = (acc[question.category] || 0) + 1;
            return acc;
        }, {});

            // Transform data to fit PieChart format
            const transformedData = mappedSubcategories.map(subcategory => ({
            name: subcategory.name, // Original subcategory name
            value: questionCounts[subcategory.categoryName] || 0, // Count from questions table
            }));

            console.log("Transformed Data for PieChart:", transformedData);
            setQuestionStats(transformedData);


            const { data: profilesData, error: profilesDataError } = await supabase
                .from("profiles")
                .select("*");

            setUsers(profilesData)
        
            // Fetch top 5 most correctly answered questions
            const { data: correctData, error: correctError } = await supabase
                .from("questions")
                .select("unique_code, correct")
                .order("correct", { ascending: false })
                .limit(5);
        
            if (correctError) {
                console.error("Error fetching top correct questions:", correctError.message);
            } else {
                setTopCorrectQuestions(correctData.map(q => ({ name: q.unique_code, value: q.correct })));
            }
        
            // Fetch top 5 most incorrectly answered questions
            const { data: incorrectData, error: incorrectError } = await supabase
                .from("questions")
                .select("unique_code, incorrect")
                .order("incorrect", { ascending: false })
                .limit(5);
        
            if (incorrectError) {
                console.error("Error fetching top incorrect questions:", incorrectError.message);
            } else {
                setTopIncorrectQuestions(incorrectData.map(q => ({ name: q.unique_code, value: q.incorrect })));
            }
        };
        

        fetchAdminUser();
        fetchStats();
    }, [navigate]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#ff7300"];

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            {adminUser && <p>Welcome, Admin {adminUser.email}</p>}

            <div className="stats-container">
                <div className="stats-box"><h2>Total Users</h2><p>{totalUsers}</p></div>
                <div className="stats-box"><h2>Question Categories</h2><p>{totalCategories}</p></div>
                <div className="stats-box"><h2>Total Questions</h2><p>{totalQuestions}</p></div>
                <div className="stats-box"><h2>Total Revenue</h2><p>RM {totalRevenue.toFixed(2)}</p></div>
            </div>

            <div className="chart-table-container">
                <div className="chart-container">
                    <h2 style={{color:'black'}}>Questions by Subcategory</h2>
                    <PieChart width={400} height={400}>
                        <Pie data={questionStats} cx="50%" cy="50%" outerRadius={120} dataKey="value" nameKey="name" label>
                            {questionStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>

                <div className="table-container">
                    <h2 style={{color:'black'}}>User Profiles</h2>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Joined Date</th></tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td><td>{user.username}</td><td>{user.email}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, index) => (
                            <button key={index} onClick={() => paginate(index + 1)}>{index + 1}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="chart-table-container">
                <div className="chart-container">
                    <h2 style={{color:'black'}}>Top 5 Correctly Answered Questions</h2>
                    <PieChart width={400} height={400}>
                        <Pie data={topCorrectQuestions} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                            {topCorrectQuestions.map((_, index) => (
                                <Cell key={`cell-correct-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                <div className="chart-container">
                    <h2 style={{color:'black'}}>Top 5 Incorrectly Answered Questions</h2>
                    <PieChart width={400} height={400}>
                        <Pie data={topIncorrectQuestions} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                            {topIncorrectQuestions.map((_, index) => (
                                <Cell key={`cell-incorrect-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
