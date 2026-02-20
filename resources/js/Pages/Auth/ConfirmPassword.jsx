import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { Lock } from "lucide-react";
import { Form, Card, Button, InputGroup, Alert } from "react-bootstrap";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                {/* Header */}
                <Card.Header className="bg-transparent border-0 text-center p-4">
                    <h1 className="h3 fw-bold mb-1">Secure Area 🔒</h1>
                    <p className="mb-0 text-muted small">
                        Please confirm your password before continuing
                    </p>
                </Card.Header>

                {/* Form */}
                <Card.Body className="p-4">
                    <div className="mb-4 text-secondary bg-light p-3 rounded-3">
                        <small>
                            This is a secure area of the application. Please
                            confirm your password before continuing.
                        </small>
                    </div>

                    <Form onSubmit={submit}>
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
                                {processing ? "Confirming..." : "Confirm"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
