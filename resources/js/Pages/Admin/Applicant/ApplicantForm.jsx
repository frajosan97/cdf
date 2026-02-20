import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";
import Swal from "sweetalert2";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import Cookies from "js-cookie";
import Select from "react-select";

const ApplicantForm = () => {
    const {
        institutions = [],
        wards = [],
        types = [],
        parentStatuses = [],
        applicant = null,
    } = usePage().props;

    const isEditMode = !!applicant;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showErrorToast } = useErrorToast();

    // Get saved ward/location from cookies or use from applicant if editing
    const savedWardId = isEditMode
        ? applicant.ward_id
        : parseInt(Cookies.get("selectedWardId"));
    const savedLocationId = isEditMode
        ? applicant.location_id
        : parseInt(Cookies.get("selectedLocationId"));

    // Find ward and location names from IDs for display
    const getWardNameFromId = (wardId) => {
        if (!wardId) return "";
        const ward = wards.find((w) => w.id === wardId);
        return ward?.name || "";
    };

    const getLocationNameFromId = (locationId) => {
        if (!locationId) return "";
        // We need to search through all wards' locations
        for (const ward of wards) {
            const location = ward.locations?.find((l) => l.id === locationId);
            if (location) return location.name;
        }
        return "";
    };

    // Form state
    const [formData, setFormData] = useState({
        ward_id: savedWardId || "",
        location_id: savedLocationId || "",
        institution_id: applicant?.institution_id || "",
        student_name: applicant?.student_name || "",
        admission_number: applicant?.admission_number || "",
        type: applicant?.type || "",
        parent_status: applicant?.parent_status || "",
        parent_phone_number: applicant?.parent_phone_number || "",
        parent_id_number: applicant?.parent_id_number || "",
        amount: applicant?.amount || "",
        decision: applicant?.decision || "",
        decision_reason: applicant?.decision_reason || "",
    });

    // Get selected ward name for display
    const selectedWardName = useMemo(() => {
        if (!formData.ward_id) return "";
        const ward = wards.find((w) => w.id === formData.ward_id);
        return ward?.name || "";
    }, [formData.ward_id, wards]);

    // Get available locations based on selected ward_id
    const availableLocations = useMemo(() => {
        if (!formData.ward_id) return [];
        const selectedWard = wards.find((w) => w.id === formData.ward_id);
        return selectedWard?.locations || [];
    }, [formData.ward_id, wards]);

    // Get selected location name for display
    const selectedLocationName = useMemo(() => {
        if (!formData.location_id || !formData.ward_id) return "";
        const selectedWard = wards.find((w) => w.id === formData.ward_id);
        const location = selectedWard?.locations?.find(
            (l) => l.id === formData.location_id,
        );
        return location?.name || "";
    }, [formData.location_id, formData.ward_id, wards]);

    // Get filtered institutions based on selected category
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Get unique categories from institutions
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(institutions.map((inst) => inst.category)),
        ];
        return uniqueCategories
            .sort()
            .map((cat) => ({ value: cat, label: cat }));
    }, [institutions]);

    // Filter institutions by selected category
    const filteredInstitutions = useMemo(() => {
        if (!selectedCategory) return institutions;
        return institutions.filter(
            (inst) => inst.category === selectedCategory.value,
        );
    }, [institutions, selectedCategory]);

    // Get selected institution details
    const selectedInstitution = useMemo(() => {
        if (!formData.institution_id) return null;
        return institutions.find(
            (inst) => inst.id === parseInt(formData.institution_id),
        );
    }, [formData.institution_id, institutions]);

    // Check if ward and location are selected (for initial setup)
    const [showWardLocationPrompt, setShowWardLocationPrompt] = useState(
        !isEditMode && (!savedWardId || !savedLocationId),
    );

    // Save ward/location to cookies when changed (only for new entries)
    const handleWardLocationChange = (wardId, locationId) => {
        if (!isEditMode) {
            if (wardId) {
                Cookies.set("selectedWardId", wardId, { expires: 7 });
            }
            if (locationId) {
                Cookies.set("selectedLocationId", locationId, { expires: 7 });
            }
        }
    };

    // Form validation
    const isFormValid = useMemo(() => {
        return (
            formData.ward_id &&
            formData.location_id &&
            formData.institution_id &&
            formData.student_name?.trim() &&
            formData.admission_number?.trim() &&
            formData.type &&
            formData.parent_status &&
            formData.parent_phone_number?.trim() &&
            formData.parent_id_number?.trim()
        );
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (selected, field) => {
        const value = selected ? selected.value : "";

        if (field === "ward_id") {
            handleWardLocationChange(value, "");
            setFormData((prev) => ({
                ...prev,
                ward_id: value,
                location_id: "", // Reset location when ward changes
            }));
        } else if (field === "location_id") {
            handleWardLocationChange(formData.ward_id, value);
            setFormData((prev) => ({
                ...prev,
                location_id: value,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: null }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ward_id) {
            newErrors.ward_id = "Ward is required";
        }
        if (!formData.location_id) {
            newErrors.location_id = "Location is required";
        }
        if (!formData.institution_id) {
            newErrors.institution_id = "Institution is required";
        }
        if (!formData.student_name?.trim()) {
            newErrors.student_name = "Student name is required";
        }
        if (!formData.admission_number?.trim()) {
            newErrors.admission_number = "Admission number is required";
        }
        if (!formData.type) {
            newErrors.type = "Applicant type is required";
        }
        if (!formData.parent_status) {
            newErrors.parent_status = "Parent status is required";
        }
        if (!formData.parent_phone_number?.trim()) {
            newErrors.parent_phone_number = "Parent phone number is required";
        } else if (
            !/^[0-9+\-\s]{10,15}$/.test(
                formData.parent_phone_number.replace(/\s/g, ""),
            )
        ) {
            newErrors.parent_phone_number = "Invalid phone number format";
        }
        if (!formData.parent_id_number?.trim()) {
            newErrors.parent_id_number = "Parent ID number is required";
        }
        if (formData.amount && parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Amount must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the validation errors");
            return;
        }

        const action = isEditMode ? "update" : "create";
        const actionText = isEditMode ? "update" : "create";

        try {
            const result = await Swal.fire({
                title: `${isEditMode ? "Update" : "Create"} Applicant`,
                text: `Are you sure you want to ${actionText} this applicant?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: `Yes, ${actionText}`,
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            setLoading(true);

            const url = isEditMode
                ? route("applicant.update", applicant.id)
                : route("applicant.store");

            const method = isEditMode ? "put" : "post";

            const response = await axios({
                method: method,
                url: url,
                data: {
                    ward_id: formData.ward_id,
                    location_id: formData.location_id,
                    institution_id: formData.institution_id,
                    student_name: formData.student_name.trim(),
                    admission_number: formData.admission_number.trim(),
                    type: formData.type,
                    parent_status: formData.parent_status,
                    parent_phone_number: formData.parent_phone_number.trim(),
                    parent_id_number: formData.parent_id_number.trim(),
                    amount: formData.amount || null,
                    decision: formData.decision,
                    decision_reason: formData.decision_reason,
                },
            });

            if (response.data?.success) {
                toast.success(`Applicant ${actionText}d successfully`);
                window.location.href = route("applicant.index");
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                toast.error("Validation failed");
            } else {
                showErrorToast(error, `Failed to ${action} applicant`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangeWardLocation = () => {
        setShowWardLocationPrompt(true);
    };

    const handleWardLocationConfirm = () => {
        if (formData.ward_id && formData.location_id) {
            setShowWardLocationPrompt(false);
            handleWardLocationChange(formData.ward_id, formData.location_id);
        } else {
            toast.error("Please select both ward and location");
        }
    };

    // Options for react-select
    const wardOptions = wards.map((ward) => ({
        value: ward.id,
        label: ward.name,
    }));

    const locationOptions = availableLocations.map((location) => ({
        value: location.id,
        label: location.name,
    }));

    const institutionOptions = filteredInstitutions.map((inst) => ({
        value: inst.id,
        label: `${inst.name} (${inst.category})`,
    }));

    const typeOptions = types.map((type) => ({
        value: type,
        label: type,
    }));

    const parentStatusOptions = parentStatuses.map((status) => ({
        value: status,
        label: status,
    }));

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
            boxShadow: state.isFocused
                ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
                : null,
            "&:hover": {
                borderColor: "#86b7fe",
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100,
        }),
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${isEditMode ? "Edit" : "Create"} Applicant`} />

            <Container fluid>
                {/* Header */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h1 className="h2 mb-0 fw-bold">
                                    {isEditMode ? "Edit" : "Create New"}{" "}
                                    Applicant
                                </h1>
                                <p className="text-muted mt-1 mb-0">
                                    {isEditMode
                                        ? "Update scholarship applicant information in the system"
                                        : "Add a new scholarship applicant to the system"}
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Ward/Location Selection Prompt */}
                {showWardLocationPrompt && (
                    <Row className="mb-4">
                        <Col>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body>
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                        Select Working Area
                                    </h5>
                                    <Row>
                                        <Col md={5}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ward</Form.Label>
                                                <Select
                                                    name="ward_id"
                                                    value={wardOptions.find(
                                                        (option) =>
                                                            option.value ===
                                                            formData.ward_id,
                                                    )}
                                                    onChange={(selected) =>
                                                        handleSelectChange(
                                                            selected,
                                                            "ward_id",
                                                        )
                                                    }
                                                    options={wardOptions}
                                                    isDisabled={loading}
                                                    placeholder="Select ward"
                                                    styles={selectStyles}
                                                    isClearable
                                                />
                                                {errors.ward_id && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.ward_id}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col md={5}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Location
                                                </Form.Label>
                                                <Select
                                                    name="location_id"
                                                    value={locationOptions.find(
                                                        (option) =>
                                                            option.value ===
                                                            formData.location_id,
                                                    )}
                                                    onChange={(selected) =>
                                                        handleSelectChange(
                                                            selected,
                                                            "location_id",
                                                        )
                                                    }
                                                    options={locationOptions}
                                                    isDisabled={
                                                        loading ||
                                                        !formData.ward_id
                                                    }
                                                    placeholder="Select location"
                                                    styles={selectStyles}
                                                    isClearable
                                                />
                                                {errors.location_id && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.location_id}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Button
                                                variant="primary"
                                                onClick={
                                                    handleWardLocationConfirm
                                                }
                                                className="w-100 mt-4"
                                                disabled={
                                                    !formData.ward_id ||
                                                    !formData.location_id
                                                }
                                            >
                                                <i className="bi bi-check-lg me-2"></i>
                                                Continue
                                            </Button>
                                        </Col>
                                    </Row>
                                    {!isEditMode && (
                                        <p className="text-muted small mt-2 mb-0">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Your selection will be saved for
                                            future use.
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Main Content - Hidden until ward/location is selected */}
                {!showWardLocationPrompt && (
                    <Row>
                        <Col>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    {/* Ward and Location Display with Change Button */}
                                    <div className="mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded">
                                        <div className="d-flex gap-4">
                                            <div>
                                                <small className="text-muted d-block">
                                                    Ward
                                                </small>
                                                <strong className="fs-5">
                                                    {selectedWardName}
                                                </strong>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Location
                                                </small>
                                                <strong className="fs-5">
                                                    {selectedLocationName}
                                                </strong>
                                            </div>
                                        </div>
                                        {!isEditMode && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={
                                                    handleChangeWardLocation
                                                }
                                            >
                                                <i className="bi bi-pencil-square me-2"></i>
                                                Change
                                            </Button>
                                        )}
                                    </div>

                                    {/* Form */}
                                    <Form onSubmit={handleSubmit}>
                                        {/* Personal Information */}
                                        <h5 className="fw-bold mb-3 pb-2 border-bottom">
                                            <i className="bi bi-person-badge me-2"></i>
                                            Personal Information
                                        </h5>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Institution Category
                                                    </Form.Label>
                                                    <Select
                                                        value={selectedCategory}
                                                        onChange={
                                                            setSelectedCategory
                                                        }
                                                        options={categories}
                                                        isDisabled={loading}
                                                        placeholder="All Categories"
                                                        styles={selectStyles}
                                                        isClearable
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Institution{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Select
                                                        name="institution_id"
                                                        value={institutionOptions.find(
                                                            (option) =>
                                                                option.value ===
                                                                formData.institution_id,
                                                        )}
                                                        onChange={(selected) =>
                                                            handleSelectChange(
                                                                selected,
                                                                "institution_id",
                                                            )
                                                        }
                                                        options={
                                                            institutionOptions
                                                        }
                                                        isDisabled={loading}
                                                        placeholder="Select institution"
                                                        styles={selectStyles}
                                                        isClearable
                                                    />
                                                    {errors.institution_id && (
                                                        <div className="text-danger small mt-1">
                                                            {
                                                                errors.institution_id
                                                            }
                                                        </div>
                                                    )}
                                                    {selectedInstitution && (
                                                        <Form.Text className="text-muted">
                                                            Category:{" "}
                                                            {
                                                                selectedInstitution.category
                                                            }
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Student Name{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="student_name"
                                                        value={
                                                            formData.student_name
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Enter student full name"
                                                        disabled={loading}
                                                        isInvalid={
                                                            !!errors.student_name
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.student_name}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Admission Number{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="admission_number"
                                                        value={
                                                            formData.admission_number
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Enter admission number"
                                                        disabled={loading}
                                                        isInvalid={
                                                            !!errors.admission_number
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.admission_number
                                                        }
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Applicant Type{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Select
                                                        name="type"
                                                        value={typeOptions.find(
                                                            (option) =>
                                                                option.value ===
                                                                formData.type,
                                                        )}
                                                        onChange={(selected) =>
                                                            handleSelectChange(
                                                                selected,
                                                                "type",
                                                            )
                                                        }
                                                        options={typeOptions}
                                                        isDisabled={loading}
                                                        placeholder="Select type"
                                                        styles={selectStyles}
                                                    />
                                                    {errors.type && (
                                                        <div className="text-danger small mt-1">
                                                            {errors.type}
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Amount (KES){" "}
                                                        <span className="text-muted">
                                                            (Optional)
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="amount"
                                                        value={formData.amount}
                                                        onChange={
                                                            handleNumberChange
                                                        }
                                                        placeholder="Enter amount (optional)"
                                                        disabled={loading}
                                                        isInvalid={
                                                            !!errors.amount
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.amount}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Parent/Guardian Information */}
                                        <h5 className="fw-bold mb-3 mt-4 pb-2 border-bottom">
                                            <i className="bi bi-people me-2"></i>
                                            Parent/Guardian Information
                                        </h5>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Parent Status{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Select
                                                        name="parent_status"
                                                        value={parentStatusOptions.find(
                                                            (option) =>
                                                                option.value ===
                                                                formData.parent_status,
                                                        )}
                                                        onChange={(selected) =>
                                                            handleSelectChange(
                                                                selected,
                                                                "parent_status",
                                                            )
                                                        }
                                                        options={
                                                            parentStatusOptions
                                                        }
                                                        isDisabled={loading}
                                                        placeholder="Select parent status"
                                                        styles={selectStyles}
                                                    />
                                                    {errors.parent_status && (
                                                        <div className="text-danger small mt-1">
                                                            {
                                                                errors.parent_status
                                                            }
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Phone Number{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="parent_phone_number"
                                                        value={
                                                            formData.parent_phone_number
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Enter phone number"
                                                        disabled={loading}
                                                        isInvalid={
                                                            !!errors.parent_phone_number
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.parent_phone_number
                                                        }
                                                    </Form.Control.Feedback>
                                                    <Form.Text className="text-muted">
                                                        Format: 0712345678
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        ID Number{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="parent_id_number"
                                                        value={
                                                            formData.parent_id_number
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Enter ID number"
                                                        disabled={loading}
                                                        isInvalid={
                                                            !!errors.parent_id_number
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.parent_id_number
                                                        }
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Form Actions */}
                                        <Row className="mt-4">
                                            <Col>
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <Link
                                                        href={route(
                                                            "applicant.index",
                                                        )}
                                                        className="btn btn-secondary"
                                                    >
                                                        <i className="bi bi-x-circle me-2"></i>
                                                        Cancel
                                                    </Link>
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        disabled={
                                                            !isFormValid ||
                                                            loading
                                                        }
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span
                                                                    className="spinner-border spinner-border-sm me-2"
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                ></span>
                                                                {isEditMode
                                                                    ? "Updating..."
                                                                    : "Creating..."}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-save me-2"></i>
                                                                {isEditMode
                                                                    ? "Update Applicant"
                                                                    : "Create Applicant"}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </AuthenticatedLayout>
    );
};

export default ApplicantForm;
