"use client";
import React, { useState } from "react";
import axios from "axios";

const FileUploadPage = () => {
    const [file, setFile] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("files", file); // ✅ Fixed key name

        try {
            const response = await axios.post(
                "https://sb9kzwdh-8000.inc1.devtunnels.ms/scan/",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // ✅ Check API response
            if (response.data && response.data.length > 0) {
                setScanResult(response.data[0]); // Save scan result
                setError(""); // Clear error
            } else {
                setError("Invalid response from server.");
            }
        } catch (err) {
            setError("Failed to upload file. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-white/60 bg-blur-sm p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Upload File</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Choose file
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Upload
                    </button>
                </form>

                {/* ✅ Show scan result */}
                {scanResult && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <h2 className="text-lg font-bold">Scan Result:</h2>
                        <p><strong>Filename:</strong> {scanResult.filename}</p>
                        <p><strong>Status:</strong> {scanResult.status}</p>
                        <p><strong>Threat:</strong> {scanResult.threat_name}</p>
                        <p><strong>Risk Level:</strong> {scanResult.risk_level}</p>
                        <p><strong>Recommended Action:</strong> {scanResult.recommended_action}</p>
                    </div>
                )}

                {/* ✅ Show errors */}
                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default FileUploadPage;
