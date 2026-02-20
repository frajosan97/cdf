import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Dropdown, Table, Card } from "react-bootstrap";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";
import Swal from "sweetalert2";
import InstitutionFormModal from "@/Components/Institution/InstitutionFormModal";
import BulkImportModal from "@/Components/Institution/BulkImportModal";
import axios from "axios";

// Initial form state
const INITIAL_FORM_STATE = {
    name: "",
    category: "",
    is_active: true,
};

const Institutions = () => {
    // Refs
    const tableRef = useRef(null);
    const tableInstance = useRef(null);
    const dataTableInitialized = useRef(false);

    // State
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const { showErrorToast } = useErrorToast();

    // Form handlers
    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM_STATE);
        setSelectedInstitution(null);
        setIsEdit(false);
    }, []);

    const validateForm = useCallback(() => {
        if (!formData.name?.trim()) {
            toast.error("Institution name is required");
            return false;
        }
        if (!formData.category?.trim()) {
            toast.error("Category is required");
            return false;
        }
        return true;
    }, [formData.name, formData.category]);

    // DataTable handlers
    const refreshTable = useCallback(() => {
        if (tableInstance.current) {
            tableInstance.current.ajax.reload(null, false);
        }
    }, []);

    // Modal handlers
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        resetForm();
    }, [resetForm]);

    const handleShowModal = useCallback(
        (e) => {
            e?.stopPropagation();
            resetForm();
            setShowModal(true);
        },
        [resetForm],
    );

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
    const handleEdit = useCallback(
        async (id) => {
            try {
                setLoading(true);
                const response = await axios.get(route("institution.show", id));

                if (response.data?.institution) {
                    const institution = response.data.institution;
                    setSelectedInstitution(institution);
                    setFormData({
                        name: institution.name || "",
                        category: institution.category || "",
                        is_active: institution.is_active ?? true,
                    });
                    setIsEdit(true);
                    setShowModal(true);
                }
            } catch (error) {
                showErrorToast(error, "Failed to load institution");
            } finally {
                setLoading(false);
            }
        },
        [showErrorToast],
    );

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
                    route("institution.destroy", id),
                );

                if (response.data?.success) {
                    toast.success("Institution deleted successfully");
                    refreshTable();
                } else {
                    toast.error(
                        response.data?.message ||
                            "Failed to delete institution",
                    );
                }
            } catch (error) {
                showErrorToast(error, "Failed to delete institution");
            } finally {
                setLoading(false);
            }
        },
        [refreshTable, showErrorToast],
    );

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!validateForm()) return;

            try {
                const isConfirmed = await Swal.fire({
                    title: isEdit ? "Update Institution" : "Create Institution",
                    text: isEdit
                        ? "Are you sure you want to update this institution?"
                        : "Are you sure you want to create this institution?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes",
                    cancelButtonText: "Cancel",
                });

                if (!isConfirmed.isConfirmed) return;

                setLoading(true);

                const url = isEdit
                    ? route("institution.update", selectedInstitution.id)
                    : route("institution.store");

                const response = await axios({
                    method: isEdit ? "put" : "post",
                    url: url,
                    data: {
                        name: formData.name.trim(),
                        category: formData.category.trim(),
                        is_active: formData.is_active,
                    },
                });

                if (response.data?.success) {
                    toast.success(
                        isEdit
                            ? "Institution updated successfully"
                            : "Institution created successfully",
                    );
                    handleCloseModal();
                    refreshTable();
                } else {
                    toast.error(response.data?.message || "Operation failed");
                }
            } catch (error) {
                showErrorToast(error);
            } finally {
                setLoading(false);
            }
        },
        [
            formData,
            isEdit,
            selectedInstitution,
            validateForm,
            refreshTable,
            showErrorToast,
            handleCloseModal,
        ],
    );

    // Initialize DataTable
    useEffect(() => {
        if (!tableRef.current || dataTableInitialized.current) return;

        tableInstance.current = $(tableRef.current).DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("institution.index"),
                type: "GET",
                error: (xhr, status, error) => {
                    console.error("DataTable error:", error);
                    toast.error("Failed to load institutions data");
                },
            },
            columns: [
                { data: "name", name: "name", title: "Name" },
                {
                    data: "category",
                    name: "category",
                    title: "Category",
                    render: (data) => {
                        if (!data) return "-";
                        return (
                            data.charAt(0).toUpperCase() +
                            data.slice(1).toLowerCase()
                        );
                    },
                },
                {
                    data: "is_active",
                    name: "is_active",
                    title: "Status",
                    render: (data) => {
                        return data
                            ? '<span class="badge bg-success">Active</span>'
                            : '<span class="badge bg-danger">Inactive</span>';
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
                processing: "Loading institutions...",
                emptyTable:
                    "<div class='text-center py-5'><i class='bi bi-building fs-1'></i><br>No data available</div>",
                zeroRecords:
                    "<div class='text-center py-5'><i class='bi bi-building fs-1'></i><br>No matching records found</div>",
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

            // Handle edit button click
            const editButton = target.closest(".edit-btn");
            if (editButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = editButton.data("id");
                if (id) handleEdit(id);
                return;
            }

            // Handle delete button click
            const deleteButton = target.closest(".delete-btn");
            if (deleteButton.length) {
                e.preventDefault();
                e.stopPropagation();
                const id = deleteButton.data("id");
                if (id) handleDelete(id);
            }
        };

        tableElement.addEventListener("click", handleTableClick);

        return () => {
            tableElement.removeEventListener("click", handleTableClick);
        };
    }, [handleEdit, handleDelete]);

    return (
        <AuthenticatedLayout>
            <Head title="Institutions" />

            <Container fluid>
                {/* Header Section */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h1 className="h2 mb-0 fw-bold">
                            Institutions Management
                        </h1>
                        <p className="text-muted mt-1 mb-0">
                            Manage and organize your educational institutions
                        </p>
                    </Col>
                    <Col xs="auto">
                        <div className="d-flex gap-2">
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="primary"
                                    id="dropdown-actions"
                                    disabled={loading}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Institution
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={handleShowModal}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-plus-circle"></i>
                                        <span>Single Institution</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={handleShowBulkModal}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-file-earmark-excel"></i>
                                        <span>Bulk Import (Excel)</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href={route("template.institutions")}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-download"></i>
                                        <span>Download Template</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href={route("export.institutions")}
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

            {/* Modals */}
            <InstitutionFormModal
                show={showModal}
                onHide={handleCloseModal}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                isEdit={isEdit}
                loading={loading}
            />

            <BulkImportModal
                show={showBulkModal}
                onHide={() => setShowBulkModal(false)}
                onSuccess={handleBulkSuccess}
            />
        </AuthenticatedLayout>
    );
};

export default Institutions;
