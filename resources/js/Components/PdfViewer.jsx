import React, { useEffect, useRef } from "react";

const PdfViewer = ({ pdfBase64, title = "Document" }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (iframeRef.current && pdfBase64) {
            // Create a blob from the base64 PDF
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);

            iframeRef.current.src = blobUrl;

            // Cleanup
            return () => URL.revokeObjectURL(blobUrl);
        }
    }, [pdfBase64]);

    return (
        <iframe
            ref={iframeRef}
            title={title}
            style={{
                width: "100%",
                height: "400px",
                border: "none",
            }}
        />
    );
};

export default PdfViewer;
