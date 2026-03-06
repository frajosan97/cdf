import ApplicationLogo from "@/Components/ApplicationLogo";
import { Phone, Home, Info, FileText, Phone as PhoneIcon } from "lucide-react";

import { Container, Navbar, Nav, Offcanvas } from "react-bootstrap";

const AppLayout = ({ children }) => {
    return (
        <div
            className="d-flex flex-column min-vh-100"
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            {/* NAVBAR */}
            <Navbar bg="white" expand="md" sticky="top" className="shadow-sm">
                <Container>
                    {/* LOGO */}
                    <Navbar.Brand
                        href="/"
                        className="d-flex align-items-center"
                    >
                        <ApplicationLogo style={{ width: 55 }} />

                        <div className="ms-2 d-none d-md-block">
                            <h6 className="fw-bold mb-0">
                                <span className="text-success">
                                    Kitui Rural
                                </span>
                                <br />
                                <small className="text-danger">
                                    Constituency Bursary
                                </small>
                            </h6>
                        </div>
                    </Navbar.Brand>

                    {/* MOBILE TOGGLE */}
                    <Navbar.Toggle aria-controls="offcanvasNavbar" />

                    {/* OFFCANVAS MENU */}
                    <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
                        <Offcanvas.Header className="border-bottom" closeButton>
                            <Offcanvas.Title>
                                <ApplicationLogo style={{ width: 55 }} />
                            </Offcanvas.Title>
                        </Offcanvas.Header>

                        <Offcanvas.Body>
                            {/* MENU */}
                            <Nav className="justify-content-center flex-grow-1">
                                <Nav.Link
                                    href="/"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Home size={18} /> Home
                                </Nav.Link>

                                <Nav.Link
                                    href="/verify"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Info size={18} /> Check Status
                                </Nav.Link>
                            </Nav>

                            {/* CONTACT (desktop right side) */}
                            <div className="d-md-flex align-items-center gap-2 ms-md-3 mt-3 mt-md-0">
                                <Phone size={18} className="text-success me-2" />
                                <span className="fw-semibold">
                                    0723 636 367
                                </span>
                            </div>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

            {/* CONTENT */}
            <main className="flex-grow-1 min-vh-100">{children}</main>

            {/* FOOTER */}
            <footer className="bg-white py-3 mt-auto">
                <Container>
                    <div className="text-center">
                        <small className="text-secondary">
                            © {new Date().getFullYear()} Kitui Rural
                            Constituency Development Fund
                        </small>
                        <br />
                        <small className="text-secondary">
                            Software by{" "}
                            <a
                                href="https://frajosantech.co.ke"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="fw-semibold text-decoration-none"
                            >
                                Frajosan IT Consultancies
                            </a>{" "}
                            | 0796 594 366
                        </small>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default AppLayout;
