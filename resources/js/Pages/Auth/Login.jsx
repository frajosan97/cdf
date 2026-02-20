import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Lock } from "lucide-react";
import { Form, Card, Button, InputGroup, Alert } from "react-bootstrap";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                {/* Header */}
                <Card.Header className="bg-transparent border-0 text-center p-4">
                    <h1 className="h3 fw-bold mb-1">Welcome Back! 👋</h1>
                    <p className="mb-0 text-muted small">
                        Login to continue to your dashboard
                    </p>
                </Card.Header>

                {/* Form */}
                <Card.Body className="p-4">
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
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        {/* Password Field */}
                        <Form.Group className="mb-4" controlId="password">
                            <Form.Label className="fw-semibold text-secondary">
                                Password
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0">
                                    <Lock
                                        size={18}
                                        className="text-secondary"
                                    />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    isInvalid={!!errors.password}
                                    className="border-start-0 rounded-end-3"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        {/* Remember & Forgot Password */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Form.Check type="checkbox" id="remember">
                                <Form.Check.Input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="me-2"
                                />
                                <Form.Check.Label className="text-secondary small">
                                    Remember me
                                </Form.Check.Label>
                            </Form.Check>

                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-decoration-none text-primary small fw-semibold"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100 py-2 border-0 rounded-3 fw-semibold"
                            style={{
                                background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                            disabled={processing}
                        >
                            {processing ? "Logging in..." : "Log In"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
