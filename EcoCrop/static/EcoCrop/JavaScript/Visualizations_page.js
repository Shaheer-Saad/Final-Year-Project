// Ensure the first step is visible on page load
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("step1").classList.remove("hidden");
});

function nextStep(step) {
    for (let i = 1; i <= 4; i++) {
        let stepElement = document.getElementById("step" + i);
        if (stepElement) {
            stepElement.classList.add("hidden");
        }
    }
    let nextStepElement = document.getElementById("step" + step);
    if (nextStepElement) {
        nextStepElement.classList.remove("hidden");
    }
}

function prevStep(step) {
    for (let i = 1; i <= 4; i++) {
        let stepElement = document.getElementById("step" + i);
        if (stepElement) {
            stepElement.classList.add("hidden");
        }
    }
    let prevStepElement = document.getElementById("step" + step);
    if (prevStepElement) {
        prevStepElement.classList.remove("hidden");
    }
}

function fetchColumns() {
    let selectedCategory = document.getElementById("category").value;

    // Debugging: Print the data before sending
    console.log("Sending Data:", JSON.stringify({ category: selectedCategory }));

    if (!selectedCategory) {
        alert("Please select a category first.");
        return;
    }

    fetch("API/Fetch_columns", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ category: selectedCategory }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received response:", data); // Debugging: Log the received response

        if (data.success) {
            populateDropdown("xAxis", data.columns);
            populateDropdown("yAxis", data.columns);
            populateDropdown("zAxis", data.columns);

            // let visualizationType = document.getElementById("visType").value;
            // toggleZAxisDropdown(visualizationType, data.columns); // Check if z-axis should be shown
            
            nextStep(2);  // Move to the next step only after fetching columns
        } else {
            alert("Failed to fetch columns.");
        }
    })
    .catch(error => console.error("Error:", error));
}

function populateDropdown(dropdownId, options) {
    let dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
        console.error(`Dropdown with ID "${dropdownId}" not found.`);
        return;
    }

    dropdown.innerHTML = '<option value="">Choose...</option>'; // Reset dropdown
    options.forEach(option => {
        let opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    });

    dropdown.addEventListener("change", filterDropdownOptions);
}

// Show or hide the Z-axis dropdown based on the visualization type
function toggleZAxisDropdown() {
    let visualizationType = document.getElementById("visType").value;
    console.log("Visualization type:", visualizationType);
    let labelForZAxis = document.getElementById("labelForZAxis");
    let zAxisDropdownContainer = document.getElementById("zAxis");
    if (visualizationType !== "3d") {
        labelForZAxis.style.display = "none";
        zAxisDropdownContainer.style.display = "none"; // Hide the Z-axis dropdown
        nextStep(3);
    } else {
        zAxisDropdownContainer.style.display = "block"; // Show the Z-axis dropdown
        nextStep(3)
    }
}

// Prevent duplicate selections across dropdowns
function filterDropdownOptions() {
    let selectedValues = new Set();
    
    // Collect selected values from all dropdowns
    ["xAxis", "yAxis", "zAxis"].forEach(id => {
        let dropdown = document.getElementById(id);
        if (dropdown && dropdown.value) {
            selectedValues.add(dropdown.value);
        }
    });

    // Update each dropdown to remove already-selected options
    ["xAxis", "yAxis", "zAxis"].forEach(id => {
        let dropdown = document.getElementById(id);
        if (dropdown) {
            let options = [...dropdown.options];
            options.forEach(option => {
                if (option.value && selectedValues.has(option.value) && option.value !== dropdown.value) {
                    option.hidden = true;
                } else {
                    option.hidden = false;
                }
            });
        }
    });
}

function generateVisualization() {
    const category = document.getElementById('category').value;
    const visType = document.getElementById('visType').value;

    let requestData = {};
    
    if (visType === "3d") {
        const xAxis = document.getElementById('xAxis').value;
        const yAxis = document.getElementById('yAxis').value;
        const zAxis = document.getElementById('zAxis').value;

        // Ensure all fields are selected
        if (!category || !visType || !xAxis || !yAxis || !zAxis) {
            alert("Please select all options before generating visualization.");
            return;
        }

        requestData = {
            category: category,
            visType: visType,
            xAxis: xAxis,
            yAxis: yAxis,
            zAxis: zAxis
        };
    } else {
        const xAxis = document.getElementById('xAxis').value;
        const yAxis = document.getElementById('yAxis').value;

        // Ensure all fields are selected
        if (!category || !visType || !xAxis || !yAxis) {
            alert("Please select all options before generating visualization.");
            return;
        }

        requestData = {
            category: category,
            visType: visType,
            xAxis: xAxis,
            yAxis: yAxis
        };
    }

    // Debugging: Print the data before sending
    console.log("Sending Data:", JSON.stringify(requestData));
    
    fetch("API/Generate_plot", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // Ensure CSRF protection
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received Data:", JSON.stringify(data));
        console.log("Plot HTML:", data.plot_html);
        if (data.success) {
            document.getElementById('step4').classList.remove('hidden');
            document.getElementById('plot-container').innerHTML = data.plot_html;

        // Extract and execute script tags
        const scripts = document.getElementById('plot-container').getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerText);  // Run the script content
        }
        } else {
            alert("Error generating visualization.");
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to get CSRF token from cookies (needed for Django's security)
function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrftoken=')) {
                cookieValue = cookie.substring('csrftoken='.length, cookie.length);
                break;
            }
        }
    }
    return cookieValue;
}
