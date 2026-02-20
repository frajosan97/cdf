import { useEffect } from "react";
import { Head } from "@inertiajs/react";

export default function Register() {
    useEffect(() => {
        // Redirect to login page
        window.location.href = route("home");
    }, []);

    return (
        <>
            <Head title="Register" />
            <div className="text-center mt-5">
                <p>
                    No account registrations are accepted from public,
                    Redirecting...
                </p>
            </div>
        </>
    );
}
