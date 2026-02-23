import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
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
} from "react-bootstrap";
import {
    FileEarmarkPdf,
    Download,
    Building,
    Printer,
    ArrowRepeat,
} from "react-bootstrap-icons";
import { useState, useEffect, useMemo } from "react";
import PdfViewer from "@/Components/PdfViewer";
import Select from "react-select";

const ForwardingLetter = ({ data, pdf, institutions }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const institutionIdFromUrl = urlParams.get("institution_id") || "all";

    const [selectedInstitution, setSelectedInstitution] = useState(() => {
        // Auto-select based on URL or first institution if available
        if (institutionIdFromUrl !== "all") {
            return {
                value: institutionIdFromUrl,
                label:
                    institutions?.find((i) => i.id == institutionIdFromUrl)
                        ?.name || "All Institutions",
            };
        }
        return { value: "all", label: "All Institutions" };
    });

    const [loading, setLoading] = useState(false);
    const [pdfData, setPdfData] = useState(pdf);
    const [showPdf, setShowPdf] = useState(true);
    const [error, setError] = useState(null);

    // Transform institutions for react-select
    const institutionOptions = useMemo(() => {
        const options = [
            { value: "all", label: "All Institutions" },
            ...(institutions?.map((inst) => ({
                value: inst.id.toString(),
                label: `${inst.name} (${inst.code})`,
                institution: inst,
            })) || []),
        ];
        return options;
    }, [institutions]);

    // Auto-select current institution based on URL or data
    useEffect(() => {
        // If there's data for a single institution, auto-select it
        if (data?.type === "single" && data?.institutions?.[0]) {
            const inst = data.institutions[0];
            setSelectedInstitution({
                value: inst.id.toString(),
                label: `${inst.name} (${inst.code})`,
            });
        }
    }, [data]);

    useEffect(() => {
        // Update PDF when data changes
        if (pdf) {
            setPdfData(pdf);
            setShowPdf(true);
            setError(null);
        }
    }, [pdf]);

    const handleInstitutionChange = (selectedOption) => {
        if (!selectedOption) return;

        setSelectedInstitution(selectedOption);
        setLoading(true);
        setShowPdf(false);
        setError(null);

        const value = selectedOption.value;

        if (value === "all") {
            router.get(
                route("reports.forwarding.letter"),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setPdfData(page.props.pdf);
                        setShowPdf(true);
                        setLoading(false);
                    },
                    onError: (errors) => {
                        setError(
                            errors.message ||
                                "Failed to load forwarding letter",
                        );
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
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setPdfData(page.props.pdf);
                        setShowPdf(true);
                        setLoading(false);
                    },
                    onError: (errors) => {
                        setError(
                            errors.message ||
                                "Failed to load forwarding letter",
                        );
                        setLoading(false);
                    },
                },
            );
        }
    };

    const handleDownloadPDF = () => {
        if (pdfData) {
            const institutionName =
                selectedInstitution?.value === "all"
                    ? "all-institutions"
                    : institutions
                          ?.find(
                              (i) =>
                                  i.id.toString() === selectedInstitution.value,
                          )
                          ?.name?.replace(/\s+/g, "-")
                          .toLowerCase() || "forwarding-letter";

            // Create download link
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${pdfData}`;
            link.download = `forwarding-letter-${institutionName}-${new Date().toISOString().split("T")[0]}.pdf`;
            link.click();
        }
    };

    const handlePrint = () => {
        if (pdfData) {
            // Open PDF in new window for printing
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                setError("Popup blocked. Please allow popups for this site.");
                return;
            }

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Forwarding Letter - ${selectedInstitution?.label || "NG-CDF"}</title>
                        <style>
                            body, html { margin: 0; padding: 0; height: 100%; }
                            embed { width: 100%; height: 100%; }
                        </style>
                    </head>
                    <body>
                        <embed src="data:application/pdf;base64,${pdfData}" type="application/pdf" width="100%" height="100%" />
                    </body>
                </html>
            `);
            printWindow.document.close();

            // Trigger print after PDF loads
            setTimeout(() => {
                try {
                    printWindow.focus();
                    printWindow.print();
                } catch (e) {
                    setError("Unable to print. Please try downloading first.");
                }
            }, 1000);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setError(null);
        router.reload({
            onSuccess: () => {
                setLoading(false);
            },
            onError: (errors) => {
                setError(errors.message || "Failed to refresh");
                setLoading(false);
            },
        });
    };

    // Get current institution display name
    const currentInstitutionDisplay = useMemo(() => {
        if (selectedInstitution?.value === "all") return "All Institutions";
        const inst = institutions?.find(
            (i) => i.id.toString() === selectedInstitution?.value,
        );
        return inst ? `${inst.name} (${inst.code})` : "Select Institution";
    }, [selectedInstitution, institutions]);

    // Custom styles for react-select
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "45px",
            border: state.isFocused ? "2px solid #0d6efd" : "1px solid #dee2e6",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#0d6efd",
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#0d6efd"
                : state.isFocused
                  ? "#e7f1ff"
                  : "white",
            color: state.isSelected ? "white" : "black",
            cursor: "pointer",
            padding: "10px 12px",
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#6c757d",
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: "500",
        }),
    };

    return (
        <AuthenticatedLayout>
            <Head title="Forwarding Letter" />

            <Container fluid>
                {/* Header with title and stats */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h3 className="mb-0">Forwarding Letter</h3>
                        <small className="text-muted">
                            Generate and manage bursary forwarding letters
                        </small>
                    </Col>
                    <Col xs="auto">
                        <Badge bg="info" className="p-2">
                            <Building className="me-1" size={14} />
                            {currentInstitutionDisplay}
                        </Badge>
                    </Col>
                </Row>

                {/* Controls Row */}
                <Row className="mb-4 g-3">
                    <Col md={6} lg={7}>
                        <Select
                            options={institutionOptions}
                            value={selectedInstitution}
                            onChange={handleInstitutionChange}
                            isDisabled={loading}
                            placeholder="Search institution..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={selectStyles}
                            isClearable={false}
                            isSearchable={true}
                            loadingMessage={() => "Loading institutions..."}
                            noOptionsMessage={() => "No institutions found"}
                        />
                        <Form.Text className="text-muted">
                            Select an institution to generate its forwarding
                            letter
                        </Form.Text>
                    </Col>
                    <Col md={6} lg={5}>
                        <div className="d-flex gap-2 justify-content-md-end">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="d-flex align-items-center gap-2"
                            >
                                <ArrowRepeat
                                    size={16}
                                    className={loading ? "spin" : ""}
                                />
                                Refresh
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!pdfData || loading}
                                className="d-flex align-items-center gap-2"
                            >
                                <Printer size={16} />
                                Print
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={!pdfData || loading}
                                className="d-flex align-items-center gap-2"
                            >
                                <Download size={16} />
                                Download PDF
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Error Alert */}
                {error && (
                    <Row className="mb-4">
                        <Col>
                            <Alert
                                variant="danger"
                                onClose={() => setError(null)}
                                dismissible
                                className="mb-0"
                            >
                                <Alert.Heading className="fs-6">
                                    Error
                                </Alert.Heading>
                                <p className="mb-0 small">{error}</p>
                            </Alert>
                        </Col>
                    </Row>
                )}

                {/* PDF Viewer */}
                <Row>
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <Card.Body
                                className="p-0"
                                style={{ height: "calc(100vh - 350px)" }}
                            >
                                {loading ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <Spinner
                                            animation="border"
                                            variant="primary"
                                            style={{
                                                width: "3rem",
                                                height: "3rem",
                                            }}
                                        />
                                        <p className="mt-3 text-muted">
                                            Generating forwarding letter...
                                        </p>
                                        <small className="text-muted">
                                            This may take a few moments
                                        </small>
                                    </div>
                                ) : showPdf && pdfData ? (
                                    <PdfViewer
                                        pdfBase64={pdfData}
                                        title={`Forwarding Letter - ${currentInstitutionDisplay}`}
                                    />
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <FileEarmarkPdf
                                            size={64}
                                            className="text-muted mb-3 opacity-50"
                                        />
                                        <h5 className="text-muted mb-2">
                                            No PDF Available
                                        </h5>
                                        <p className="text-muted small text-center px-4">
                                            {selectedInstitution?.value ===
                                            "all"
                                                ? "Select 'All Institutions' to generate a combined forwarding letter"
                                                : "Please select an institution to generate its forwarding letter"}
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Add spin animation for refresh button */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </AuthenticatedLayout>
    );
};

export default ForwardingLetter;
