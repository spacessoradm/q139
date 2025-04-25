
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

import { ChartPie, UserSearch, Newspaper, FileQuestion, Server, Settings, Scroll   } from 'lucide-react';

const adminNavBarItems = [
    {
        title: "Dashboard",
        link: "/admin/dashboard",
        icon: <ChartPie />,
    },
    {
        title: "Users",
        link: "/admin/user",
        icon: <UserSearch />
    },
    {
        title: "Blogs",
        link: "/admin/blogs",
        icon: <Newspaper />
    },
    {
        title: "Demo Test",
        link: "/admin/questionselect/list",
        icon: <Scroll  />
    },
    {
        title: "Ques Management",
        dropdown: true,
        icon: <FileQuestion />,
        items: [
            {
                title: "2A",
                link: "/admin/questions/2A",
            },
            {
                title: "Physic",
                link: "/admin/questions/Physics",
            },
        ]
    },
    {
        title: "Testimonial",
        link: "/admin/testimonials",
        icon: <Server />
    },
    {
        title: "Settings",
        dropdown: true, // Indicates dropdown
        icon: <Settings />,
        items: [
            {
                title: "Manage Banner",
                link: "/admin/banners",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Blog Tags",
                link: "/admin/blogtags",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Footer Menu",
                link: "/admin/footermenu",
                icon: <FaListAlt />,
            },
            {
                title: "Question Category Management",
                link: "/admin/questioncategory",
                icon: <FaListAlt />,
            },
            {
                title: "Subscription Plan Management",
                link: "/admin/subscriptionplans",
                icon: <FaListAlt />,
            },
            {
                title: "Role Management",
                link: "/admin/roles",
                icon: <FaListAlt />,
            },
        ]
    },
];

export default adminNavBarItems;
