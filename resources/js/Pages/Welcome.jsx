import { Head, Link } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Navbar,
    Nav,
    Button,
    Card,
} from "react-bootstrap";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="CDF Kitui Rural - County Development Fund" />

            <div className="min-vh-100 bg-light">
                {/* Navbar */}
                <Navbar
                    bg="success"
                    variant="dark"
                    expand="lg"
                    className="shadow-sm sticky-top"
                    sticky="top"
                >
                    <Container>
                        <Navbar.Brand as={Link} href="/" className="fw-bold">
                            Kitui Rural CDF
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarNav" />
                        <Navbar.Collapse id="navbarNav">
                            <Nav className="ms-auto">
                                <Nav.Link href="#about">About</Nav.Link>
                                <Nav.Link href="#services">Services</Nav.Link>
                                <Nav.Link href="#projects">Projects</Nav.Link>
                                <Nav.Link href="#contact">Contact</Nav.Link>

                                {auth?.user ? (
                                    <Nav.Link
                                        as={Link}
                                        href={route("dashboard")}
                                        className="btn btn-light btn-sm fw-semibold ms-2"
                                    >
                                        Dashboard
                                    </Nav.Link>
                                ) : (
                                    <Nav.Link
                                        as={Link}
                                        href={route("login")}
                                        className="btn btn-outline-light btn-sm fw-semibold ms-2"
                                    >
                                        Login
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                {/* Hero Section */}
                <section className="py-5 bg-white">
                    <Container>
                        <Row className="align-items-center g-4">
                            <Col lg={6}>
                                <h1 className="display-5 fw-bold text-success">
                                    County Development Fund System
                                </h1>
                                <h2 className="h4 text-muted">
                                    Kitui Rural Constituency
                                </h2>

                                <p className="mt-3 text-secondary fs-5">
                                    A modern digital platform for managing CDF
                                    projects, bursary applications, fund
                                    allocations, approvals, and community
                                    development tracking in Kitui Rural.
                                </p>

                                <div className="d-flex gap-2 mt-4">
                                    <Button
                                        href="#services"
                                        variant="success"
                                        size="lg"
                                        className="fw-semibold"
                                    >
                                        Explore Services
                                    </Button>
                                    <Button
                                        href="#contact"
                                        variant="outline-success"
                                        size="lg"
                                        className="fw-semibold"
                                    >
                                        Contact Office
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    <small className="text-muted">
                                        Transparency • Accountability •
                                        Development
                                    </small>
                                </div>
                            </Col>

                            <Col lg={6}>
                                <Card className="shadow border-0 rounded-4">
                                    <Card.Body className="p-4">
                                        <h4 className="fw-bold text-success text-center">
                                            Key System Modules
                                        </h4>

                                        <Row className="mt-4 g-3">
                                            {[
                                                "Bursary",
                                                "Projects",
                                                "Finance",
                                                "Approvals",
                                            ].map((module, index) => (
                                                <Col key={index} xs={6}>
                                                    <div className="p-3 bg-light rounded-3 border text-center">
                                                        <h6 className="fw-bold mb-1">
                                                            {module}
                                                        </h6>
                                                        <small className="text-muted">
                                                            {index === 0 &&
                                                                "Applications & awards"}
                                                            {index === 1 &&
                                                                "Tracking & monitoring"}
                                                            {index === 2 &&
                                                                "Allocation & reporting"}
                                                            {index === 3 &&
                                                                "Committee workflow"}
                                                        </small>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>

                                        <div className="mt-4">
                                            <Button
                                                as={Link}
                                                href={route("login")}
                                                variant="warning"
                                                className="w-100 fw-semibold"
                                            >
                                                Access System Portal
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* About Section */}
                <section id="about" className="py-5 bg-light">
                    <Container>
                        <Row className="g-4 align-items-center">
                            <Col lg={6}>
                                <h2 className="fw-bold text-success">
                                    About Kitui Rural CDF
                                </h2>
                                <p className="text-secondary fs-5 mt-3">
                                    The Kitui Rural Constituency Development
                                    Fund supports education, infrastructure,
                                    health, water projects, youth empowerment
                                    and community growth initiatives.
                                </p>

                                <p className="text-secondary">
                                    This system provides an efficient way to
                                    manage fund distribution, monitor project
                                    implementation, and ensure transparency for
                                    the people of Kitui Rural.
                                </p>
                            </Col>

                            <Col lg={6}>
                                <Card className="shadow-sm border-0 rounded-4">
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold text-success">
                                            Our Core Values
                                        </h5>

                                        <ul className="list-group list-group-flush mt-3">
                                            {[
                                                "Transparency & Integrity",
                                                "Community Empowerment",
                                                "Equal Opportunity",
                                                "Sustainable Development",
                                            ].map((value, index) => (
                                                <li
                                                    key={index}
                                                    className="list-group-item bg-transparent border-0"
                                                >
                                                    ✅ {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Services Section */}
                <section id="services" className="py-5 bg-white">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-success">
                                System Services
                            </h2>
                            <p className="text-muted fs-5">
                                Key services offered through the Kitui Rural CDF
                                digital platform
                            </p>
                        </div>

                        <Row className="g-4">
                            {[
                                {
                                    title: "Bursary Applications",
                                    description:
                                        "Students can apply for bursaries, track approvals, and receive awards efficiently.",
                                },
                                {
                                    title: "Project Management",
                                    description:
                                        "Manage project proposals, budgets, implementation progress, and evaluation reports.",
                                },
                                {
                                    title: "Fund Allocation & Reports",
                                    description:
                                        "Generate transparent reports on allocations, expenditures, and committee approvals.",
                                },
                                {
                                    title: "Committee Workflow",
                                    description:
                                        "Automate approval processes and reduce paperwork for constituency committees.",
                                },
                                {
                                    title: "Public Transparency Portal",
                                    description:
                                        "Citizens can view published projects and see how development funds are utilized.",
                                },
                                {
                                    title: "Audit & Accountability",
                                    description:
                                        "Improve accountability with clear audit trails, approvals logs, and financial statements.",
                                },
                            ].map((service, index) => (
                                <Col key={index} md={6} lg={4}>
                                    <Card className="h-100 shadow-sm border-0 rounded-4">
                                        <Card.Body className="p-4">
                                            <h5 className="fw-bold">
                                                {service.title}
                                            </h5>
                                            <p className="text-muted">
                                                {service.description}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Projects Section */}
                <section id="projects" className="py-5 bg-light">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-success">
                                Featured Development Areas
                            </h2>
                            <p className="text-muted fs-5">
                                Priority areas supported by Kitui Rural CDF
                            </p>
                        </div>

                        <Row className="g-4">
                            {[
                                {
                                    title: "Education",
                                    description:
                                        "Bursaries, classrooms, desks, labs and school facilities.",
                                },
                                {
                                    title: "Health",
                                    description:
                                        "Health centers, dispensaries, maternity wards and equipment.",
                                },
                                {
                                    title: "Water Projects",
                                    description:
                                        "Boreholes, dams, pipelines and clean water access.",
                                },
                                {
                                    title: "Roads & Infrastructure",
                                    description:
                                        "Road grading, bridges, markets and public utilities.",
                                },
                            ].map((area, index) => (
                                <Col key={index} md={6} lg={3}>
                                    <Card className="shadow-sm border-0 rounded-4 h-100">
                                        <Card.Body className="p-4 text-center">
                                            <h6 className="fw-bold">
                                                {area.title}
                                            </h6>
                                            <p className="text-muted small">
                                                {area.description}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <div className="text-center mt-5">
                            <Button
                                as={Link}
                                href={route("login")}
                                variant="success"
                                size="lg"
                                className="fw-semibold"
                            >
                                View Full Project Dashboard
                            </Button>
                        </div>
                    </Container>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-5 bg-white">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-success">Contact Us</h2>
                            <p className="text-muted fs-5">
                                Reach the Kitui Rural CDF office for inquiries
                                and support
                            </p>
                        </div>

                        <Row className="justify-content-center">
                            <Col lg={6}>
                                <Card className="shadow-sm border-0 rounded-4">
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold text-success">
                                            Constituency Office
                                        </h5>

                                        <p className="mb-2">
                                            <strong>Location:</strong> Kitui
                                            Rural Constituency Office, Kitui
                                            County
                                        </p>
                                        <p className="mb-2">
                                            <strong>Email:</strong>{" "}
                                            info@kituiruralcdf.go.ke
                                        </p>
                                        <p className="mb-2">
                                            <strong>Phone:</strong> +254 700 000
                                            000
                                        </p>

                                        <hr />

                                        <p className="text-muted small mb-0">
                                            For system support, please login and
                                            submit a support ticket via the
                                            dashboard.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Footer */}
                <footer className="bg-success text-white py-4">
                    <Container className="text-center">
                        <p className="mb-1 fw-semibold">
                            © {new Date().getFullYear()} Kitui Rural
                            Constituency Development Fund
                        </p>
                        <small className="text-white-50">
                            Powered by CDF Management System | Transparency &
                            Accountability
                        </small>
                    </Container>
                </footer>
            </div>
        </>
    );
}
