import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Container } from "react-bootstrap";

const Voters = () => {
    return (
        <AuthenticatedLayout>
            <Head title="Voters" />

            <Container fluid></Container>
        </AuthenticatedLayout>
    );
};

export default Voters;
