"use client"

import { useState, useRef } from "react"
import axios from "axios"
import { Shield, Upload, FileText, AlertTriangle, CheckCircle2, Loader2, X, Info, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { jsPDF } from "jspdf"
const FileUploadPage = () => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      setFileSize(formatFileSize(selectedFile.size))
      setScanResult(null)
      setError("")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      setFileName(droppedFile.name)
      setFileSize(formatFileSize(droppedFile.size))
      setScanResult(null)
      setError("")

      // Update the file input for form submission
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(droppedFile)
        fileInputRef.current.files = dataTransfer.files
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setIsLoading(true)
    setScanResult(null)
    setError("")

    const formData = new FormData()
    formData.append("files", file)

    try {
      const response = await axios.post("https://sb9kzwdh-8000.inc1.devtunnels.ms/scan/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data && response.data.length > 0) {
        setScanResult(response.data[0])
      } else {
        setError("Invalid response from server.")
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setFileName("")
    setFileSize("")
    setScanResult(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return "bg-gray-500"

    const level = riskLevel.toLowerCase()
    if (level.includes("high")) return "bg-red-500"
    if (level.includes("medium")) return "bg-orange-500"
    if (level.includes("low")) return "bg-yellow-500"
    if (level.includes("safe") || level.includes("clean")) return "bg-green-500"

    return "bg-blue-500"
  }

  const getStatusIcon = (status) => {
    if (!status) return <Info className="h-5 w-5" />

    const statusLower = status.toLowerCase()
    if (statusLower.includes("clean") || statusLower.includes("safe")) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    return <AlertTriangle className="h-5 w-5 text-red-500" />
  }

const handleDownloadReport = () => {
    if (!scanResult) return

    const doc = new jsPDF()
    doc.text("Scan Report", 20, 20)
    doc.text(`Filename: ${scanResult.filename}`, 20, 30)
    doc.text(`Status: ${scanResult.status}`, 20, 40)
    doc.text(`Threat: ${scanResult.threat_name || "None detected"}`, 20, 50)
    doc.text(`Risk Level: ${scanResult.risk_level || "Unknown"}`, 20, 60)
    doc.text(`Recommended Action: ${scanResult.recommended_action || "No action required"}`, 20, 70)
    doc.text(`Scan completed at: ${new Date().toLocaleTimeString()}`, 20, 80)
    doc.save(`${scanResult.filename}_scan_report.pdf`)
}

return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white pt-16">
        <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">File Scanner</h1>
                    <p className="text-slate-400">Upload files to scan for phishing and malicious content</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Upload File</CardTitle>
                        <CardDescription className="text-slate-400">Drag and drop your file or click to browse</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                    isDragging
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50"
                                } transition-all duration-200 cursor-pointer mb-6`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="rounded-full bg-slate-800 p-3">
                                        <Upload className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-300">
                                            {isDragging ? "Drop your file here" : "Drag & drop your file here"}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">or click to browse your files</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Supports documents, PDFs, archives, and executables</p>
                                </div>
                            </div>

                            {file && (
                                <div className="mb-6 bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-slate-700 p-2">
                                            <FileText className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-sm truncate">{fileName}</p>
                                            <p className="text-xs text-slate-500">{fileSize}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearFile}
                                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!file || isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            Scan File
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {isLoading && (
                            <div className="mt-6">
                                <p className="text-sm text-slate-400 mb-2">Scanning file for threats...</p>
                                <Progress
                                    value={isLoading ? 80 : 0}
                                    className="h-2 bg-slate-800"
                                    indicatorClassName="bg-purple-500"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <p className="text-red-500 font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {scanResult && (
                    <Card
                        className={`border-slate-800 overflow-hidden ${
                            scanResult.status?.toLowerCase().includes("clean") || scanResult.status?.toLowerCase().includes("safe")
                                ? "bg-green-950/10"
                                : "bg-red-950/10"
                        }`}
                    >
                        <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {getStatusIcon(scanResult.status)}
                                    Scan Results
                                </CardTitle>
                                <CardDescription className="text-slate-400">Analysis of {scanResult.filename}</CardDescription>
                            </div>
                            <Badge className={`${getRiskLevelColor(scanResult.risk_level)} text-white`}>
                                {scanResult.risk_level || "Unknown Risk"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 divide-y divide-slate-800">
                                <div className="p-4 grid grid-cols-3">
                                    <div className="text-sm font-medium text-slate-400">Filename</div>
                                    <div className="col-span-2 font-medium truncate">{scanResult.filename}</div>
                                </div>
                                <div className="p-4 grid grid-cols-3">
                                    <div className="text-sm font-medium text-slate-400">Status</div>
                                    <div className="col-span-2 font-medium">
                                        <span
                                            className={`inline-flex items-center gap-1 ${
                                                scanResult.status?.toLowerCase().includes("clean") ||
                                                scanResult.status?.toLowerCase().includes("safe")
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {scanResult.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-3">
                                    <div className="text-sm font-medium text-slate-400">Threat</div>
                                    <div className="col-span-2 font-medium">{scanResult.threat_name || "None detected"}</div>
                                </div>
                                <div className="p-4 grid grid-cols-3">
                                    <div className="text-sm font-medium text-slate-400">Risk Level</div>
                                    <div className="col-span-2">
                                        <Badge className={`${getRiskLevelColor(scanResult.risk_level)}`}>
                                            {scanResult.risk_level || "Unknown"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-3">
                                    <div className="text-sm font-medium text-slate-400">Recommended Action</div>
                                    <div className="col-span-2">{scanResult.recommended_action || "No action required"}</div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-slate-800 bg-slate-900/50 p-4">
                            <div className="w-full flex justify-between items-center">
                                <p className="text-xs text-slate-400">Scan completed at {new Date().toLocaleTimeString()}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                                    onClick={handleDownloadReport}
                                >
                                    Download Report
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-500">
            <p>© 2023 PhishGuard AI. All rights reserved. Powered by advanced threat detection algorithms.</p>
        </footer>
    </div>
)
}

export default FileUploadPage

