import clamd


class ClamAVClient:
    def __init__(self, host="localhost", port=3310):
        try:
            self.cd = clamd.ClamdNetworkSocket(host, port)
            self.cd.ping()
            print("✅ Connected to ClamAV daemon.")
        except Exception as e:
            raise ConnectionError(f"❌ Unable to connect to ClamAV: {e}")

    def scan_file(self, file_path):
        try:
            scan_result = self.cd.scan(file_path)
            return scan_result
        except Exception as e:
            raise RuntimeError(f"❌ Error scanning file {file_path}: {e}")
