import os
import sys
import subprocess
import json
import hmac
import hashlib
import urllib.request

def run_cmd(args):
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
    if result.returncode != 0:
        print(f"Error running cmd {' '.join(args)}: {result.stderr}")
        return ""
    return result.stdout.strip()

def main():
    print("Starting GitHub sync script...")
    
    # Retrieve environment variables
    sync_url = os.environ.get("SYNC_URL")
    sync_secret = os.environ.get("SYNC_SECRET")
    commit_sha = os.environ.get("GITHUB_SHA")

    if not sync_url:
        print("Error: SYNC_URL env variable is missing.")
        sys.exit(1)
    if not sync_secret:
        print("Error: SYNC_SECRET env variable is missing.")
        sys.exit(1)
    if not commit_sha:
        print("Error: GITHUB_SHA env variable is missing.")
        sys.exit(1)

    # 1. Identify changed files in the latest commit
    parent = run_cmd(["git", "rev-parse", "HEAD~1"])
    if not parent:
        # Fallback to compare against empty tree
        parent = "4b825dc642cb6eb9a0ff12f406d9b6140407155e"
    else:
        parent = "HEAD~1"

    diff_output = run_cmd(["git", "diff-tree", "-r", "--no-commit-id", "--name-status", parent, "HEAD"])
    if not diff_output:
        print("No files changed in this commit.")
        sys.exit(0)

    files_payload = []
    lines = diff_output.splitlines()
    for line in lines:
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        
        status_char = parts[0]
        file_path = parts[1]

        # Ignore root level files (like root README.md, .gitignore, etc.)
        if "/" not in file_path:
            continue

        status = "added"
        if status_char.startswith("M"):
            status = "modified"
        elif status_char.startswith("D"):
            status = "removed"

        content = ""
        if status != "removed":
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                except Exception as e:
                    print(f"Warning: Could not read file '{file_path}': {e}")
                    continue
            else:
                # Fallback: read using git show if path is not checked out physically
                git_show_content = run_cmd(["git", "show", f"HEAD:{file_path}"])
                if git_show_content:
                    content = git_show_content
                else:
                    print(f"Warning: File '{file_path}' does not exist on disk.")
                    continue

        files_payload.append({
            "path": file_path,
            "content": content,
            "status": status
        })

    if not files_payload:
        print("No relevant solution files changed in this commit.")
        sys.exit(0)

    print(f"Packaging {len(files_payload)} changed files for synchronization.")

    # 2. Build JSON payload
    payload_data = {
        "commitSha": commit_sha,
        "files": files_payload
    }
    
    payload_bytes = json.dumps(payload_data).encode("utf-8")

    # 3. Calculate HMAC-SHA256 signature
    hmac_obj = hmac.new(sync_secret.encode("utf-8"), payload_bytes, hashlib.sha256)
    signature = "sha256=" + hmac_obj.hexdigest()

    # 4. POST payload to Next.js API endpoint
    req = urllib.request.Request(
        sync_url,
        data=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": signature,
            "User-Agent": "GitHub-Actions-Sync-Engine"
        },
        method="POST"
    )

    try:
        print(f"Sending POST request to: {sync_url}...")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print("==============================================")
            print("Webhook Synchronization Response:")
            print("==============================================")
            print(res_body)
            print("==============================================")
            print("Webhook sync completed successfully.")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8', errors='ignore')}")
        sys.exit(1)
    except Exception as e:
        print(f"Network Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
