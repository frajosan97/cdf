import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Navbar, Button, Card } from "react-bootstrap";
import { Phone, Shield, SearchCheck } from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Home({ auth }) {
    return (
        <>
            <Head title="Kitui Rural CDF" />

            <div
                className="min-vh-100 d-flex flex-column"
                style={{
                    background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                {/* Top Bar with Logo (left) and Contacts (right) */}
                <div className="bg-white sticky-top py-3 shadow">
                    <Container>
                        <Row className="align-items-center">
                            <Col xs={6}>
                                <div className="d-flex align-items-center">
                                    <ApplicationLogo style={{ width: 80 }} />
                                    <h3 className="fw-bold mb-0">
                                        <span className="text-success">
                                            Kitui Rural
                                        </span>{" "}
                                        <br />
                                        <span className="text-danger">
                                            Constituency
                                        </span>
                                    </h3>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex justify-content-end align-items-center gap-3">
                                    <Phone size={18} className="text-success" />
                                    <span className="fw-semibold">
                                        0723 636 367
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Main Content - Centered Cards */}
                <Container className="d-flex justify-content-center align-items-center py-4">
                    <Row className="g-4">
                        {/* Admin Access Card */}
                        <Col md={6}>
                            <Card className="border-0 rounded-4 shadow-lg text-center p-4 h-100">
                                <Card.Body>
                                    <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-flex mb-4">
                                        <Shield
                                            size={48}
                                            className="text-success"
                                        />
                                    </div>
                                    <h3 className="fw-bold mb-3">
                                        Admin Access
                                    </h3>
                                    <p className="text-secondary mb-4">
                                        Secure portal for administrators and
                                        authorized personnel
                                    </p>
                                </Card.Body>
                                <Card.Footer className="bg-transparent border-0">
                                    <Button
                                        as={Link}
                                        href={route("login")}
                                        variant="success"
                                        size="lg"
                                        className="w-100 py-3 rounded-3 fw-semibold"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            border: "none",
                                        }}
                                    >
                                        Login to Dashboard
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>

                        {/* Check Application Status Card */}
                        <Col md={6}>
                            <Card className="border-0 rounded-4 shadow-lg text-center p-4 h-100">
                                <Card.Body>
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-4 d-inline-flex mb-4">
                                        <SearchCheck
                                            size={48}
                                            className="text-warning"
                                        />
                                    </div>
                                    <h3 className="fw-bold mb-3">
                                        Check Application Status
                                    </h3>
                                    <p className="text-secondary mb-4">
                                        Track your bursary or project
                                        application status
                                    </p>
                                </Card.Body>
                                <Card.Footer className="bg-transparent border-0">
                                    <Button
                                        as={Link}
                                        // href={route('status.check')}
                                        variant="warning"
                                        size="lg"
                                        className="w-100 py-3 rounded-3 fw-semibold text-dark"
                                    >
                                        Check Status
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Footer with Copyright and Software Info */}
                <footer className="bg-white py-4">
                    <Container>
                        <Row className="align-items-center text-center">
                            <Col md={6} className="mb-3 mb-md-0">
                                <small className="text-secondary">
                                    © {new Date().getFullYear()} Kitui Rural
                                    Constituency Development Fund
                                </small>
                            </Col>
                            <Col md={6}>
                                <small className="text-secondary fw-semibold">
                                    Software by:{" "}
                                    <a href="https://frajosantech.co.ke">
                                        Frajosan IT Consultancies
                                    </a>{" "}
                                    | 0796 594 366
                                </small>
                            </Col>
                        </Row>
                    </Container>
                </footer>
            </div>
        </>
    );
}
