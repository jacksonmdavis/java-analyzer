const downloadBtn = document.getElementById("downloadBtn");
const uploadBtn = document.getElementById("uploadBtn");
const autoBtn = document.getElementById("autoBtn");
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");

// Create a status log panel
let statusDiv = document.getElementById("status");
if (!statusDiv) {
    statusDiv = document.createElement("pre");
    statusDiv.id = "status";
    statusDiv.style.fontFamily = "monospace";
    statusDiv.style.background = "#f9f9f9";
    statusDiv.style.padding = "10px";
    statusDiv.style.border = "1px solid #ccc";
    statusDiv.style.whiteSpace = "pre-wrap";
    document.body.insertBefore(statusDiv, resultDiv);
}

let startTime;

function logStatus(message) {
    const now = Date.now();
    const elapsed = ((now - startTime) / 1000).toFixed(2);
    statusDiv.textContent += `[+${elapsed}s] ${message}\n`;
}

// Manual POST Upload (existing)
uploadBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTime = Date.now();
    statusDiv.textContent = ""; // Clear previous
    logStatus("Uploading file to backend via POST...");

    fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            logStatus("Upload complete. Processing results...");
            resultDiv.textContent = JSON.stringify(data, null, 2);
            logStatus("Done.");
        })
        .catch(error => {
            logStatus("Upload failed: " + error.message);
        });
});

// Streaming Auto Upload (new)
autoBtn.addEventListener("click", () => {
    const file = "resources/StudentsPerformance.csv";
    if (!file) {
        alert("Please select a file.");
        return;
    }

    startTime = Date.now();
    statusDiv.textContent = ""; // Clear previous
    logStatus("Starting streaming upload/status...");

    fetch(`${API_URL}/upload-stream?file=${encodeURIComponent(file.name)}`, {
        method: "GET"
    })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        logStatus("Stream complete.");
                        return;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    logStatus(chunk.trim());
                    read();
                });
            }

            read();
        })
        .catch(error => {
            logStatus("Streaming failed: " + error.message);
        });
});

// Download CSV (stub)
downloadBtn.addEventListener("click", () => {
    alert("Download functionality not implemented yet.");
});
