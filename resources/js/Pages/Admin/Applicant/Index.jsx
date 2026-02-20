import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Dropdown, Table, Card } from "react-bootstrap";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";

import Swal from "sweetalert2";
import BulkImportModal from "@/Components/Applicant/BulkImportModal";
import axios from "axios";

const Applicants = ({ institutions }) => {
    // Refs
    const tableRef = useRef(null);
    const tableInstance = useRef(null);
    const dataTableInitialized = useRef(false);

    // State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showErrorToast } = useErrorToast();

    // DataTable handlers
    const refreshTable = useCallback(() => {
        if (tableInstance.current) {
            tableInstance.current.ajax.reload(null, false);
        }
    }, []);

    // Modal handlers
    const handleShowBulkModal = useCallback((e) => {
        e?.stopPropagation();
        setShowBulkModal(true);
    }, []);

    const handleBulkSuccess = useCallback(() => {
        refreshTable();
        setShowBulkModal(false);
        toast.success("Bulk import completed successfully");
    }, [refreshTable]);

    // API Handlers
    const handleDelete = useCallback(
        async (id) => {
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
                    route("applicant.destroy", id),
                );

                if (response.data?.success) {
                    toast.success("Applicant deleted successfully");
                    refreshTable();
                } else {
                    toast.error(
                        response.data?.message || "Failed to delete applicant",
                    );
                }
            } catch (error) {
                showErrorToast(error, "Failed to delete applicant");
            } finally {
                setLoading(false);
            }
        },
        [refreshTable, showErrorToast],
    );

    const handleUpdateDecision = useCallback(
        async (id, decision) => {
            try {
                const { value: reason } = await Swal.fire({
                    title: `${
                        decision.charAt(0).toUpperCase() + decision.slice(1)
                    } Applicant`,
                    text: `Are you sure you want to ${decision} this applicant?`,
                    input: "textarea",
                    inputLabel: "Reason (optional)",
                    inputPlaceholder: "Enter reason for decision...",
                    inputAttributes: {
                        "aria-label": "Enter reason for decision",
                    },
                    showCancelButton: true,
                    confirmButtonColor:
                        decision === "approved" ? "#28a745" : "#dc3545",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: `Yes, ${decision}`,
                    cancelButtonText: "Cancel",
                });

                if (reason === undefined) return;

                setLoading(true);
                const response = await axios.post(
                    route("applicant.decision", id),
                    {
                        decision,
                        decision_reason: reason || null,
                    },
                );

                if (response.data?.success) {
                    toast.success(`Applicant ${decision} successfully`);
                    refreshTable();
                } else {
                    toast.error(
                        response.data?.message || "Failed to update decision",
                    );
                }
            } catch (error) {
                showErrorToast(error, "Failed to update decision");
            } finally {
                setLoading(false);
            }
        },
        [refreshTable, showErrorToast],
    );

    // Initialize DataTable
    useEffect(() => {
        if (!tableRef.current || dataTableInitialized.current) return;

        tableInstance.current = $(tableRef.current).DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("applicant.index"),
                type: "GET",
                error: (xhr, status, error) => {
                    console.error("DataTable error:", error);
                    toast.error("Failed to load applicants data");
                },
            },
            columns: [
                // { data: "ward", name: "ward", title: "Ward" },
                // { data: "location", name: "location", title: "Location" },
                {
                    data: "student_name",
                    name: "student_name",
                    title: "Name",
                },
                {
                    data: "admission_number",
                    name: "admission_number",
                    title: "Admission",
                },
                {
                    data: "institution",
                    name: "institution",
                    title: "Institution",
                },
                {
                    data: "type",
                    name: "type",
                    title: "Type",
                    className: "text-uppercase",
                },
                {
                    data: "amount",
                    name: "amount",
                    title: "Amount",
                },
                {
                    data: "decision",
                    name: "decision",
                    title: "Status",
                    render: (data) => {
                        if (!data || data === "pending")
                            return '<span class="badge bg-warning">Pending</span>';

                        const badgeClass =
                            {
                                approved: "bg-success",
                                rejected: "bg-danger",
                            }[data] || "bg-secondary";

                        return `<span class="badge ${badgeClass}">${
                            data.charAt(0).toUpperCase() + data.slice(1)
                        }</span>`;
                    },
                },
                {
                    data: "actions",
                    name: "actions",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                },
            ],
            language: {
                processing: "Loading applicants...",
                emptyTable:
                    "<div class='text-center py-5'><i class='bi bi-people fs-1'></i><br>No data available</div>",
                zeroRecords:
                    "<div class='text-center py-5'><i class='bi bi-people fs-1'></i><br>No matching records found</div>",
            },
            pageLength: 10,
            responsive: true,
            destroy: true,
        });

        dataTableInitialized.current = true;

        return () => {
            if (tableInstance.current) {
                tableInstance.current.destroy();
                tableInstance.current = null;
                dataTableInitialized.current = false;
            }
        };
    }, []);

    // Event delegation for action buttons
    useEffect(() => {
        const tableElement = tableRef.current;
        if (!tableElement) return;

        const handleTableClick = (e) => {
            const target = $(e.target);

            // Handle view button click - redirect to show page
            const viewButton = target.closest(".view-btn");
            if (viewButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = viewButton.data("id");
                if (id) {
                    window.location.href = route("applicant.show", id);
                }
                return;
            }

            // Handle edit button click - redirect to edit page
            const editButton = target.closest(".edit-btn");
            if (editButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = editButton.data("id");
                if (id) {
                    window.location.href = route("applicant.edit", id);
                }
                return;
            }

            // Handle delete button click
            const deleteButton = target.closest(".delete-btn");
            if (deleteButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = deleteButton.data("id");
                if (id) handleDelete(id);
                return;
            }

            // Handle decision buttons
            const approveButton = target.closest(".approve-btn");
            if (approveButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = approveButton.data("id");
                if (id) handleUpdateDecision(id, "approved");
                return;
            }

            const rejectButton = target.closest(".reject-btn");
            if (rejectButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = rejectButton.data("id");
                if (id) handleUpdateDecision(id, "rejected");
            }
        };

        tableElement.addEventListener("click", handleTableClick);

        return () => {
            tableElement.removeEventListener("click", handleTableClick);
        };
    }, [handleDelete, handleUpdateDecision]);

    return (
        <AuthenticatedLayout>
            <Head title="Applicants" />

            <Container fluid>
                {/* Header Section */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h1 className="h2 mb-0 fw-bold">
                            Applicants Management
                        </h1>
                        <p className="text-muted mt-1 mb-0">
                            Manage and process scholarship applicants
                        </p>
                    </Col>
                    <Col xs="auto">
                        <div className="d-flex gap-2">
                            <Link
                                href={route("applicant.create")}
                                className="btn btn-primary"
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Applicant
                            </Link>
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="outline-primary"
                                    id="dropdown-actions"
                                    disabled={loading}
                                >
                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                    Import/Export
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={handleShowBulkModal}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-upload"></i>
                                        <span>Bulk Import (Excel)</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href={route("template.applicants")}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-download"></i>
                                        <span>Download Template</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href={route("export.applicants")}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-file-earmark-excel"></i>
                                        <span>Export All</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>

                {/* Table Section */}
                <Row>
                    <Col>
                        <Card className="rounded-3 border-0 shadow-sm">
                            <Card.Body>
                                <Table
                                    ref={tableRef}
                                    responsive
                                    bordered
                                    striped
                                    hover
                                    className="align-middle"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Bulk Import Modal */}
            <BulkImportModal
                show={showBulkModal}
                onHide={() => setShowBulkModal(false)}
                onSuccess={handleBulkSuccess}
                institutions={institutions}
            />
        </AuthenticatedLayout>
    );
};

export default Applicants;
