// Select the file input and data boxes
const csvUpload = document.getElementById('csvUpload');
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');
const box3 = document.getElementById('box3');
const box4 = document.getElementById('box4');

// Handle file upload
csvUpload.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.csv')) {
    // Simulate processing and filling the boxes with random data
    setTimeout(() => {
      box1.textContent = "Student 1 Data";
      box2.textContent = "Student 2 Data";
      box3.textContent = "Student 3 Data";
      box4.textContent = "Student 4 Data";
    }, 1000);
  } else {
    alert("Please upload a valid CSV file.");
  }
});
