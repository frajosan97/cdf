import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Shield, SearchCheck } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";

export default function Home({ auth }) {
    return (
        <AppLayout>
            <Head title="Kitui Rural CDF" />

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
                                <h3 className="fw-bold mb-3">Admin Access</h3>
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
                                    Track your bursary or project application
                                    status
                                </p>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-0">
                                <Button
                                    as={Link}
                                    href={route("verify")}
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
        </AppLayout>
    );
}
