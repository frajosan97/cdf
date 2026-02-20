import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Spreadsheet from "react-spreadsheet";

const GoogleSheetLike = ({
    institutions = [],
    ward = "",
    location = "",
    columns = [], // Empty by default, must be passed from parent
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef(null);

    // Initialize spreadsheet data
    useEffect(() => {
        if (!ward || !location || !columns.length) return;

        // Create initial data structure for react-spreadsheet
        // Each cell is an object with a value property
        const initialData = [];

        // Add header row (first row)
        const headerRow = columns.map((col) => ({ value: col }));
        initialData.push(headerRow);

        // Add 10 empty data rows
        for (let i = 0; i < 10; i++) {
            const emptyRow = columns.map((col) => ({ value: "" }));
            initialData.push(emptyRow);
        }

        setData(initialData);

        // Load saved data from localStorage
        const savedData = localStorage.getItem(`sheet-${ward}-${location}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setData(parsed);
            } catch (e) {
                console.error("Error loading saved sheet:", e);
            }
        }
    }, [ward, location, columns]);

    // Handle cell changes with auto-save
    const handleChange = useCallback(
        (newData) => {
            if (!ward || !location) return;

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Update data
            setData([...newData]);

            // Auto-save after 1.5 seconds
            saveTimeoutRef.current = setTimeout(() => {
                saveSheetData(newData);
            }, 1500);
        },
        [ward, location],
    );

    // Save sheet data
    const saveSheetData = useCallback(
        async (dataToSave) => {
            if (
                !ward ||
                !location ||
                !dataToSave ||
                dataToSave.length < 2 ||
                !columns.length
            )
                return;

            setIsSaving(true);

            try {
                // Skip header row (index 0)
                const dataRows = dataToSave.slice(1);

                const applicants = dataRows
                    .filter((row) => row[0]?.value?.trim()) // Only rows with first column not empty
                    .map((row) => {
                        const applicant = {
                            ward: ward,
                            location: location,
                        };

                        // Map each column
                        columns.forEach((colName, index) => {
                            const cell = row[index];
                            const value = cell?.value?.toString().trim() || "";

                            if (colName === "Admission Number") {
                                applicant.admission_number = value;
                            } else if (colName === "Student Name") {
                                applicant.student_name = value;
                            } else if (colName === "Institution") {
                                const institution = institutions.find(
                                    (inst) =>
                                        inst.name?.toLowerCase() ===
                                            value.toLowerCase() ||
                                        inst.id?.toString() === value,
                                );
                                applicant.institution_id =
                                    institution?.id || null;
                            } else if (colName === "Type") {
                                applicant.type = value || "day";
                            } else if (colName === "Parent Phone") {
                                applicant.parent_phone_number = value;
                            } else if (colName === "Parent ID Number") {
                                applicant.parent_id_number = value;
                            } else if (colName === "Parent Status") {
                                applicant.parent_status = value || "both";
                            } else if (colName === "Amount") {
                                applicant.amount = value
                                    ? parseFloat(value)
                                    : null;
                            } else if (colName === "Decision") {
                                applicant.decision = value || "pending";
                            } else if (colName === "Decision Reason") {
                                applicant.decision_reason = value;
                            } else if (colName === "Category") {
                                applicant.category = value;
                            } else if (colName === "Ward") {
                                // Skip - we already set ward from props
                            } else if (colName === "Location") {
                                // Skip - we already set location from props
                            } else {
                                // For any other custom columns, add them dynamically
                                const fieldName = colName
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")
                                    .replace(/[^a-z0-9_]/g, "");
                                if (fieldName) {
                                    applicant[fieldName] = value;
                                }
                            }
                        });

                        return applicant;
                    });

                if (applicants.length === 0) {
                    setIsSaving(false);
                    return;
                }

                const response = await axios.post(
                    route("applicant.bulk-store"),
                    {
                        rows: applicants,
                    },
                );

                if (response.data?.success) {
                    toast.success(`${applicants.length} rows saved`, {
                        autoClose: 2000,
                    });

                    // Save to localStorage as backup
                    localStorage.setItem(
                        `sheet-${ward}-${location}`,
                        JSON.stringify(dataToSave),
                    );
                }
            } catch (error) {
                console.error("Save error:", error);
                toast.error("Failed to save changes");
            } finally {
                setIsSaving(false);
            }
        },
        [ward, location, institutions, columns],
    );

    // Manual save
    const handleManualSave = useCallback(async () => {
        if (!data || data.length < 2) return;

        const result = await Swal.fire({
            title: "Save All Changes?",
            text: "This will save all unsaved rows to the database.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save all",
        });

        if (result.isConfirmed) {
            await saveSheetData(data);
        }
    }, [data, saveSheetData]);

    // Add new row
    const addNewRow = useCallback(() => {
        const newRow = columns.map(() => ({ value: "" }));
        const updatedData = [...data, newRow];
        setData(updatedData);

        // Trigger auto-save after adding row
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveSheetData(updatedData);
        }, 1500);
    }, [data, columns, saveSheetData]);

    // Clear all data
    const handleClearAll = useCallback(() => {
        Swal.fire({
            title: "Clear All Data?",
            text: "This will remove all rows except the header. This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, clear all",
        }).then((result) => {
            if (result.isConfirmed) {
                // Keep only header row
                const headerRow = data[0];
                const emptyRows = Array(5).fill(
                    columns.map(() => ({ value: "" })),
                );
                const newData = [headerRow, ...emptyRows];
                setData(newData);

                if (ward && location) {
                    localStorage.removeItem(`sheet-${ward}-${location}`);
                }

                toast.info("Sheet cleared");

                // Trigger auto-save after clearing
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }
                saveTimeoutRef.current = setTimeout(() => {
                    saveSheetData(newData);
                }, 1500);
            }
        });
    }, [data, ward, location, columns, saveSheetData]);

    // Export as CSV
    const exportAsCSV = useCallback(() => {
        if (!data || data.length === 0) return;

        const rows = data.map((row) =>
            row
                .map((cell) => {
                    const value = cell.value || "";
                    // Wrap in quotes if contains comma
                    return value.includes(",") ? `"${value}"` : value;
                })
                .join(","),
        );
        const csvContent = rows.join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `applicants-${ward}-${location}-${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [data, ward, location]);

    // Import from CSV
    const importFromCSV = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const csv = event.target.result;
                const lines = csv.split("\n").filter((line) => line.trim());

                // Parse CSV
                const rows = lines.map((line) =>
                    line.split(",").map((cell) => {
                        // Remove quotes if present
                        const cleanCell = cell.replace(/^"|"$/g, "").trim();
                        return { value: cleanCell };
                    }),
                );

                // Validate headers match
                const importedHeaders =
                    rows[0]?.map((cell) => cell.value) || [];
                if (
                    JSON.stringify(importedHeaders) !== JSON.stringify(columns)
                ) {
                    toast.error("CSV headers don't match current columns");
                    return;
                }

                setData(rows);
                toast.success("CSV imported successfully");

                // Trigger auto-save
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }
                saveTimeoutRef.current = setTimeout(() => {
                    saveSheetData(rows);
                }, 1500);
            };

            reader.readAsText(file);
        };

        input.click();
    }, [columns, saveSheetData]);

    if (!columns.length) {
        return (
            <div className="text-center py-5">
                <i
                    className="bi bi-table text-muted"
                    style={{ fontSize: "3rem" }}
                ></i>
                <h5 className="mt-3 text-muted">No columns defined</h5>
                <p className="text-muted">
                    Please pass columns array to the component
                </p>
            </div>
        );
    }

    if (!ward || !location) {
        return (
            <div className="text-center py-5">
                <i
                    className="bi bi-geo-alt-fill text-muted"
                    style={{ fontSize: "3rem" }}
                ></i>
                <h5 className="mt-3 text-muted">
                    Please select ward and location first
                </h5>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading spreadsheet...</p>
            </div>
        );
    }

    return (
        <div className="google-sheet-container">
            <style>{`
                .google-sheet-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }

                .react-spreadsheet-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    table-layout: fixed;
                }

                .react-spreadsheet-table td {
                    border: 1px solid #dee2e6;
                    padding: 8px;
                    min-width: 120px;
                    height: 36px;
                    vertical-align: middle;
                }

                .react-spreadsheet-table tr:first-child td {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                    border-bottom: 2px solid #adb5bd;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .react-spreadsheet-table tr:first-child td:hover {
                    background-color: #e9ecef;
                }

                .react-spreadsheet-table td:focus-within {
                    outline: 2px solid #0d6efd;
                    outline-offset: -1px;
                }

                .react-spreadsheet-table input {
                    width: 100%;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    background: transparent;
                    padding: 4px;
                }

                .react-spreadsheet-table input:focus {
                    background-color: #fff;
                }

                .react-spreadsheet-table td:hover {
                    background-color: #f8f9fa;
                }

                .react-spreadsheet-table tr:first-child td:first-child {
                    border-top-left-radius: 4px;
                }

                .react-spreadsheet-table tr:first-child td:last-child {
                    border-top-right-radius: 4px;
                }

                .sheet-toolbar {
                    padding: 8px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }

                .sheet-toolbar button {
                    font-size: 13px;
                }

                .badge {
                    font-size: 12px;
                    padding: 4px 8px;
                }

                /* Scrollbar styling */
                ::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }

                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>

            {/* Toolbar */}
            <div className="sheet-toolbar mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <Button
                        onClick={addNewRow}
                        variant="primary"
                        size="sm"
                        className="me-2"
                        disabled={isSaving}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Row
                    </Button>
                    <Button
                        onClick={handleManualSave}
                        variant="success"
                        size="sm"
                        className="me-2"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cloud-upload me-2"></i>
                                Save All
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={exportAsCSV}
                        variant="info"
                        size="sm"
                        className="me-2"
                        disabled={isSaving}
                    >
                        <i className="bi bi-download me-2"></i>
                        Export CSV
                    </Button>
                    <Button
                        onClick={importFromCSV}
                        variant="secondary"
                        size="sm"
                        className="me-2"
                        disabled={isSaving}
                    >
                        <i className="bi bi-upload me-2"></i>
                        Import CSV
                    </Button>
                    <Button
                        onClick={handleClearAll}
                        variant="outline-danger"
                        size="sm"
                        disabled={isSaving}
                    >
                        <i className="bi bi-trash me-2"></i>
                        Clear All
                    </Button>
                </div>
                <div className="text-muted d-flex align-items-center">
                    {isSaving && (
                        <span className="me-3">
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                className="me-1"
                            />
                            Auto-saving...
                        </span>
                    )}
                    <small>
                        <i className="bi bi-info-circle me-1"></i>
                        Click cells to edit • Auto-saves after 1.5 seconds
                    </small>
                </div>
            </div>

            {/* Location info */}
            {/* <div className="mb-2 p-2 bg-light rounded d-flex justify-content-between align-items-center">
                <div>
                    <strong>Ward:</strong> {ward} | <strong>Location:</strong>{" "}
                    {location}
                </div>
                <div>
                    <span className="badge bg-secondary">
                        <i className="bi bi-table me-1"></i>
                        {data.length - 1} rows
                    </span>
                </div>
            </div> */}

            {/* The Spreadsheet */}
            <div
                style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                }}
            >
                <Spreadsheet data={data} onChange={handleChange} />
            </div>
        </div>
    );
};

export default GoogleSheetLike;
