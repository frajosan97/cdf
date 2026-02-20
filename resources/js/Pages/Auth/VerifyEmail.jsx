import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Card, Button, Alert } from "react-bootstrap";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                {/* Header */}
                <Card.Header className="bg-transparent border-0 text-center p-4">
                    <h1 className="h3 fw-bold mb-1">Verify Email 📧</h1>
                    <p className="mb-0 text-muted small">
                        Please verify your email address
                    </p>
                </Card.Header>

                {/* Form */}
                <Card.Body className="p-4">
                    <div className="mb-4 text-secondary bg-light p-3 rounded-3">
                        <small>
                            Thanks for signing up! Before getting started, could
                            you verify your email address by clicking on the
                            link we just emailed to you? If you didn't receive
                            the email, we will gladly send you another.
                        </small>
                    </div>

                    {status === "verification-link-sent" && (
                        <Alert variant="success" className="mb-4">
                            A new verification link has been sent to the email
                            address you provided during registration.
                        </Alert>
                    )}

                    <Form onSubmit={submit}>
                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                type="submit"
                                variant="primary"
                                className="px-4 py-2 border-0 rounded-3 fw-semibold"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                }}
                                disabled={processing}
                            >
                                {processing
                                    ? "Sending..."
                                    : "Resend Verification Email"}
                            </Button>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="btn btn-link text-decoration-none text-primary small fw-semibold p-0 border-0"
                            >
                                Log Out
                            </Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
