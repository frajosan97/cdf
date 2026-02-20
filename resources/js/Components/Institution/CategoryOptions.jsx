import { Form } from "react-bootstrap";

const CategoryOptions = ({ selectedValue, onChange, disabled = false }) => {
    const categories = [
        { value: "secondary", label: "Secondary School" },
        { value: "polytechnic", label: "Polytechnic" },
        { value: "college", label: "College" },
        { value: "university", label: "University" },
    ];

    return (
        <Form.Select
            name="category"
            value={selectedValue}
            onChange={onChange}
            disabled={disabled}
            aria-label="Select institution category"
        >
            <option value="">Select Category</option>
            {categories.map((category) => (
                <option key={category.value} value={category.value}>
                    {category.label}
                </option>
            ))}
        </Form.Select>
    );
};

export default CategoryOptions;
