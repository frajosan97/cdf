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
} from "react-bootstrap";
import {
    FileEarmarkPdf,
    Download,
    Printer,
    ArrowRepeat,
    PersonBadge,
    GeoAlt,
} from "react-bootstrap-icons";
import { useState, useEffect, useMemo } from "react";
import PdfViewer from "@/Components/PdfViewer";
import Select from "react-select";

const MeritList = ({ data, pdf, wards, locations, filters, stats }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeFromUrl = urlParams.get("type") || data?.type || "constituency";
    const idFromUrl = urlParams.get("id") || data?.id || "";

    const [selectedType, setSelectedType] = useState(() => {
        return {
            value: typeFromUrl,
            label:
                typeFromUrl === "constituency"
                    ? "Constituency Wide"
                    : capitalizeFirst(typeFromUrl),
        };
    });

    const [selectedEntity, setSelectedEntity] = useState(() => {
        if (idFromUrl && typeFromUrl !== "constituency") {
            const entityList = typeFromUrl === "ward" ? wards : locations;
            const entity = entityList?.find(
                (e) => e.id.toString() === idFromUrl,
            );
            if (entity) {
                return {
                    value: entity.id.toString(),
                    label: entity.name,
                };
            }
        }
        return null;
    });

    const [loading, setLoading] = useState(false);
    const [pdfData, setPdfData] = useState(pdf);
    const [showPdf, setShowPdf] = useState(true);
    const [error, setError] = useState(null);

    // Transform wards for react-select
    const wardOptions = useMemo(() => {
        return (
            wards?.map((ward) => ({
                value: ward.id.toString(),
                label: ward.name,
            })) || []
        );
    }, [wards]);

    // Transform locations for react-select
    const locationOptions = useMemo(() => {
        return (
            locations?.map((location) => ({
                value: location.id.toString(),
                label: location.name,
                ward_id: location.ward_id,
            })) || []
        );
    }, [locations]);

    // Get current options based on selected type
    const entityOptions = useMemo(() => {
        if (selectedType?.value === "ward") {
            return wardOptions;
        } else if (selectedType?.value === "location") {
            return locationOptions;
        }
        return [];
    }, [selectedType, wardOptions, locationOptions]);

    // Auto-select based on URL or data
    useEffect(() => {
        if (data?.type && data?.id && data?.type !== "constituency") {
            const entityList = data.type === "ward" ? wards : locations;
            const entity = entityList?.find((e) => e.id.toString() === data.id);
            if (entity) {
                setSelectedEntity({
                    value: entity.id.toString(),
                    label: entity.name,
                });
            }
        }
    }, [data, wards, locations]);

    useEffect(() => {
        // Update PDF when data changes
        if (pdf) {
            setPdfData(pdf);
            setShowPdf(true);
            setError(null);
            setLoading(false);
        }
    }, [pdf]);

    // Helper functions
    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Get current display name
    const getCurrentDisplayName = () => {
        if (selectedType?.value === "constituency") return "Constituency Wide";
        if (selectedEntity) return selectedEntity.label;
        return "Select...";
    };

    // Handle type change
    const handleTypeChange = (selectedOption) => {
        if (!selectedOption) return;

        setSelectedType(selectedOption);
        setSelectedEntity(null);
        setLoading(true);
        setShowPdf(false);
        setError(null);

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set("type", selectedOption.value);
        url.searchParams.delete("id");
        window.history.pushState({}, "", url);

        // Auto-generate for constituency
        if (selectedOption.value === "constituency") {
            router.get(
                route("reports.merit.preview", { type: "constituency" }),
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
                            errors.message || "Failed to generate merit list",
                        );
                        setLoading(false);
                    },
                },
            );
        } else {
            setLoading(false);
        }
    };

    // Handle entity change
    const handleEntityChange = (selectedOption) => {
        if (!selectedOption) {
            setSelectedEntity(null);
            setPdfData(null);
            setShowPdf(false);

            // Update URL
            const url = new URL(window.location);
            url.searchParams.delete("id");
            window.history.pushState({}, "", url);
            return;
        }

        setSelectedEntity(selectedOption);
        setLoading(true);
        setShowPdf(false);
        setError(null);

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set("type", selectedType.value);
        url.searchParams.set("id", selectedOption.value);
        window.history.pushState({}, "", url);

        // Generate report for selected entity
        router.get(
            route("reports.merit.preview", {
                type: selectedType.value,
                id: selectedOption.value,
            }),
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
                    setError(errors.message || "Failed to generate merit list");
                    setLoading(false);
                },
            },
        );
    };

    // Handle download
    const handleDownload = () => {
        if (!pdfData) return;

        const entityName = selectedEntity
            ? selectedEntity.label.replace(/\s+/g, "-").toLowerCase()
            : "constituency";

        // Create download link
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${pdfData}`;
        link.download = `merit-list-${entityName}-${new Date().toISOString().split("T")[0]}.pdf`;
        link.click();
    };

    // Handle print
    const handlePrint = () => {
        if (!pdfData) return;

        // Open PDF in new window for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            setError("Popup blocked. Please allow popups for this site.");
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Merit List - ${selectedEntity?.label || "Constituency Wide"}</title>
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
    };

    // Handle refresh
    const handleRefresh = () => {
        if (!selectedType) {
            setError("Please select a report type first");
            return;
        }

        setLoading(true);
        setError(null);

        const params = {
            type: selectedType.value,
        };

        if (selectedEntity) {
            params.id = selectedEntity.value;
        }

        router.get(
            route("reports.merit.preview", params),
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
                    setError(errors.message || "Failed to refresh");
                    setLoading(false);
                },
            },
        );
    };

    // Type options
    const typeOptions = [
        { value: "constituency", label: "Constituency Wide" },
        { value: "ward", label: "Ward" },
        { value: "location", label: "Location" },
    ];

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
            <Head title={data?.title || "Merit List"} />

            <Container fluid>
                {/* Header with title and stats */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h3 className="mb-0 text-capitalize">
                            {data?.title || "Merit List"}
                        </h3>
                        <small className="text-muted">
                            Generate and view merit lists for approved
                            applicants
                        </small>
                        {data?.generated_at && (
                            <small className="text-muted ms-3">
                                Last generated: {data.generated_at}
                            </small>
                        )}
                    </Col>
                    <Col xs="auto">
                        <Badge bg="info" className="p-2 me-2">
                            <PersonBadge className="me-1" size={14} />
                            {getCurrentDisplayName()}
                        </Badge>
                        {stats && (
                            <>
                                <Badge bg="success" className="p-2 me-2">
                                    <PersonBadge className="me-1" size={14} />
                                    {stats.total_approved || 0} Approved
                                </Badge>
                                <Badge bg="secondary" className="p-2">
                                    <GeoAlt className="me-1" size={14} />
                                    {data?.statistics?.total_applicants ||
                                        0}{" "}
                                    Total
                                </Badge>
                            </>
                        )}
                    </Col>
                </Row>

                {/* Controls Row */}
                <Row className="mb-4 g-3">
                    <Col md={6} lg={7}>
                        <div className="d-flex gap-2">
                            <div style={{ width: "200px" }}>
                                <Select
                                    options={typeOptions}
                                    value={selectedType}
                                    onChange={handleTypeChange}
                                    isDisabled={loading}
                                    placeholder="Report type..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    isClearable={false}
                                    isSearchable={false}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Select
                                    options={entityOptions}
                                    value={selectedEntity}
                                    onChange={handleEntityChange}
                                    isDisabled={
                                        loading ||
                                        !selectedType ||
                                        selectedType.value === "constituency"
                                    }
                                    placeholder={
                                        selectedType?.value === "constituency"
                                            ? "Constituency wide"
                                            : `Search ${selectedType?.value}...`
                                    }
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    isClearable={true}
                                    isSearchable={true}
                                    loadingMessage={() =>
                                        `Loading ${selectedType?.value}s...`
                                    }
                                    noOptionsMessage={() =>
                                        `No ${selectedType?.value}s found`
                                    }
                                />
                            </div>
                        </div>
                        <Form.Text className="text-muted">
                            {selectedType?.value === "constituency"
                                ? "Constituency wide report generates automatically"
                                : `Select a ${selectedType?.value} to generate its merit list`}
                        </Form.Text>
                    </Col>
                    <Col md={6} lg={5}>
                        <div className="d-flex gap-2 justify-content-md-end">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={loading || !selectedType}
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
                                onClick={handleDownload}
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
                                            Generating merit list...
                                        </p>
                                        <small className="text-muted">
                                            This may take a few moments
                                        </small>
                                    </div>
                                ) : showPdf && pdfData ? (
                                    <PdfViewer
                                        pdfBase64={pdfData}
                                        title={`Merit List - ${selectedEntity?.label || "Constituency Wide"}`}
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
                                            {!selectedType
                                                ? "Please select a report type to generate a merit list"
                                                : selectedType.value !==
                                                        "constituency" &&
                                                    !selectedEntity
                                                  ? `Select a ${selectedType.value} to generate its merit list`
                                                  : "Click refresh to generate the merit list"}
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

export default MeritList;
