import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";

export default function Dashboard({ dashboardData }) {
    const { statsCards = [], categoryStats = [] } = dashboardData ?? {};

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <Container fluid>
                {/* Welcome Banner */}
                <Row className="mb-4">
                    <Col>
                        <Card
                            className="border-0 text-white"
                            style={{
                                background:
                                    "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)",
                            }}
                        >
                            <Card.Body className="p-4">
                                <Row className="align-items-center">
                                    <Col>
                                        <h3 className="mb-2">
                                            Welcome back, Administrator! 👋
                                        </h3>
                                        <p className="text-white-50 mb-0">
                                            Here's what's happening with your
                                            CDF projects and bursaries today.
                                        </p>
                                    </Col>
                                    <Col xs="auto">
                                        <div className="bg-white bg-opacity-25 rounded-3 px-4 py-2">
                                            <small>
                                                Last updated:{" "}
                                                {new Date().toLocaleDateString(
                                                    "en-KE",
                                                    {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </small>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Stats Cards */}
                <Row className="g-3 mb-4">
                    {statsCards.map((stat, index) => (
                        <Col key={index} xs={12} sm={6} lg={3}>
                            <DashboardStatsCard {...stat} />
                        </Col>
                    ))}
                </Row>

                {/* Category Breakdown */}
                <Row className="g-4 mb-4">
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pt-4">
                                <h5 className="fw-bold mb-0">
                                    Funds Allocation by Category
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Table responsive striped hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Category</th>
                                            <th className="text-end">
                                                Applicants
                                            </th>
                                            <th className="text-end">
                                                Allocated Amount (KES)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryStats.length > 0 ? (
                                            categoryStats.map((stat, index) => (
                                                <tr key={index}>
                                                    <td>{stat.category}</td>
                                                    <td className="text-end">
                                                        {stat.applicants}
                                                    </td>
                                                    <td className="text-end fw-semibold text-success">
                                                        {Number(
                                                            stat.amount,
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="text-center text-muted"
                                                >
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
}
