import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Col, Container, Row } from "react-bootstrap";

const Settings = () => {
    return (
        <AuthenticatedLayout>
            <Head title="Settings Management" />

            <Container fluid>
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h1 className="h2 mb-0 fw-bold">Settings Management</h1>
                        <p className="text-muted mt-1 mb-0">
                            Manage your settings
                        </p>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
};

export default Settings;
