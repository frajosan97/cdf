import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Badge,
    Table,
    Button,
} from "react-bootstrap";
import { useState } from "react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";
import Swal from "sweetalert2";
import axios from "axios";

const ShowApplicant = ({ applicant }) => {
    const [loading, setLoading] = useState(false);
    const { showErrorToast } = useErrorToast();

    const getStatusBadge = (decision) => {
        if (!decision) return <Badge bg="secondary">Pending</Badge>;

        const variants = {
            approved: "success",
            rejected: "danger",
            pending: "warning",
        };

        return (
            <Badge bg={variants[decision] || "secondary"} className="px-3 py-2">
                {decision.charAt(0).toUpperCase() + decision.slice(1)}
            </Badge>
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return "-";
        return `KES ${parseFloat(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString();
    };

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            setLoading(true);
            const response = await axios.delete(
                route("applicant.destroy", applicant.id),
            );

            if (response.data?.success) {
                toast.success("Applicant deleted successfully");
                window.location.href = route("applicant.index");
            }
        } catch (error) {
            showErrorToast(error, "Failed to delete applicant");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDecision = async (decision) => {
        try {
            const { value: reason } = await Swal.fire({
                title: `${decision.charAt(0).toUpperCase() + decision.slice(1)} Applicant`,
                text: `Are you sure you want to ${decision} this applicant?`,
                input: "textarea",
                inputLabel: "Reason (optional)",
                inputPlaceholder: "Enter reason for decision...",
                showCancelButton: true,
                confirmButtonColor:
                    decision === "approved" ? "#28a745" : "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: `Yes, ${decision}`,
                cancelButtonText: "Cancel",
                inputValidator: (value) => {
                    if (value && value.length > 500) {
                        return "Reason must be less than 500 characters";
                    }
                },
            });

            if (reason === undefined) return;

            setLoading(true);
            const response = await axios.post(
                route("applicant.decision", applicant.id),
                {
                    decision,
                    decision_reason: reason || null,
                },
            );

            if (response.data?.success) {
                toast.success(`Applicant ${decision} successfully`);
                window.location.reload();
            }
        } catch (error) {
            showErrorToast(error, "Failed to update decision");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Applicant - ${applicant.admission_number}`} />

            <Container fluid>
                {/* Header */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <div className="d-flex align-items-center">
                            <div>
                                <h1 className="h2 mb-0 fw-bold">
                                    Applicant Details
                                </h1>
                                <p className="text-muted mt-1 mb-0">
                                    {applicant.student_name} -{" "}
                                    {applicant.admission_number}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col xs="auto">
                        <div className="d-flex gap-2">
                            {applicant.decision === "pending" && (
                                <>
                                    <Button
                                        variant="success"
                                        onClick={() =>
                                            handleUpdateDecision("approved")
                                        }
                                        disabled={loading}
                                    >
                                        <i className="bi bi-check-lg me-2"></i>
                                        Approve
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            handleUpdateDecision("rejected")
                                        }
                                        disabled={loading}
                                    >
                                        <i className="bi bi-x-lg me-2"></i>
                                        Reject
                                    </Button>
                                </>
                            )}
                            <Link
                                href={route("applicant.edit", applicant.id)}
                                className="btn btn-primary"
                            >
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                            </Link>
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Status Card */}
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm bg-light">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col
                                        md={6}
                                        className="d-flex align-items-center text-center text-md-start mb-3 mb-md-0"
                                    >
                                        <div className="display-1 text-primary">
                                            <i className="bi bi-person-badge"></i>
                                        </div>
                                        <div className="">
                                            <h4 className="m-0">
                                                {applicant.student_name}
                                            </h4>
                                            <p className="text-muted mb-0">
                                                {applicant.admission_number}
                                            </p>
                                            {getStatusBadge(applicant.decision)}
                                        </div>
                                    </Col>
                                    <Col
                                        md={6}
                                        className="text-center text-md-end"
                                    >
                                        <h5 className="text-muted mb-1">
                                            Amount
                                        </h5>
                                        <h3 className="text-primary mb-0">
                                            {formatCurrency(applicant.amount)}
                                        </h3>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Details */}
                <Row>
                    <Col lg={8}>
                        {/* Personal Information */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">
                                    <i className="bi bi-person-vcard me-2"></i>
                                    Personal Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className="text-muted"
                                                        style={{ width: "40%" }}
                                                    >
                                                        Student Name:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.student_name ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Ward:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.ward?.name ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Location:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.location
                                                            ?.name || "-"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className="text-muted"
                                                        style={{ width: "40%" }}
                                                    >
                                                        Institution:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.institution ? (
                                                            <>
                                                                {
                                                                    applicant
                                                                        .institution
                                                                        .name
                                                                }
                                                                <br />
                                                                <small className="text-muted">
                                                                    Category:{" "}
                                                                    {
                                                                        applicant
                                                                            .institution
                                                                            .category
                                                                    }
                                                                </small>
                                                            </>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Admission Number:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.admission_number ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Applicant Type:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.type
                                                            ? applicant.type
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              applicant.type.slice(
                                                                  1,
                                                              )
                                                            : "-"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Parent/Guardian Information */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">
                                    <i className="bi bi-people me-2"></i>
                                    Parent/Guardian Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className="text-muted"
                                                        style={{ width: "40%" }}
                                                    >
                                                        Status:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.parent_status
                                                            ? applicant.parent_status
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              applicant.parent_status.slice(
                                                                  1,
                                                              )
                                                            : "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        ID Number:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {applicant.parent_id_number ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className="text-muted"
                                                        style={{ width: "40%" }}
                                                    >
                                                        Phone Number:
                                                    </td>
                                                    <td className="fw-semibold">
                                                        <a
                                                            href={`tel:${applicant.parent_phone_number}`}
                                                            className="text-decoration-none"
                                                        >
                                                            {applicant.parent_phone_number ||
                                                                "-"}
                                                        </a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Decision Information */}
                        {applicant.decision && (
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="bi bi-check2-circle me-2"></i>
                                        Decision Information
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            className="text-muted"
                                                            style={{
                                                                width: "40%",
                                                            }}
                                                        >
                                                            Decision:
                                                        </td>
                                                        <td className="fw-semibold">
                                                            {getStatusBadge(
                                                                applicant.decision,
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col md={6}>
                                            {applicant.decision_reason && (
                                                <Table borderless size="sm">
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                className="text-muted"
                                                                style={{
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                Reason:
                                                            </td>
                                                            <td className="fw-semibold">
                                                                {
                                                                    applicant.decision_reason
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col lg={4}>
                        {/* Timestamps */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Timestamps
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Table borderless size="sm">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">
                                                Created:
                                            </td>
                                            <td className="fw-semibold">
                                                {formatDate(
                                                    applicant.created_at,
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Last Updated:
                                            </td>
                                            <td className="fw-semibold">
                                                {formatDate(
                                                    applicant.updated_at,
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm bg-light">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-lightning me-2"></i>
                                    Quick Actions
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "applicant.edit",
                                            applicant.id,
                                        )}
                                        className="btn btn-outline-primary"
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Edit Applicant
                                    </Link>
                                    <Button
                                        variant="outline-danger"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Delete Applicant
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
};

export default ShowApplicant;
