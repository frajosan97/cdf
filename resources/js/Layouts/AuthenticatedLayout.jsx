import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Container,
    Navbar,
    Nav,
    NavDropdown,
    Offcanvas,
    Badge,
} from "react-bootstrap";
import {
    LayoutDashboard,
    Building,
    UserCheck,
    Award,
    BarChart3,
    Settings,
    LogOut,
    User,
    Bell,
    Menu,
    HelpCircle,
    Moon,
    Sun,
    Search,
} from "lucide-react";

import { ToastContainer } from "react-toastify";

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            text: "New bursary application received",
            time: "5 min ago",
            unread: true,
        },
        {
            id: 2,
            text: "Project approval pending",
            time: "1 hour ago",
            unread: true,
        },
        {
            id: 3,
            text: "Budget report ready for review",
            time: "3 hours ago",
            unread: false,
        },
    ]);

    // Toggle dark mode
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // Navigation items - Updated with your requested links
    const navItems = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: LayoutDashboard,
            active: route().current("dashboard"),
        },
        // {
        //     name: "Users",
        //     href: "#",
        //     icon: Users,
        //     badge: null,
        //     active: false,
        // },
        {
            name: "Institutions",
            href: route("institution.index"),
            icon: Building,
            badge: null,
            active: false,
        },
        // {
        //     name: "Voters",
        //     href: route("voter.index"),
        //     icon: UserCheck,
        //     badge: null,
        //     active: false,
        // },
        {
            name: "Applicants",
            href: route("applicant.index"),
            icon: Award,
            badge: null,
            active: false,
        },
        // {
        //     name: "Finance",
        //     href: "#",
        //     icon: DollarSign,
        //     badge: null,
        //     active: false,
        // },
        {
            name: "Reports",
            href: route("reports.index"),
            icon: BarChart3,
            badge: null,
            active: false,
        },
        {
            name: "Settings",
            href: "#",
            icon: Settings,
            badge: null,
            active: false,
        },
    ];

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className={`min-vh-100 bg-light ${darkMode ? "bg-dark" : ""}`}>
            <ToastContainer position="top-center" autoClose={2000} />

            {/* Top Navigation Bar */}
            <Navbar
                bg="white"
                expand="lg"
                className="shadow-sm sticky-top px-3"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
                <Container fluid>
                    {/* Sidebar Toggle & Logo */}
                    <div className="d-flex align-items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="btn btn-link text-dark p-0 me-3 d-lg-none"
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="text-decoration-none">
                            <div className="d-flex align-items-center">
                                <ApplicationLogo
                                    className="me-2"
                                    style={{ width: "32px", height: "32px" }}
                                />
                                <span className="fw-bold text-success d-none d-sm-inline">
                                    Kitui Rural CDF
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Search Bar - Hidden on mobile */}
                    <div
                        className="d-none d-md-block mx-4"
                        style={{ flex: 1, maxWidth: "400px" }}
                    >
                        <div className="position-relative">
                            <Search
                                size={18}
                                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                            />
                            <input
                                type="search"
                                placeholder="Search projects, applications..."
                                className="form-control rounded-pill border-0 bg-light ps-5"
                                style={{ padding: "0.6rem 1rem" }}
                            />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="d-flex align-items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="btn btn-link text-dark p-2 position-relative"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <NavDropdown
                            title={
                                <div className="position-relative d-inline-block">
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <Badge
                                            bg="danger"
                                            className="position-absolute top-0 start-100 translate-middle rounded-pill"
                                            style={{ fontSize: "0.6rem" }}
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            }
                            id="notification-dropdown"
                            align="end"
                            className="no-caret"
                        >
                            <div style={{ minWidth: "300px" }}>
                                <NavDropdown.Header className="bg-light fw-bold">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <Badge bg="danger" className="ms-2">
                                            {unreadCount} new
                                        </Badge>
                                    )}
                                </NavDropdown.Header>
                                {notifications.map((notif) => (
                                    <NavDropdown.Item
                                        key={notif.id}
                                        className={`py-3 ${notif.unread ? "bg-light" : ""}`}
                                    >
                                        <div className="d-flex align-items-start gap-2">
                                            <div
                                                className={`rounded-circle bg-${notif.unread ? "primary" : "secondary"} bg-opacity-10 p-2`}
                                            >
                                                <Bell
                                                    size={14}
                                                    className={`text-${notif.unread ? "primary" : "secondary"}`}
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 small fw-medium">
                                                    {notif.text}
                                                </p>
                                                <small className="text-muted">
                                                    {notif.time}
                                                </small>
                                            </div>
                                            {notif.unread && (
                                                <div
                                                    className="bg-primary rounded-circle"
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                    </NavDropdown.Item>
                                ))}
                                <NavDropdown.Divider />
                                <NavDropdown.Item className="text-center text-primary small">
                                    View all notifications
                                </NavDropdown.Item>
                            </div>
                        </NavDropdown>

                        {/* User Menu */}
                        <NavDropdown
                            title={
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-1">
                                        <div
                                            className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                            }}
                                        >
                                            <span className="fw-bold">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            }
                            id="user-dropdown"
                            align="end"
                            className="no-caret"
                        >
                            <div className="px-3 py-2 bg-light">
                                <p className="mb-0 fw-bold">{user.name}</p>
                                <small className="text-muted">
                                    {user.email}
                                </small>
                            </div>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#">
                                <User size={16} className="me-2" />
                                Profile Settings
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#">
                                <Settings size={16} className="me-2" />
                                Account Settings
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#">
                                <HelpCircle size={16} className="me-2" />
                                Help & Support
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item
                                as={Link}
                                href={route("logout")}
                                method="post"
                                className="text-danger"
                            >
                                <LogOut size={16} className="me-2" />
                                Log Out
                            </NavDropdown.Item>
                        </NavDropdown>
                    </div>
                </Container>
            </Navbar>

            {/* Sidebar Offcanvas for Mobile */}
            <Offcanvas
                show={sidebarOpen}
                onHide={() => setSidebarOpen(false)}
                className="bg-white"
                style={{ width: "280px" }}
            >
                <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title>
                        <div className="d-flex align-items-center">
                            <ApplicationLogo
                                className="me-2"
                                style={{ width: "32px", height: "32px" }}
                            />
                            <span className="fw-bold text-success">
                                Kitui Rural CDF
                            </span>
                        </div>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    {/* User Info */}
                    <div className="p-3 border-bottom bg-light">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    fontSize: "1.2rem",
                                }}
                            >
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="mb-0 fw-bold">{user.name}</p>
                                <small className="text-muted">
                                    {user.email}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - Updated with your links */}
                    <Nav className="flex-column p-3">
                        {navItems.map((item, index) => (
                            <Nav.Link
                                key={index}
                                as={Link}
                                href={item.href}
                                className={`d-flex align-items-center py-3 px-3 rounded-3 mb-1 ${item.active ? "bg-primary text-white" : "text-dark"}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={20} className="me-3" />
                                <span className="flex-grow-1">{item.name}</span>
                                {item.badge && (
                                    <Badge
                                        bg={item.active ? "light" : "primary"}
                                        text={item.active ? "dark" : "white"}
                                        className="rounded-pill"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </Nav.Link>
                        ))}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Desktop Sidebar - Hidden on mobile */}
            <div
                className="d-none d-lg-block position-fixed"
                style={{
                    width: "260px",
                    height: "calc(100vh - 60px)",
                    top: "60px",
                    left: 0,
                    borderRight: "1px solid rgba(0,0,0,0.05)",
                }}
            >
                <div className="h-100 bg-white d-flex flex-column">
                    {/* Navigation - Updated with your links */}
                    <Nav className="flex-column p-3 flex-grow-1">
                        {navItems.map((item, index) => (
                            <Nav.Link
                                key={index}
                                as={Link}
                                href={item.href}
                                className={`d-flex align-items-center py-3 px-3 rounded-3 mb-1 ${item.active ? "bg-primary text-white" : "text-dark"}`}
                            >
                                <item.icon size={20} className="me-3" />
                                <span className="flex-grow-1">{item.name}</span>
                                {item.badge && (
                                    <Badge
                                        bg={item.active ? "light" : "primary"}
                                        text={item.active ? "dark" : "white"}
                                        className="rounded-pill"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </Nav.Link>
                        ))}
                    </Nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="d-lg-none">
                <main className="py-4">{children}</main>
            </div>

            <div className="d-none d-lg-block" style={{ marginLeft: "260px" }}>
                <main className="py-4">{children}</main>
            </div>

            <style jsx>{`
                .no-caret .dropdown-toggle::after {
                    display: none !important;
                }
                .dark-mode {
                    background-color: #1a1a1a;
                    color: #fff;
                }
                .dark-mode .bg-white {
                    background-color: #2d2d2d !important;
                }
                .dark-mode .text-dark {
                    color: #fff !important;
                }
                .dark-mode .bg-light {
                    background-color: #363636 !important;
                }
                .dark-mode .text-muted {
                    color: #b0b0b0 !important;
                }
                .dark-mode .border-bottom {
                    border-color: #404040 !important;
                }
            `}</style>
        </div>
    );
}
