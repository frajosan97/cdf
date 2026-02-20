import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import CategoryOptions from "./CategoryOptions";

const InstitutionFormModal = ({
    show,
    onHide,
    onSubmit,
    formData,
    setFormData,
    isEdit = false,
    loading = false,
}) => {
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5 mb-0">
                    <i
                        className={`bi ${isEdit ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
                    ></i>
                    {isEdit ? "Edit Institution" : "Add New Institution"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body className="py-4">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter institution name"
                                    disabled={loading}
                                    autoFocus
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Category
                                </Form.Label>
                                <CategoryOptions
                                    selectedValue={formData.category}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    Select the type of institution
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="is_active_switch"
                                    label="Active Status"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted d-block">
                                    Toggle to activate/deactivate this
                                    institution
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={loading}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                {isEdit ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <i
                                    className={`bi ${isEdit ? "bi-check-circle" : "bi-plus-circle"} me-2`}
                                ></i>
                                {isEdit ? "Update" : "Create"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default InstitutionFormModal;
