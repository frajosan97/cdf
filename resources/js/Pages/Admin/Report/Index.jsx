import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Card, Col, Container, Row, Button } from "react-bootstrap";
import {
    FileEarmarkPdf,
    FileEarmarkExcel,
    Download,
    Grid,
    Building,
    People,
    GeoAlt,
    CheckCircle,
    XCircle,
    Clock,
} from "react-bootstrap-icons";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const Reports = ({ institutions, wards, locations, stats }) => {
    const [loading, setLoading] = useState(false);

    const reportCategories = [
        {
            title: "Bursary Management",
            icon: <Grid className="me-2" />,
            color: "primary",
            reports: [
                {
                    name: "Bursary Vouchers",
                    description:
                        "Generate bursary vouchers for approved applicants",
                    formats: ["excel"],
                    action: "voucher",
                    color: "success",
                    icon: (
                        <FileEarmarkExcel className="text-success" size={20} />
                    ),
                },
                {
                    name: "Forwarding Letters",
                    description: "Official forwarding letters for institutions",
                    formats: ["pdf"],
                    action: "forwarding",
                    color: "danger",
                    icon: <FileEarmarkPdf className="text-danger" size={20} />,
                },
            ],
        },
        {
            title: "Location Reports",
            icon: <GeoAlt className="me-2" />,
            color: "info",
            reports: [
                {
                    name: "Wards List",
                    description: "Complete list of all wards with statistics",
                    formats: ["pdf", "excel"],
                    action: "wards",
                    color: "primary",
                    icon: <Building className="text-primary" size={20} />,
                },
                {
                    name: "Locations List",
                    description:
                        "Comprehensive list of all locations with statistics",
                    formats: ["pdf", "excel"],
                    action: "locations",
                    color: "primary",
                    icon: <GeoAlt className="text-primary" size={20} />,
                },
            ],
        },
    ];

    // In your Reports component, update the handleDownload function:
    const handleDownload = (report, format) => {
        setLoading(true);

        if (report.action === "voucher") {
            window.location.href = route("reports.voucher") + "?all=true";
        } else if (report.action === "forwarding") {
            // Navigate to forwarding letter page which will display PDF inline
            router.get(route("reports.forwarding.letter"));
        } else if (report.action === "wards") {
            if (format === "pdf") {
                // For PDF, navigate to viewer
                router.get(route("reports.wards", { format, view: "inline" }));
            } else {
                window.location.href = route("reports.wards", { format });
            }
        } else if (report.action === "locations") {
            if (format === "pdf") {
                // For PDF, navigate to viewer
                router.get(
                    route("reports.locations", { format, view: "inline" }),
                );
            } else {
                window.location.href = route("reports.locations", { format });
            }
        }

        // Reset loading after a short delay
        setTimeout(() => setLoading(false), 1000);
    };

    const getFormatIcon = (format) => {
        switch (format) {
            case "pdf":
                return <FileEarmarkPdf className="text-danger" size={16} />;
            case "excel":
                return <FileEarmarkExcel className="text-success" size={16} />;
            default:
                return null;
        }
    };

    const getFormatLabel = (format) => {
        return format === "pdf" ? "PDF" : "Excel";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />

            <Container fluid>
                {/* Header Section */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h1 className="h2 mb-1 fw-bold">
                                    Reports Management
                                </h1>
                                <p className="text-muted mb-0">
                                    Generate and download reports for
                                    scholarship management
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Stats Overview */}
                <Row className="mb-4 g-3">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                        <CheckCircle
                                            className="text-success"
                                            size={24}
                                        />
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="h4 mb-1">
                                            {stats?.total_approved || 0}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            Approved
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                        <Clock
                                            className="text-warning"
                                            size={24}
                                        />
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="h4 mb-1">
                                            {stats?.total_pending || 0}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            Pending
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                                        <XCircle
                                            className="text-danger"
                                            size={24}
                                        />
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="h4 mb-1">
                                            {stats?.total_rejected || 0}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            Rejected
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                        <People
                                            className="text-info"
                                            size={24}
                                        />
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="h4 mb-1">
                                            KES{" "}
                                            {new Intl.NumberFormat().format(
                                                stats?.total_bursary || 0,
                                            )}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            Total Bursary
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Reports Grid */}
                <Row>
                    {reportCategories.map((category, categoryIndex) => (
                        <Col lg={6} key={categoryIndex} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <div className="d-flex align-items-center">
                                        <div
                                            className={`bg-${category.color} bg-opacity-10 p-2 rounded`}
                                        >
                                            {category.icon}
                                        </div>
                                        <h5 className="mb-0 ms-2">
                                            {category.title}
                                        </h5>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {category.reports.map(
                                        (report, reportIndex) => (
                                            <div
                                                key={reportIndex}
                                                className={`mb-3 ${reportIndex < category.reports.length - 1 ? "border-bottom pb-3" : ""}`}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="d-flex">
                                                        <div className="me-3">
                                                            {report.icon}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1 fw-semibold">
                                                                {report.name}
                                                            </h6>
                                                            <p className="text-muted small mb-2">
                                                                {
                                                                    report.description
                                                                }
                                                            </p>
                                                            <div className="d-flex gap-2">
                                                                {report.formats.map(
                                                                    (
                                                                        format,
                                                                        formatIndex,
                                                                    ) => (
                                                                        <Button
                                                                            key={
                                                                                formatIndex
                                                                            }
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            className="d-flex align-items-center gap-1 border"
                                                                            onClick={() =>
                                                                                handleDownload(
                                                                                    report,
                                                                                    format,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                loading
                                                                            }
                                                                        >
                                                                            {getFormatIcon(
                                                                                format,
                                                                            )}
                                                                            <span className="ms-1">
                                                                                {getFormatLabel(
                                                                                    format,
                                                                                )}
                                                                            </span>
                                                                            <Download
                                                                                size={
                                                                                    12
                                                                                }
                                                                                className="ms-1"
                                                                            />
                                                                        </Button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
};

export default Reports;
