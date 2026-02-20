import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { Mail, Lock } from "lucide-react";
import { Form, Card, Button, InputGroup } from "react-bootstrap";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                {/* Header */}
                <Card.Header className="bg-transparent border-0 text-center p-4">
                    <h1 className="h3 fw-bold mb-1">Reset Password 🔑</h1>
                    <p className="mb-0 text-muted small">
                        Choose a new password for your account
                    </p>
                </Card.Header>

                {/* Form */}
                <Card.Body className="p-4">
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

                        {/* Password Field */}
                        <Form.Group className="mb-4" controlId="password">
                            <Form.Label className="fw-semibold text-secondary">
                                New Password
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
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    autoFocus
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    isInvalid={!!errors.password}
                                    className="border-start-0 rounded-end-3"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        {/* Confirm Password Field */}
                        <Form.Group
                            className="mb-4"
                            controlId="password_confirmation"
                        >
                            <Form.Label className="fw-semibold text-secondary">
                                Confirm New Password
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
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    isInvalid={!!errors.password_confirmation}
                                    className="border-start-0 rounded-end-3"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password_confirmation}
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
                                {processing ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
