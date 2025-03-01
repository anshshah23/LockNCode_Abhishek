from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile
import os
from clamav_client import ClamAVClient

app = FastAPI()
clamav_client = ClamAVClient()


@app.post("/scan/")
async def scan_files(files: list[UploadFile] = File(...)):
    scan_results = {}

    for file in files:
        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(await file.read())
                tmp_file_path = tmp_file.name

            scan_result = clamav_client.scan_file(tmp_file_path)

            if scan_result and tmp_file_path in scan_result:
                status = scan_result[tmp_file_path][0]
                if status == "OK":
                    scan_results[file.filename] = "✅ No threats detected"
                elif status == "FOUND":
                    threat = scan_result[tmp_file_path][1]
                    scan_results[file.filename] = f"🚨 Threat detected: {threat}"
                else:
                    scan_results[file.filename] = "⚠️ Unknown scan result"
            else:
                scan_results[file.filename] = "⚠️ No scan result available"

        except Exception as e:
            scan_results[file.filename] = f"❌ Error scanning file: {e}"

        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

    return JSONResponse(content=scan_results)
