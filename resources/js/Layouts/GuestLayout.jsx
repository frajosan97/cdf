import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { Container, Row, Col } from "react-bootstrap";

export default function GuestLayout({ children }) {
    return (
        <div className="min-vh-100 d-flex flex-column align-items-center bg-light p-3">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} className="mb-3 text-center">
                        <Link href="/" className="d-inline-block">
                            <ApplicationLogo
                                className="text-success"
                                style={{ width: "80px", height: "80px" }}
                            />
                        </Link>
                    </Col>
                    <Col xs={12} md={6} lg={5}>
                        <div className="bg-white rounded-4 shadow-sm">
                            {children}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
