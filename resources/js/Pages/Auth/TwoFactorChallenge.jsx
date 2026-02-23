import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Button,
    Form,
    Alert,
    Card,
    Container,
    Row,
    Col,
    Tabs,
    Tab,
} from "react-bootstrap";

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
        recovery_code: "",
    });

    const submitCode = (e) => {
        e.preventDefault();
        post(route("two-factor.login"), {
            onSuccess: () => reset("code"),
        });
    };

    const submitRecoveryCode = (e) => {
        e.preventDefault();
        post(route("two-factor.login"), {
            onSuccess: () => reset("recovery_code"),
        });
    };

    return (
        <>
            <Head title="Two-Factor Confirmation" />
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card>
                            <Card.Header as="h4" className="text-center">
                                Two-Factor Authentication
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted text-center mb-4">
                                    Please confirm access to your account by
                                    entering the authentication code provided by
                                    your authenticator application or by using
                                    one of your recovery codes.
                                </p>

                                <Tabs
                                    defaultActiveKey="code"
                                    id="2fa-tabs"
                                    className="mb-3"
                                    justify
                                >
                                    <Tab
                                        eventKey="code"
                                        title="Authentication Code"
                                    >
                                        <Form
                                            onSubmit={submitCode}
                                            className="mt-3"
                                        >
                                            <Form.Group className="mb-3">
                                                <Form.Label>Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoFocus
                                                    autoComplete="one-time-code"
                                                    value={data.code}
                                                    onChange={(e) =>
                                                        setData(
                                                            "code",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.code}
                                                    placeholder="123456"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.code}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <div className="d-grid">
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Verify
                                                </Button>
                                            </div>
                                        </Form>
                                    </Tab>
                                    <Tab
                                        eventKey="recovery"
                                        title="Recovery Code"
                                    >
                                        <Form
                                            onSubmit={submitRecoveryCode}
                                            className="mt-3"
                                        >
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Recovery Code
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.recovery_code}
                                                    onChange={(e) =>
                                                        setData(
                                                            "recovery_code",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.recovery_code
                                                    }
                                                    placeholder="XXXXX-XXXXX"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.recovery_code}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <div className="d-grid">
                                                <Button
                                                    variant="outline-primary"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Use Recovery Code
                                                </Button>
                                            </div>
                                        </Form>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
