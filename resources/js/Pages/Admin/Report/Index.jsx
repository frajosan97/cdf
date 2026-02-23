import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, Col, Container, Row, Button, Table } from "react-bootstrap";
import {
    FileEarmarkPdf,
    FileEarmarkExcel,
    Download,
    Grid,
    People,
    GeoAlt,
    CheckCircle,
    XCircle,
    Clock,
} from "react-bootstrap-icons";
import { useState, useMemo, useCallback } from "react";

const Reports = ({ wards = [], stats = {} }) => {
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Memoize report categories to prevent unnecessary re-renders
    const reportCategories = useMemo(
        () => [
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
                        actionUrl: route("reports.voucher"),
                        color: "success",
                        icon: (
                            <FileEarmarkExcel
                                className="text-success"
                                size={20}
                            />
                        ),
                    },
                ],
            },
            {
                title: "Forwarding Letters",
                icon: <GeoAlt className="me-2" />,
                color: "info",
                reports: [
                    {
                        name: "Forwarding Letters",
                        description:
                            "Official forwarding letters for institutions",
                        formats: ["pdf"],
                        action: "forwarding",
                        actionUrl: route("reports.forwarding.letter"),
                        color: "danger",
                        icon: (
                            <FileEarmarkPdf className="text-danger" size={20} />
                        ),
                    },
                ],
            },
        ],
        [],
    );

    // Memoize helper functions
    const getFormatIcon = useCallback((format) => {
        switch (format) {
            case "pdf":
                return <FileEarmarkPdf className="text-danger" size={16} />;
            case "excel":
                return <FileEarmarkExcel className="text-success" size={16} />;
            default:
                return null;
        }
    }, []);

    const getFormatLabel = useCallback((format) => {
        return format === "pdf" ? "PDF" : "Excel";
    }, []);

    // Calculate total locations for rowspan
    const totalLocations = useMemo(() => {
        return wards.reduce(
            (total, ward) => total + (ward.locations?.length || 0),
            0,
        );
    }, [wards]);

    // Handle report generation
    const handleReportGeneration = useCallback(
        async (actionUrl, format, id, type) => {
            try {
                setLoading(true);
                setDownloadingId(`${type}-${id}-${format}`);
                // Add your report generation logic here
                // You can modify this to include the ID in the URL
                const url = new URL(actionUrl, window.location.origin);
                if (id) {
                    url.searchParams.append("id", id);
                    url.searchParams.append("type", type);
                }
                url.searchParams.append("format", format);

                window.location.href = url.toString();
            } catch (error) {
                console.error("Error generating report:", error);
            } finally {
                setLoading(false);
                setDownloadingId(null);
            }
        },
        [],
    );

    // Handle constituency report download
    const handleMeritDownload = useCallback(
        (format) => {
            handleReportGeneration(
                route("reports.merit-list"),
                format,
                "kitui-rural",
                "constituency",
            );
        },
        [handleReportGeneration],
    );

    // Stats configuration for DRY code
    const statsConfig = useMemo(
        () => [
            {
                key: "total_approved",
                label: "Approved",
                icon: CheckCircle,
                color: "success",
                value: stats?.total_approved || 0,
                format: "number",
            },
            {
                key: "total_pending",
                label: "Pending",
                icon: Clock,
                color: "warning",
                value: stats?.total_pending || 0,
                format: "number",
            },
            {
                key: "total_rejected",
                label: "Rejected",
                icon: XCircle,
                color: "danger",
                value: stats?.total_rejected || 0,
                format: "number",
            },
            {
                key: "total_bursary",
                label: "Total Bursary",
                icon: People,
                color: "info",
                value: stats?.total_bursary || 0,
                format: "currency",
            },
        ],
        [stats],
    );

    // Format value based on type
    const formatValue = useCallback((value, format) => {
        if (format === "currency") {
            return `KES ${new Intl.NumberFormat().format(value)}`;
        }
        return new Intl.NumberFormat().format(value);
    }, []);

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

                {/* Stats Overview - Dynamically rendered */}
                <Row className="mb-4 g-3">
                    {statsConfig.map((stat) => {
                        const IconComponent = stat.icon;
                        return (
                            <Col md={3} key={stat.key}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`bg-${stat.color} bg-opacity-10 p-3 rounded-circle`}
                                            >
                                                <IconComponent
                                                    className={`text-${stat.color}`}
                                                    size={24}
                                                />
                                            </div>
                                            <div className="ms-3">
                                                <h3 className="h4 mb-1">
                                                    {formatValue(
                                                        stat.value,
                                                        stat.format,
                                                    )}
                                                </h3>
                                                <p className="text-muted mb-0">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Reports Grid */}
                <Row>
                    {reportCategories.map((category, categoryIndex) => (
                        <Col lg={6} key={category.title} className="mb-4">
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
                                                key={report.name}
                                                className={`mb-3 ${
                                                    reportIndex <
                                                    category.reports.length - 1
                                                        ? "border-bottom pb-3"
                                                        : ""
                                                }`}
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
                                                                    ) => (
                                                                        <Button
                                                                            key={
                                                                                format
                                                                            }
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            className="d-flex align-items-center gap-1 border"
                                                                            onClick={() =>
                                                                                handleReportGeneration(
                                                                                    report.actionUrl,
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

                {/* Wards and Locations Table with Download Buttons */}
                {wards.length > 0 && (
                    <Row>
                        <Col>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0">
                                        Constituency, Wards & Locations Reports
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table
                                        responsive
                                        bordered
                                        hover
                                        className="mb-0 align-middle"
                                    >
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Constituency</th>
                                                <th>Ward</th>
                                                <th>Location</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wards.map((ward, wardIndex) =>
                                                ward.locations?.map(
                                                    (location, locIndex) => (
                                                        <tr
                                                            key={`${ward.id}-${location.id}`}
                                                        >
                                                            {/* Constituency - spans all rows with download buttons */}
                                                            {wardIndex === 0 &&
                                                                locIndex ===
                                                                    0 && (
                                                                    <td
                                                                        rowSpan={
                                                                            totalLocations
                                                                        }
                                                                        className="align-middle bg-light bg-opacity-25"
                                                                        style={{
                                                                            verticalAlign:
                                                                                "middle",
                                                                        }}
                                                                    >
                                                                        <div className="d-flex flex-column gap-2">
                                                                            <strong>
                                                                                Kitui
                                                                                Rural
                                                                                Constituency
                                                                            </strong>
                                                                            <div className="d-flex gap-2">
                                                                                <Button
                                                                                    as={
                                                                                        Link
                                                                                    }
                                                                                    size="sm"
                                                                                    variant="outline-danger"
                                                                                    className="d-flex align-items-center gap-1"
                                                                                    href={route(
                                                                                        "reports.merit-list",
                                                                                        {
                                                                                            type: "constituency",
                                                                                            id: "kitui-rural",
                                                                                            format: "pdf",
                                                                                        },
                                                                                    )}
                                                                                >
                                                                                    <FileEarmarkPdf
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />
                                                                                    <span>
                                                                                        PDF
                                                                                    </span>
                                                                                </Button>
                                                                                <Button
                                                                                    as={
                                                                                        Link
                                                                                    }
                                                                                    size="sm"
                                                                                    variant="outline-success"
                                                                                    className="d-flex align-items-center gap-1"
                                                                                    href={route(
                                                                                        "reports.merit-list",
                                                                                        {
                                                                                            type: "constituency",
                                                                                            id: "kitui-rural",
                                                                                            format: "excel",
                                                                                        },
                                                                                    )}
                                                                                >
                                                                                    <FileEarmarkExcel
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />
                                                                                    <span>
                                                                                        Excel
                                                                                    </span>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )}

                                                            {/* Ward - spans its locations with download buttons */}
                                                            {locIndex === 0 && (
                                                                <td
                                                                    rowSpan={
                                                                        ward
                                                                            .locations
                                                                            .length
                                                                    }
                                                                    className="align-middle"
                                                                    style={{
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    <div className="d-flex flex-column gap-2">
                                                                        <strong>
                                                                            {
                                                                                ward.name
                                                                            }
                                                                        </strong>
                                                                        <div className="d-flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-danger"
                                                                                className="d-flex align-items-center gap-1"
                                                                                href={route(
                                                                                    "reports.merit-list",
                                                                                    {
                                                                                        type: "ward",
                                                                                        id: ward.id,
                                                                                        format: "pdf",
                                                                                    },
                                                                                )}
                                                                            >
                                                                                <FileEarmarkPdf
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    PDF
                                                                                </span>
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-success"
                                                                                className="d-flex align-items-center gap-1"
                                                                                href={route(
                                                                                    "reports.merit-list",
                                                                                    {
                                                                                        type: "ward",
                                                                                        id: ward.id,
                                                                                        format: "excel",
                                                                                    },
                                                                                )}
                                                                            >
                                                                                <FileEarmarkExcel
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    Excel
                                                                                </span>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            )}

                                                            {/* Location with download buttons */}
                                                            <td className="align-middle">
                                                                <div className="d-flex flex-column gap-2">
                                                                    <span>
                                                                        {
                                                                            location.name
                                                                        }
                                                                    </span>
                                                                    <div className="d-flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-danger"
                                                                            className="d-flex align-items-center gap-1"
                                                                            href={route(
                                                                                "reports.merit-list",
                                                                                {
                                                                                    type: "location",
                                                                                    id: location.id,
                                                                                    format: "pdf",
                                                                                },
                                                                            )}
                                                                        >
                                                                            <FileEarmarkPdf
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            <span>
                                                                                PDF
                                                                            </span>
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-success"
                                                                            className="d-flex align-items-center gap-1"
                                                                            href={route(
                                                                                "reports.merit-list",
                                                                                {
                                                                                    type: "location",
                                                                                    id: location.id,
                                                                                    format: "excel",
                                                                                },
                                                                            )}
                                                                        >
                                                                            <FileEarmarkExcel
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            <span>
                                                                                Excel
                                                                            </span>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                ),
                                            )}
                                        </tbody>
                                    </Table>

                                    {wards.length === 0 && (
                                        <p className="text-muted text-center py-4 mb-0">
                                            No wards or locations available
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </AuthenticatedLayout>
    );
};

export default Reports;
