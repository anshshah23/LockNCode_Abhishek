from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile
import os
from clamav_client import ClamAVClient

app = FastAPI()
clamav_client = ClamAVClient()


@app.post("/scan/")
async def scan_files(files: list[UploadFile] = File(...)):
    scan_results = []

    for file in files:
        file_info = {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size if hasattr(file, "size") else None,
            "status": None,
            "threat": None,
        }

        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(await file.read())
                tmp_file_path = tmp_file.name

            scan_result = clamav_client.scan_file(tmp_file_path)
            # Store scan results directly
            file_info["status"] = scan_result.get(tmp_file_path, [None])[0]
            file_info["threat"] = scan_result.get(tmp_file_path, [None, None])[1]

        except Exception as e:
            file_info["status"] = "Error"
            file_info["threat"] = str(e)

        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

        scan_results.append(file_info)

    return JSONResponse(content=scan_results)
