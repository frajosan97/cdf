import { Modal, Button, Form, Alert, Table, Badge } from "react-bootstrap";
import { useState, useRef, useMemo } from "react";
import { useErrorToast } from "@/Hooks/useErrorToast";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import axios from "axios";

const BulkImportModal = ({ show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [error, setError] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [importSummary, setImportSummary] = useState(null);
    const fileInputRef = useRef(null);
    const { showErrorToast } = useErrorToast();

    // Valid categories (should match your backend)
    const validCategories = useMemo(
        () => ["secondary", "polytechnic", "college", "university", "special"],
        [],
    );

    const requiredHeaders = ["name", "category"];

    const headerLabels = {
        name: "Name",
        category: "Category",
    };

    const validateHeaders = (headers) => {
        const missingHeaders = requiredHeaders.filter(
            (h) => !headers.includes(h),
        );

        if (missingHeaders.length > 0) {
            setError(
                `Missing required columns: ${missingHeaders
                    .map((h) => headerLabels[h] || h)
                    .join(", ")}`,
            );
            return false;
        }
        return true;
    };

    const validateRowData = (row, headers, rowIndex) => {
        const errors = [];

        // Helper to get value by header
        const getValue = (header) => {
            const index = headers.indexOf(header);
            return index !== -1 ? row[index]?.toString().trim() : "";
        };

        // Check required fields presence
        requiredHeaders.forEach((header) => {
            const value = getValue(header);
            if (!value) {
                errors.push({
                    row: rowIndex + 2,
                    attribute: headerLabels[header] || header,
                    errors: [`${headerLabels[header] || header} is required`],
                    values: row,
                });
            }
        });

        // If we have errors on required fields, skip further validation for this row
        if (errors.length > 0) return errors;

        // Validate name length
        const nameValue = getValue("name");
        if (nameValue.length < 2) {
            errors.push({
                row: rowIndex + 2,
                attribute: "Name",
                errors: ["Institution name must be at least 2 characters"],
                values: row,
            });
        }
        if (nameValue.length > 255) {
            errors.push({
                row: rowIndex + 2,
                attribute: "Name",
                errors: ["Institution name must not exceed 255 characters"],
                values: row,
            });
        }

        // Validate category
        const categoryValue = getValue("category")?.toLowerCase().trim();
        if (categoryValue && !validCategories.includes(categoryValue)) {
            errors.push({
                row: rowIndex + 2,
                attribute: "Category",
                errors: [
                    `Category must be one of: ${validCategories.join(", ")}`,
                ],
                values: row,
            });
        }

        return errors;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        setImportErrors([]);
        setImportSummary(null);
        setFileData(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: "",
                });

                // Check if file has data
                if (jsonData.length < 2) {
                    setError("File is empty or contains no data rows");
                    return;
                }

                // Get headers and convert to lowercase for consistency
                const headers = jsonData[0].map((h) =>
                    String(h).toLowerCase().trim().replace(/\s+/g, "_"),
                );

                // Validate headers
                if (!validateHeaders(headers)) {
                    return;
                }

                // Validate all data rows
                const allErrors = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const rowErrors = validateRowData(
                        jsonData[i],
                        headers,
                        i - 1,
                    );
                    allErrors.push(...rowErrors);
                }

                if (allErrors.length > 0) {
                    setImportErrors(allErrors);
                }

                // Prepare preview data (first 5 rows)
                const rows = jsonData.slice(1, 6).map((row) => {
                    const rowData = {};
                    headers.forEach((header, index) => {
                        rowData[header] = row[index] || "";
                    });
                    return rowData;
                });

                setPreviewData({
                    headers,
                    rows,
                    totalRows: jsonData.length - 1,
                });
            } catch (err) {
                console.error("File parsing error:", err);
                setError("Failed to parse file. Please check the file format.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!fileData) {
            toast.error("Please select a file to import");
            return;
        }

        if (importErrors.length > 0) {
            toast.error("Please fix validation errors before importing");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", fileData);

            const response = await axios.post(
                route("import.institutions"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            if (response.data.success) {
                setImportSummary({
                    imported: response.data.stats?.imported || 0,
                    skipped: response.data.stats?.skipped || 0,
                });

                if (
                    response.data.stats?.failures &&
                    response.data.stats.failures.length > 0
                ) {
                    setImportErrors(response.data.stats.failures);
                    toast.warning("Import completed with some errors");
                } else {
                    toast.success(response.data.message);
                    setTimeout(() => {
                        onSuccess();
                        handleClose();
                    }, 2000);
                }
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setImportErrors(error.response.data.errors);
                toast.error("Validation errors found in the file");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
                toast.error(error.response.data.message);
            } else {
                showErrorToast(error, "Failed to import file");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFileData(null);
        setPreviewData([]);
        setError(null);
        setImportErrors([]);
        setImportSummary(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onHide();
    };

    const getErrorCountForRow = (rowIndex) => {
        return importErrors.filter((e) => e.row === rowIndex + 2).length;
    };

    const getFieldErrors = (rowIndex, fieldName) => {
        return importErrors.filter(
            (e) =>
                e.row === rowIndex + 2 &&
                e.attribute.toLowerCase() === fieldName.toLowerCase(),
        );
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5 mb-0">
                    <i className="bi bi-file-earmark-excel me-2"></i>
                    Bulk Import Institutions
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
                {error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() => setError(null)}
                        className="mb-3"
                    >
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </Alert>
                )}

                {importSummary && (
                    <Alert variant="success" className="mb-3">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                            <div>
                                <h6 className="alert-heading fw-bold mb-1">
                                    Import Summary
                                </h6>
                                <p className="mb-0">
                                    Successfully imported:{" "}
                                    <Badge bg="success" className="ms-1">
                                        {importSummary.imported}
                                    </Badge>
                                    <br />
                                    Skipped rows:{" "}
                                    <Badge bg="warning" className="ms-1">
                                        {importSummary.skipped}
                                    </Badge>
                                </p>
                            </div>
                        </div>
                    </Alert>
                )}

                {importErrors.length > 0 && (
                    <Alert variant="warning" className="mb-3">
                        <h6 className="alert-heading fw-bold">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Validation Errors ({importErrors.length})
                        </h6>
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <Table size="sm" bordered className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Row</th>
                                        <th>Field</th>
                                        <th>Errors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importErrors.map((error, index) => (
                                        <tr key={index}>
                                            <td>{error.row}</td>
                                            <td>
                                                <Badge bg="secondary">
                                                    {error.attribute}
                                                </Badge>
                                            </td>
                                            <td>
                                                <ul className="mb-0 ps-3">
                                                    {error.errors.map(
                                                        (msg, i) => (
                                                            <li
                                                                key={i}
                                                                className="small text-danger"
                                                            >
                                                                {msg}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Alert>
                )}

                <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                        Select Excel/CSV File
                    </Form.Label>
                    <Form.Control
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={loading}
                    />
                    <Form.Text className="text-muted">
                        Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
                    </Form.Text>
                </Form.Group>

                {previewData.rows && previewData.rows.length > 0 && (
                    <div className="mt-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <i className="bi bi-eye me-2"></i>
                            Preview (First 5 rows of {
                                previewData.totalRows
                            }{" "}
                            total):
                        </h6>
                        <div className="table-responsive">
                            <Table striped bordered size="sm" hover>
                                <thead className="bg-light">
                                    <tr>
                                        {previewData.headers.map(
                                            (header, index) => (
                                                <th key={index}>
                                                    {headerLabels[header] ||
                                                        header
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            header.slice(1)}
                                                </th>
                                            ),
                                        )}
                                        {importErrors.length > 0 && (
                                            <th>Status</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.rows.map((row, rowIndex) => {
                                        const errorCount =
                                            getErrorCountForRow(rowIndex);
                                        return (
                                            <tr key={rowIndex}>
                                                {previewData.headers.map(
                                                    (header, colIndex) => {
                                                        const fieldErrors =
                                                            getFieldErrors(
                                                                rowIndex,
                                                                header,
                                                            );
                                                        const hasError =
                                                            fieldErrors.length >
                                                            0;

                                                        return (
                                                            <td
                                                                key={colIndex}
                                                                className={
                                                                    hasError
                                                                        ? "bg-danger bg-opacity-10"
                                                                        : ""
                                                                }
                                                            >
                                                                {row[header] ||
                                                                    "-"}
                                                                {hasError && (
                                                                    <i
                                                                        className="bi bi-exclamation-triangle-fill text-danger ms-2"
                                                                        title={fieldErrors
                                                                            .map(
                                                                                (
                                                                                    e,
                                                                                ) =>
                                                                                    e.errors.join(
                                                                                        ", ",
                                                                                    ),
                                                                            )
                                                                            .join(
                                                                                "; ",
                                                                            )}
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    },
                                                )}
                                                {importErrors.length > 0 && (
                                                    <td>
                                                        {errorCount > 0 ? (
                                                            <Badge
                                                                bg="warning"
                                                                text="dark"
                                                            >
                                                                {errorCount}{" "}
                                                                error
                                                                {errorCount > 1
                                                                    ? "s"
                                                                    : ""}
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="success">
                                                                Valid
                                                            </Badge>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={!fileData || loading || importErrors.length > 0}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            Importing...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-upload me-2"></i>
                            Import Data
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BulkImportModal;
