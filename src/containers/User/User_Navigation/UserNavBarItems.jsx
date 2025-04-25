import { 
    FaTachometerAlt, 
    FaUser, 
    FaCog, 
    FaClipboardList, 
    FaUtensils, 
    FaTags, 
    FaListAlt, 
    FaPlusCircle, 
    FaTools,
    FaThList,
} from "react-icons/fa";

const userNavBarItems = [
    {
        title: "Admin Dashboard",
        link: "/user/dashboard",
        icon: <FaTachometerAlt />,
    },
    {
        title: "Exam Records",
        link: "/user/examrecords",
        icon: <FaUser />,
    },
    {
        title: "Settings",
        icon: <FaCog />,
        dropdown: true, // Indicates dropdown
        items: [
        ]
    },
];

export default userNavBarItems;
