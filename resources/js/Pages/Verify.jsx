import AppLayout from "@/Layouts/AppLayout";
import {
    Container,
    Row,
    Col,
    Form,
    InputGroup,
    Table,
    Card,
    Badge,
    Spinner,
    Alert,
    Button,
} from "react-bootstrap";
import { useState } from "react";
import {
    FaSearch,
    FaUserGraduate,
    FaIdCard,
    FaPhone,
    FaMapMarkerAlt,
    FaUniversity,
    FaTimes,
} from "react-icons/fa";
import axios from "axios";
import Select from "react-select";
import { Head } from "@inertiajs/react";

const Verify = ({ institutions = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState({
        value: "admission_number",
        label: "Admission Number",
    });
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Search options for react-select
    const searchOptions = [
        {
            value: "admission_number",
            label: "Admission Number",
            requiresInstitution: true,
        },
        {
            value: "student_name",
            label: "Student Name",
            requiresInstitution: true,
        },
        {
            value: "parent_id_number",
            label: "Parent ID Number",
            requiresInstitution: false,
        },
        {
            value: "parent_phone_number",
            label: "Parent Phone Number",
            requiresInstitution: false,
        },
    ];

    // Format institutions for react-select
    const institutionOptions = institutions.map((inst) => ({
        value: inst.id,
        label: inst.name,
    }));

    // Handle search
    const handleSearch = async (e) => {
        e?.preventDefault();

        // Reset states
        setError(null);
        setValidationError("");

        // Validation
        if (!searchTerm.trim()) {
            setValidationError("Please enter a search term");
            return;
        }

        if (searchType?.requiresInstitution && !selectedInstitution) {
            setValidationError("Please select an institution");
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await axios.post(route("verify"), {
                search: searchTerm.trim(),
                type: searchType.value,
                institution_id: searchType?.requiresInstitution
                    ? selectedInstitution?.value
                    : null,
            });

            setResults(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "An error occurred while searching",
            );
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle search type change
    const handleTypeChange = (selectedOption) => {
        setSearchType(selectedOption);
        setSelectedInstitution(null); // Reset institution when search type changes
        setValidationError("");
    };

    // Handle institution change
    const handleInstitutionChange = (selectedOption) => {
        setSelectedInstitution(selectedOption);
        setValidationError("");
    };

    // Handle input change
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
        setValidationError("");
    };

    // Clear search
    const handleClear = () => {
        setSearchTerm("");
        setSelectedInstitution(null);
        setResults([]);
        setSearched(false);
        setError(null);
        setValidationError("");
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "38px",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    // Render single student card
    const renderStudentCard = (student) => (
        <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
                <Row>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block">
                            <FaUserGraduate
                                size={50}
                                className="text-primary"
                            />
                        </div>
                        <h4 className="mt-3 mb-0">{student.student_name}</h4>
                        <Badge bg="success" className="mt-2">
                            Verified Student
                        </Badge>
                    </Col>

                    <Col md={8}>
                        <Row>
                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaIdCard className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Parent ID Number
                                        </small>
                                        <strong>
                                            {student.parent_id_number || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaIdCard className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Admission Number
                                        </small>
                                        <strong>
                                            {student.admission_number || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaPhone className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Parent Phone
                                        </small>
                                        <strong>
                                            {student.parent_phone_number ||
                                                "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaUserGraduate className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Parent Name
                                        </small>
                                        <strong>
                                            {student.parent_name || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaUniversity className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Institution
                                        </small>
                                        <strong>
                                            {student.institution?.name || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaMapMarkerAlt className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Location
                                        </small>
                                        <strong>
                                            {student.location?.name || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            <Col sm={6} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <FaMapMarkerAlt className="text-primary me-2" />
                                    <div>
                                        <small className="text-muted d-block">
                                            Ward
                                        </small>
                                        <strong>
                                            {student.ward?.name || "N/A"}
                                        </strong>
                                    </div>
                                </div>
                            </Col>

                            {student.type && (
                                <Col sm={12} className="mt-2">
                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Application Type:</strong>{" "}
                                            {student.type}
                                        </div>
                                        <div>
                                            <strong>Amount:</strong> KES{" "}
                                            {student.amount?.toLocaleString() ||
                                                "N/A"}
                                        </div>
                                        <div>
                                            <Badge
                                                bg={
                                                    student.decision ===
                                                    "approved"
                                                        ? "success"
                                                        : student.decision ===
                                                            "rejected"
                                                          ? "danger"
                                                          : "warning"
                                                }
                                            >
                                                {student.decision || "Pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                </Col>
                            )}

                            {student.decision_reason && (
                                <Col sm={12} className="mt-2">
                                    <hr />
                                    <div>
                                        <strong>Reason:</strong>{" "}
                                        {student.decision_reason}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    // Render results table
    const renderResultsTable = () => (
        <Table responsive striped hover className="mt-4 shadow-sm">
            <thead className="bg-light">
                <tr>
                    <th>#</th>
                    <th>Admission.</th>
                    <th>Student Name</th>
                    <th>Phone</th>
                    <th>ID</th>
                    <th>Institution</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {results.map((student, index) => (
                    <tr key={student.id || index}>
                        <td>{index + 1}</td>
                        <td>{student.admission_number || "N/A"}</td>
                        <td>
                            <strong>{student.student_name}</strong>
                        </td>
                        <td>{student.parent_phone_number || "N/A"}</td>
                        <td>{student.parent_id_number || "N/A"}</td>
                        <td>{student.institution?.name || "N/A"}</td>
                        <td>
                            <Badge
                                bg={
                                    student.decision === "approved"
                                        ? "success"
                                        : student.decision === "rejected"
                                          ? "danger"
                                          : "warning"
                                }
                                className="text-capitalize"
                            >
                                {student.decision || "Pending"}
                            </Badge>
                            {student.decision_reason && (
                                <p className="m-0 text-danger">
                                    {student.decision_reason}
                                </p>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    // Render empty state
    const renderEmptyState = () => (
        <div className="text-center py-5">
            <div className="mb-3">
                <FaSearch size={50} className="text-muted opacity-50" />
            </div>
            <h5 className="text-muted">No results found</h5>
            <p className="text-muted">Try searching with different criteria</p>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Verify Student Information" />

            <Container className="py-4">
                <h2 className="mb-4">Verify Student Information</h2>

                {/* Search Section */}
                <Card className="shadow-sm border-0">
                    <Card.Body>
                        <Form onSubmit={handleSearch}>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Search by</Form.Label>
                                        <Select
                                            value={searchType}
                                            onChange={handleTypeChange}
                                            options={searchOptions}
                                            styles={selectStyles}
                                            placeholder="Select search type..."
                                            isSearchable={true}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Institution{" "}
                                            {searchType?.requiresInstitution && (
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            )}
                                        </Form.Label>
                                        <Select
                                            value={selectedInstitution}
                                            onChange={handleInstitutionChange}
                                            options={institutionOptions}
                                            styles={selectStyles}
                                            placeholder="Select institution..."
                                            isSearchable={true}
                                            isDisabled={
                                                !searchType?.requiresInstitution
                                            }
                                            isClearable={true}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Search term{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Enter ${searchType?.label?.toLowerCase() || "search term"}...`}
                                                value={searchTerm}
                                                onChange={
                                                    handleSearchTermChange
                                                }
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={2} className="d-flex align-items-end">
                                    <div className="mb-3 d-flex gap-2 w-100">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="flex-grow-1"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSearch />
                                                </>
                                            )}
                                        </Button>
                                        {searched && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handleClear}
                                            >
                                                <FaTimes />
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            {validationError && (
                                <Alert variant="warning" className="mt-2 mb-0">
                                    {validationError}
                                </Alert>
                            )}
                        </Form>
                    </Card.Body>
                </Card>

                {/* Results Section */}
                <Card className="shadow-sm border-0 mt-4">
                    <Card.Body>
                        {error && (
                            <Alert variant="danger" className="mt-4">
                                {error}
                            </Alert>
                        )}

                        {!loading && searched && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">
                                        Search Results ({results.length}{" "}
                                        {results.length === 1
                                            ? "record"
                                            : "records"}{" "}
                                        found)
                                    </h5>
                                </div>

                                {results.length === 0 && renderEmptyState()}

                                {results.length === 1 &&
                                    renderStudentCard(results[0])}

                                {results.length > 1 && renderResultsTable()}
                            </>
                        )}

                        {!loading && !searched && (
                            <div className="text-center py-5">
                                <FaSearch
                                    size={40}
                                    className="text-muted opacity-25 mb-3"
                                />
                                <h5 className="text-muted">
                                    Enter search criteria and click Search to
                                    verify student information
                                </h5>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </AppLayout>
    );
};

export default Verify;
