document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://api.java-app.jacksonmdavis.com/upload', {
            method: 'POST',
            // credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';
            resultDiv.innerHTML += `<p>${data.message}</p>`;
            resultDiv.innerHTML += `<p>${data.status}</p>`;
            
            if (data.results && data.results.averages) {
                resultDiv.innerHTML += '<h3>Averages:</h3>';
                for (const [subject, score] of Object.entries(data.results.averages)) {
                    resultDiv.innerHTML += `<p>${subject}: ${score}</p>`;
                }
            }

            if (data.results && data.results.image) {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${data.results.image}`;
                resultDiv.appendChild(img);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `Error: ${error.message}`;
        });
    }
});