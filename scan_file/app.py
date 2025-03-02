from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile
import os
import subprocess
import json


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allows all origins, or you can specify a list of allowed domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Mapping threat categories and severity levels
THREAT_CATEGORIES = {
    0: "Unknown",
    1: "Adware",
    2: "Spyware",
    3: "Password Stealer",
    4: "Trojan",
    5: "Backdoor",
    6: "Downloader",
    7: "Miscellaneous",
    8: "Remote Access Trojan (RAT)",
    9: "Generic",
    10: "Email Flooder",
    11: "Keylogger",
    12: "Dialer",
    13: "Monitoring Software",
    14: "Browser Modifier",
    15: "Cookie",
    16: "Browser Hijacker",
    17: "Host Modifier",
    18: "Trojan Downloader",
    19: "Threat Behavior",
    20: "Security Assessment Tool",
    21: "Settings Modifier",
    22: "Software Bundler",
    23: "Stealth Malware",
    24: "Remote Exploit",
    25: "Ransomware",
}

SEVERITY_LEVELS = {
    0: "Unknown",
    1: "Low",
    2: "Moderate",
    3: "High",
    4: "Severe",
}

RECOMMENDED_ACTIONS = {
    0: "Unknown",
    1: "No Action Needed",
    2: "Quarantine",
    3: "Remove",
    4: "Allow",
    5: "User Defined",
}


def get_threat_details(threat_id):
    """Fetches threat category, severity level, and recommended action using Get-MpThreat."""
    try:
        powershell_command = [
            "powershell",
            "-Command",
            f"Get-MpThreat | Where-Object {{$_.ID -eq {threat_id}}} | ConvertTo-Json -Depth 3",
        ]
        result = subprocess.run(
            powershell_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        try:
            threat_info = json.loads(result.stdout)
        except json.JSONDecodeError:
            return None

        if not threat_info:
            return None

        return {
            "threat_name": threat_info.get("ThreatName", "Unknown"),
            "risk_level": SEVERITY_LEVELS.get(threat_info.get("SeverityID"), "Unknown"),
            "threat_type": THREAT_CATEGORIES.get(
                threat_info.get("CategoryID"), "Unknown"
            ),
            "recommended_action": threat_info.get("DefaultAction", "Unknown"),
        }

    except Exception as e:
        return {"error": str(e)}


def extract_threat_properties(latest_threat):
    properties = {
        prop["Name"]: prop["Value"]
        for prop in latest_threat.get("CimInstanceProperties", [])
    }

    return {
        "threat_name": properties.get("ThreatName", "Unknown Threat"),
        "risk_level": SEVERITY_LEVELS.get(
            properties.get("ThreatStatusID", None), "Unknown"
        ),
        "threat_type": THREAT_CATEGORIES.get(
            properties.get("DetectionSourceTypeID", None), "Unknown"
        ),
        "recommended_action": RECOMMENDED_ACTIONS.get(
            properties.get("CleaningActionID", None), "Unknown"
        ),
    }


def scan_with_defender(file_path: str):
    """Scans a file using Windows Defender and retrieves full threat details."""
    try:
        # Step 1: Run Windows Defender Scan
        scan_command = [
            "C:\\Program Files\\Windows Defender\\MpCmdRun.exe",
            "-Scan",
            "-ScanType",
            "3",
            "-File",
            file_path,
        ]
        subprocess.run(
            scan_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        # Step 2: Get detected threats with PowerShell
        powershell_command = [
            "powershell",
            "-Command",
            "Get-MpThreatDetection | ConvertTo-Json -Depth 3",
        ]
        result = subprocess.run(
            powershell_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        try:
            threats = json.loads(result.stdout)
        except json.JSONDecodeError:
            return {
                "status": "Error",
                "threat_name": "Failed to parse threat detection output",
                "risk_level": None,
                "threat_type": None,
                "recommended_action": None,
            }

        # Ensure threats is a list
        if isinstance(threats, dict):
            threats = [threats]
        elif not isinstance(threats, list):
            return {
                "status": "Error",
                "threat_name": "Unexpected response format from Defender",
                "risk_level": None,
                "threat_type": None,
                "recommended_action": None,
            }

        if not threats:
            return {
                "status": "Clean",
                "threat_name": None,
                "risk_level": None,
                "threat_type": None,
                "recommended_action": None,
            }

        # Extract the latest detected threat
        latest_threat = threats[-1] if isinstance(threats, list) else None
        if not isinstance(latest_threat, dict):
            return {
                "status": "Error",
                "threat_name": "Invalid threat data structure",
                "risk_level": None,
                "threat_type": None,
                "recommended_action": None,
            }

        # Extract threat details using the new function
        threat_details = extract_threat_properties(latest_threat)

        return {
            "status": "Infected",
            "threat_name": threat_details["threat_name"],
            "risk_level": threat_details["risk_level"],
            "threat_type": threat_details["threat_type"],
            "recommended_action": threat_details["recommended_action"],
        }

    except Exception as e:
        return {
            "status": "Error",
            "threat_name": str(e),
            "risk_level": None,
            "threat_type": None,
            "recommended_action": None,
        }


@app.post("/scan/")
async def scan_files(files: list[UploadFile] = File(...)):
    scan_results = []

    for file in files:
        file_info = {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size if hasattr(file, "size") else None,
            "status": None,
            "threat_name": None,
            "risk_level": None,
            "threat_type": None,
            "recommended_action": None,
        }

        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(await file.read())
                tmp_file_path = tmp_file.name

            scan_result = scan_with_defender(tmp_file_path)
            file_info.update(scan_result)

        except Exception as e:
            file_info["status"] = "Error"
            file_info["threat_name"] = str(e)

        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

        scan_results.append(file_info)

    return JSONResponse(content=scan_results)
