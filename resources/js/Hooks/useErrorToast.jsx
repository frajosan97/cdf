import { useCallback } from "react";
import { toast } from "react-toastify";

export const useErrorToast = () => {
    /* ------------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------------ */
    const showErrorToast = useCallback((error) => {
        if (!error) {
            toast.error("An unknown error occurred");
            return;
        }

        // Axios-style response
        const responseData = error?.response?.data;

        if (responseData) {
            const { errors, message } = responseData;

            // Laravel validation errors
            if (errors && typeof errors === "object") {
                Object.values(errors).forEach((messages) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(msg));
                    }
                });
                return;
            }

            // API message
            if (typeof message === "string") {
                toast.error(message);
                return;
            }
        }

        // Fallbacks
        if (typeof error.message === "string") {
            toast.error(error.message);
            return;
        }

        toast.error("An unexpected error occurred");
    }, []);

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        showErrorToast,
    };
};
