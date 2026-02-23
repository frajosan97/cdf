import React from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { Button, Card, Alert, Row, Col, Form, Container } from "react-bootstrap";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function TwoFactorAuthentication({ auth, status }) {
    const user = auth.user;
    const twoFactorEnabled = user?.two_factor_enabled ?? false;

    // Form for enabling 2FA (requires password confirmation)
    const enableForm = useForm({
        password: "",
    });

    // Form for confirming 2FA setup (after scanning QR code)
    const confirmForm = useForm({
        code: "",
    });

    const enable2FA = (e) => {
        e.preventDefault();
        enableForm.post(route("two-factor.enable"), {
            preserveScroll: true,
            onSuccess: () => enableForm.reset(),
        });
    };

    const confirm2FA = (e) => {
        e.preventDefault();
        confirmForm.post(route("two-factor.confirm"), {
            preserveScroll: true,
            onSuccess: () => confirmForm.reset(),
        });
    };

    const disable2FA = (e) => {
        e.preventDefault();
        router.delete(route("two-factor.disable"), {
            preserveScroll: true,
        });
    };

    // Generate QR code URL from user data (Fortify provides this)
    const qrCodeUrl = user?.two_factor_qr_code_url ?? "";

    return (
        <AuthenticatedLayout>
            <Head title="Two-Factor Authentication" />

            <Container fluid>
                <Card className="border-0 shadow">
                    <Card.Header className="border-0 bg-transparent">
                        <h5 className="mb-0">Two-Factor Authentication</h5>
                    </Card.Header>
                    <Card.Body>
                        {status && <Alert variant="info">{status}</Alert>}

                        {!twoFactorEnabled ? (
                            <>
                                <p className="text-muted">
                                    Add additional security to your account
                                    using two-factor authentication.
                                </p>
                                {!qrCodeUrl ? (
                                    <Form onSubmit={enable2FA}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Confirm your password to enable
                                                2FA
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={enableForm.data.password}
                                                onChange={(e) =>
                                                    enableForm.setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                isInvalid={
                                                    !!enableForm.errors.password
                                                }
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {enableForm.errors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={enableForm.processing}
                                        >
                                            Enable
                                        </Button>
                                    </Form>
                                ) : (
                                    <Form onSubmit={confirm2FA}>
                                        <p className="fw-bold">
                                            Scan this QR code with your
                                            authenticator app:
                                        </p>
                                        <div className="mb-3 text-center">
                                            <img
                                                src={qrCodeUrl}
                                                alt="2FA QR Code"
                                                style={{ maxWidth: "200px" }}
                                            />
                                        </div>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Enter the 6-digit code from your
                                                app
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                inputMode="numeric"
                                                value={confirmForm.data.code}
                                                onChange={(e) =>
                                                    confirmForm.setData(
                                                        "code",
                                                        e.target.value,
                                                    )
                                                }
                                                isInvalid={
                                                    !!confirmForm.errors.code
                                                }
                                                placeholder="123456"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {confirmForm.errors.code}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Button
                                            variant="success"
                                            type="submit"
                                            disabled={confirmForm.processing}
                                        >
                                            Confirm & Enable
                                        </Button>
                                    </Form>
                                )}
                            </>
                        ) : (
                            <>
                                <Alert variant="success">
                                    <i className="bi bi-shield-check me-2"></i>
                                    Two-factor authentication is currently{" "}
                                    <strong>enabled</strong>.
                                </Alert>
                                <p className="text-muted">
                                    Store your recovery codes in a safe place.
                                    You can view them again, but they will not
                                    be shown again after this.
                                </p>
                                <Button
                                    variant="danger"
                                    onClick={disable2FA}
                                    disabled={disableForm?.processing}
                                >
                                    Disable 2FA
                                </Button>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
}
