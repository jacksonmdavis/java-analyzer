const downloadBtn = document.getElementById("downloadBtn");
const uploadBtn = document.getElementById("uploadBtn");
const autoBtn = document.getElementById("autoBtn");
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");
const statusDiv = document.getElementById("status");

let startTime;

function logStatus(message) {
    const now = Date.now();
    const elapsed = ((now - startTime) / 1000).toFixed(2);
    statusDiv.textContent += `[+${elapsed}s] ${message}\n`;
}

function displayResult(columnData, title) {
    const container = document.createElement('div');
    container.className = 'analysis-section mb-4';
    
    // Create title
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    container.appendChild(titleElement);
    
    // // Create data section
    // const dataSection = document.createElement('div');
    // dataSection.className = 'data-section mb-2';
    
    // // Add data as text
    // const dataText = document.createElement('pre');
    // dataText.textContent = JSON.stringify(columnData.data, null, 2);
    // dataSection.appendChild(dataText);
    // container.appendChild(dataSection);
    
    // Add image if present
    if (columnData.image) {
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${columnData.image}`;
        img.className = 'analysis-image img-fluid';
        container.appendChild(img);
    }
    
    return container;
}

function showAnalysisResult(data) {
    resultDiv.innerHTML = ''; // Clear previous results
    console.log(data);
    // Display overall results
    if (data.overall) {
        resultDiv.appendChild(displayResult(data.overall, 'Overall Averages'));
    }
    
    // Display column-specific results
    if (data.columns) {
        data.columns.forEach(column => {
            const columnName = Object.keys(column)[0];
            resultDiv.appendChild(displayResult(column[columnName], columnName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')));
        });
    }
}

uploadBtn.addEventListener("click", () => {
    resultDiv.innerHTML = "<p class='text-muted'>Manual download/upload disabled because no one cares. Click 'Just do it Automatically!' instead.</p>";
    return;
});

downloadBtn.addEventListener("click", () => {
    resultDiv.innerHTML = "<p class='text-muted'>Manual download/upload disabled because no one cares. Click 'Just do it Automatically!' instead.</p>";
    return;
});

autoBtn.addEventListener("click", async () => {
    const response = await fetch('resources/StudentsPerformance.csv');
    const blob = await response.blob();
    const file = new File([blob], 'StudentsPerformance.csv', { type: 'text/csv' });

    if (!file) {
        alert("Error: File not found.");
        return;
    }

    startTime = Date.now();
    statusDiv.textContent = ""; // Clear previous
    logStatus("Starting streaming upload/status...");

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_URL}/upload-stream`, {
        method: "POST",
        body: formData
    })
    .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
    
        function read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    logStatus("Stream complete.");
                    return;
                }
                buffer += decoder.decode(value, { stream: true });
    
                // Handle each complete line (newline-delimited JSON)
                const lines = buffer.split("\n");
                buffer = lines.pop(); // Save incomplete line
    
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "log") {
                            logStatus(data.message);
                        } else if (data.type === "result") {
                            const outer = JSON.parse(line); // from your NDJSON line
                            const inner = JSON.parse(outer.data); // now this is a JS object
                            showAnalysisResult(inner.results);
                        }
                        else {
                            logStatus("Unknown message type: " + data.type);
                        }
                    } catch (err) {
                        // logStatus("Malformed JSON: " + line);
                        console.log(err, line);
                    }
                }
                read();
            });
        }
        read();
    })
    .catch(error => {
        logStatus("Streaming failed: " + error.message);
    });
});


