import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    Card,
    Col,
    Container,
    Row,
    Button,
    Form,
    Alert,
    Spinner,
    Badge,
    ButtonGroup,
} from "react-bootstrap";
import {
    FileEarmarkPdf,
    Download,
    Building,
    ArrowLeft,
    Eye,
    Printer,
} from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import PdfViewer from "@/Components/PdfViewer";

const ForwardingLetter = ({
    data,
    pdf,
    institutions,
    approvedApplicants,
    groupedApplicants,
}) => {
    const [selectedInstitution, setSelectedInstitution] = useState("all");
    const [loading, setLoading] = useState(false);
    const [pdfData, setPdfData] = useState(pdf);
    const [showPdf, setShowPdf] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Update PDF when data changes
        if (pdf) {
            setPdfData(pdf);
            setShowPdf(true);
            setError(null);
        }
    }, [pdf]);

    const handleInstitutionChange = (e) => {
        const value = e.target.value;
        setSelectedInstitution(value);
        setLoading(true);
        setShowPdf(false);

        if (value === "all") {
            router.get(
                route("reports.forwarding.letter"),
                {},
                {
                    preserveState: true,
                    onSuccess: (page) => {
                        setPdfData(page.props.pdf);
                        setShowPdf(true);
                        setLoading(false);
                    },
                    onError: () => {
                        setError("Failed to load forwarding letter");
                        setLoading(false);
                    },
                },
            );
        } else {
            router.get(
                route("reports.institution.forwarding.letter", value),
                {},
                {
                    preserveState: true,
                    onSuccess: (page) => {
                        setPdfData(page.props.pdf);
                        setShowPdf(true);
                        setLoading(false);
                    },
                    onError: () => {
                        setError("Failed to load forwarding letter");
                        setLoading(false);
                    },
                },
            );
        }
    };

    const handleDownloadPDF = () => {
        if (pdfData) {
            // Create download link
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${pdfData}`;
            link.download = `forwarding-letter-${selectedInstitution}-${new Date().toISOString().split("T")[0]}.pdf`;
            link.click();
        }
    };

    const handlePrint = () => {
        if (pdfData) {
            // Open PDF in new window for printing
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Forwarding Letter</title>
                        <style>
                            body, html { margin: 0; padding: 0; height: 100%; }
                            embed { width: 100%; height: 100%; }
                        </style>
                    </head>
                    <body>
                        <embed src="data:application/pdf;base64,${pdfData}" type="application/pdf" />
                    </body>
                </html>
            `);
            printWindow.document.close();

            // Trigger print after PDF loads
            setTimeout(() => {
                printWindow.print();
            }, 1000);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        router.reload({
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Forwarding Letter" />

            <Container fluid>
                {/* Header with controls */}
                <Row className="mb-4">
                    <Col>
                        <h4 className="mb-0">
                            {data.type === "all"
                                ? "All Institutions"
                                : "Single Institution"}{" "}
                            • {data.applicants?.length || 0} Students
                        </h4>
                    </Col>
                    <Col className="text-end">
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!pdfData || loading}
                                className="d-flex align-items-center gap-2 rounded"
                            >
                                <Printer size={16} />
                                Print
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={!pdfData || loading}
                                className="d-flex align-items-center gap-2 rounded"
                            >
                                <Download size={16} />
                                PDF
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Institution Filter */}
                {/* <Row className="mb-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-semibold mb-2">
                                        <Building className="me-2" size={16} />
                                        Select Institution
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedInstitution}
                                        onChange={handleInstitutionChange}
                                        className="border-0 bg-light"
                                        disabled={loading}
                                    >
                                        <option value="all">
                                            All Institutions
                                        </option>
                                        {institutions?.map((inst) => (
                                            <option
                                                key={inst.id}
                                                value={inst.id}
                                            >
                                                {inst.name} ({inst.code})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row> */}

                {/* Error Alert */}
                {error && (
                    <Row className="mb-4">
                        <Col>
                            <Alert
                                variant="danger"
                                onClose={() => setError(null)}
                                dismissible
                            >
                                {error}
                            </Alert>
                        </Col>
                    </Row>
                )}

                {/* PDF Viewer */}
                <Row>
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner
                                            animation="border"
                                            variant="primary"
                                        />
                                        <p className="mt-3 text-muted">
                                            Generating forwarding letter...
                                        </p>
                                    </div>
                                ) : showPdf && pdfData ? (
                                    <PdfViewer
                                        pdfBase64={pdfData}
                                        title="Forwarding Letter"
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <FileEarmarkPdf
                                            size={48}
                                            className="text-muted mb-3"
                                        />
                                        <p className="text-muted">
                                            No PDF available. Please select an
                                            institution.
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
};

export default ForwardingLetter;
