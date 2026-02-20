import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { Mail } from "lucide-react";
import { Form, Card, Button, InputGroup, Alert } from "react-bootstrap";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                {/* Header */}
                <Card.Header className="bg-transparent border-0 text-center p-4">
                    <h1 className="h3 fw-bold mb-1">Forgot Password? 🔐</h1>
                    <p className="mb-0 text-muted small">
                        Reset your password via email
                    </p>
                </Card.Header>

                {/* Form */}
                <Card.Body className="p-4">
                    <div className="mb-4 text-secondary bg-light p-3 rounded-3">
                        <small>
                            Forgot your password? No problem. Just let us know
                            your email address and we will email you a password
                            reset link that will allow you to choose a new one.
                        </small>
                    </div>

                    {status && (
                        <Alert variant="success" className="mb-4">
                            {status}
                        </Alert>
                    )}

                    <Form onSubmit={submit}>
                        {/* Email Field */}
                        <Form.Group className="mb-4" controlId="email">
                            <Form.Label className="fw-semibold text-secondary">
                                Email Address
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0">
                                    <Mail
                                        size={18}
                                        className="text-secondary"
                                    />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    isInvalid={!!errors.email}
                                    className="border-start-0 rounded-end-3"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        {/* Submit Button */}
                        <div className="d-flex justify-content-end">
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
                                    : "Email Password Reset Link"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
