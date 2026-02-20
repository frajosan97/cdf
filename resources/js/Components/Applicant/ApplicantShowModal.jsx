import { Modal, Button, Row, Col, Table, Badge } from "react-bootstrap";

const ApplicantShowModal = ({ show, onHide, applicant, loading }) => {
    if (!applicant) return null;

    const getStatusBadge = (decision) => {
        if (!decision) return <Badge bg="secondary">Pending</Badge>;

        const variants = {
            approved: "success",
            rejected: "danger",
            pending: "warning",
        };

        return (
            <Badge bg={variants[decision] || "secondary"}>
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5 mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Applicant Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
                {loading ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header with status */}
                        <Row className="mb-4">
                            <Col>
                                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                                    <div>
                                        <h6 className="mb-1 text-muted">
                                            Admission Number
                                        </h6>
                                        <h4 className="mb-0 fw-bold">
                                            {applicant.admission_number || "-"}
                                        </h4>
                                    </div>
                                    <div className="text-end">
                                        <h6 className="mb-1 text-muted">
                                            Status
                                        </h6>
                                        <h4 className="mb-0">
                                            {getStatusBadge(applicant.decision)}
                                        </h4>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Personal Information */}
                        <Row className="mb-4">
                            <Col xs={12}>
                                <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                    <i className="bi bi-person-vcard me-2"></i>
                                    Personal Information
                                </h6>
                            </Col>
                            <Col md={6}>
                                <Table borderless size="sm">
                                    <tbody>
                                        <tr>
                                            <td
                                                className="text-muted"
                                                style={{ width: "40%" }}
                                            >
                                                Ward:
                                            </td>
                                            <td className="fw-semibold">
                                                {applicant.ward || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Location:
                                            </td>
                                            <td className="fw-semibold">
                                                {applicant.location || "-"}
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
                                                      applicant.type.slice(1)
                                                    : "-"}
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
                                                            (
                                                            {
                                                                applicant
                                                                    .institution
                                                                    .category
                                                            }
                                                            )
                                                        </small>
                                                    </>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Amount:
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {formatCurrency(
                                                    applicant.amount,
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>

                        {/* Parent/Guardian Information */}
                        <Row className="mb-4">
                            <Col xs={12}>
                                <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                    <i className="bi bi-people me-2"></i>
                                    Parent/Guardian Information
                                </h6>
                            </Col>
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
                                                {applicant.parent_phone_number ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>

                        {/* Decision Information */}
                        {applicant.decision && (
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                        <i className="bi bi-check2-circle me-2"></i>
                                        Decision Information
                                    </h6>
                                </Col>
                                <Col md={6}>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td
                                                    className="text-muted"
                                                    style={{ width: "40%" }}
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
                                                        style={{ width: "40%" }}
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
                        )}

                        {/* Timestamps */}
                        <Row>
                            <Col xs={12}>
                                <div className="bg-light p-3 rounded">
                                    <Row>
                                        <Col md={6}>
                                            <small className="text-muted d-block">
                                                <i className="bi bi-clock me-1"></i>
                                                Created:{" "}
                                                {formatDate(
                                                    applicant.created_at,
                                                )}
                                            </small>
                                        </Col>
                                        <Col md={6}>
                                            <small className="text-muted d-block">
                                                <i className="bi bi-arrow-repeat me-1"></i>
                                                Last Updated:{" "}
                                                {formatDate(
                                                    applicant.updated_at,
                                                )}
                                            </small>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>
                    <i className="bi bi-x-circle me-2"></i>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ApplicantShowModal;
