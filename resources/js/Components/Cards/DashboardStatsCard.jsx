import React from "react";

import { Link } from "@inertiajs/react";
import { Card } from "react-bootstrap";

const DashboardStatsCard = ({
    title,
    value,
    icon,
    link,
    color,
    subtitle,
    description,
}) => (
    <Card
        className={`border-0 border-start text-decoration-none border-5 border-${color} bg-${color} bg-opacity-25 shadow-sm h-100`}
        as={Link}
        href={link}
    >
        <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="text-muted mb-2">{title}</h6>
                <h3 className="mb-0">{value}</h3>
                <small className={`text-${color}`}>{subtitle}</small>
            </div>

            <div
                className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
                style={{ width: 45, height: 45, fontSize: 35 }}
            >
                {icon}
            </div>
        </Card.Body>
        <Card.Footer className="text-muted border-top-0">
            {description}
        </Card.Footer>
    </Card>
);

export default DashboardStatsCard;
