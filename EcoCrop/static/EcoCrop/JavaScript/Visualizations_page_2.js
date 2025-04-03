// Ensure the first step is visible on page load
document.addEventListener("DOMContentLoaded", function() {
    // Add first visualization
    addAnotherVisualization();
    
    // Set up event listeners
    document.getElementById('addAnotherVisualizationButton')?.addEventListener('click', addAnotherVisualization);
    
    // Enable Next button when category is selected
    document.querySelector('.category')?.addEventListener('change', function() {
        const nextBtn = this.closest('.Container').querySelector('.step1 .next-btn');
        if (this.value) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    });
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
        if (data.success) {
            populateDropdown("xAxis", data.axes_values[0], selectedCategory);
            populateDropdown("yAxis", data.axes_values[1], selectedCategory);
            populateDropdown("zAxis", data.axes_values[2], selectedCategory);
            
            nextStep(2, container);  // Move to the next step only after fetching columns
        } else {
            alert("There was an error while communicating to the server!");
        }
    })
    .catch(error => console.error("Error:", error));
}

function populateDropdown(dropdownId, options, category) {
    let dropdown = document.getElementById(dropdownId);

    if (["yAxis", "zAxis"].includes(dropdownId)) {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            document.getElementById("specific" + dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1)).classList.remove("hidden");
            let cropsDropdown = document.getElementById("cropsFor" + dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1));
            let otherColumnsDropdown = document.getElementById("otherColumnsFor" + dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1));
            cropsDropdown.innerHTML = '<option value="">Choose...</option>'; // Reset dropdown
            options[0].forEach(option => {
                let opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                cropsDropdown.appendChild(opt);
            });
            cropsDropdown.addEventListener("change", function () {
                filterDropdownOptions(dropdownId, category);
            });
            otherColumnsDropdown.innerHTML = '<option value="">Choose...</option>'; // Reset dropdown
            options[1].forEach(option => {
                let opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                otherColumnsDropdown.appendChild(opt);
            });
            otherColumnsDropdown.addEventListener("change", function () {
                filterDropdownOptions(dropdownId, category);
            });
        } else {
            document.getElementById("general" + dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1)).classList.remove("hidden");
            let generalDropdown = document.getElementById("general" + dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1) + "Dropdown");
            generalDropdown.innerHTML = '<option value="">Choose...</option>'; // Reset dropdown
            options.forEach(option => {
                let opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                generalDropdown.appendChild(opt);
            });
            generalDropdown.addEventListener("change", function () {
                filterDropdownOptions(dropdownId, category);
            });
        }
    } else {
        dropdown.innerHTML = '<option value="">Choose...</option>'; // Reset dropdown
        options.forEach(option => {
            let opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
        dropdown.addEventListener("change", function () {
            filterDropdownOptions(dropdownId, category);
        });
    }
}

// Show or hide the Z-axis dropdown based on the visualization type
function toggleZAxisDropdown() {
    let visualizationType = document.getElementById("visType").value;
    if (!visualizationType) {
        alert("Please select a type of visualization first.")
        return
    }
    let zAxisDropdownContainer = document.getElementById("zAxis");
    if (visualizationType !== "3d") {
        zAxisDropdownContainer.style.display = "none"; // Hide the Z-axis dropdown
        nextStep(3);
    } else {
        zAxisDropdownContainer.style.display = "block"; // Show the Z-axis dropdown
        nextStep(3)
    }
}

// Prevent duplicate selections across dropdowns
function filterDropdownOptions(dropdownId, category) {
    let selectedValues = new Set();

    if (["yAxis", "zAxis"].includes(dropdownId)) {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            // Collect selected values from all dropdowns
            ["otherColumnsForYAxis", "otherColumnsForZAxis"].forEach(id => {
                let dropdown = document.getElementById(id);
                if (dropdown && dropdown.value) {
                    selectedValues.add(dropdown.value);
                }
            });

            setTimeout(() => {}, 1000); // 2000ms = 2 seconds
            // Update each dropdown to remove already-selected options
            ["otherColumnsForYAxis", "otherColumnsForZAxis"].forEach(id => {
                let dropdown = document.getElementById(id);// "otherColumnsForZAxis");
                if (dropdown) {
                    let options = [...dropdown.options];
                    options.forEach(option => {
                        if (document.getElementById("cropsForYAxis").value === document.getElementById("cropsForZAxis").value) {
                            if (option.value && selectedValues.has(option.value) && option.value !== dropdown.value) {
                                option.hidden = true;
                            } else {
                                option.hidden = false;
                            }
                        } else {
                            option.hidden = false;
                        }
                    });
                }
            });
            // Collect selected values from all dropdowns
            ["cropsForYAxis", "cropsForZAxis"].forEach(id => {
                let dropdown = document.getElementById(id);
                if (dropdown && dropdown.value) {
                    selectedValues.add(dropdown.value);
                }
            });

            setTimeout(() => {}, 1000); // 2000ms = 2 seconds
            // Update each dropdown to remove already-selected options
            
            ["cropsForYAxis", "cropsForZAxis"].forEach(id => {
                let dropdown = document.getElementById(id);// "otherColumnsForZAxis");
                if (dropdown) {
                    let options = [...dropdown.options];
                    options.forEach(option => {
                        if (document.getElementById("otherColumnsForYAxis").value === document.getElementById("otherColumnsForZAxis").value) {
                            if (option.value && selectedValues.has(option.value) && option.value !== dropdown.value) {
                                option.hidden = true;
                            } else {
                                option.hidden = false;
                            }
                        } else {
                            option.hidden = false;
                        }
                    });
                }
            });
        } else {
            // Collect selected values from all dropdowns
            ["generalYAxisDropdown", "generalZAxisDropdown"].forEach(id => {
                let dropdown = document.getElementById(id);
                if (dropdown && dropdown.value) {
                    selectedValues.add(dropdown.value);
                }
            });
            
            // Update each dropdown to remove already-selected options
            ["generalYAxisDropdown", "generalZAxisDropdown"].forEach(id => {
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
    }
}

function generateVisualization() {
    const category = document.getElementById('category').value;
    const visType = document.getElementById('visType').value;
    const xAxis = document.getElementById('xAxis').value;

    if (!xAxis) {
        alert("Please select all options before generating visualization.");
        return;
    }

    let requestData = {};
    
    if (visType === "3d") {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            const cropForYAxis = document.getElementById('cropsForYAxis').value;
            const otherColumnForYAxis = document.getElementById('otherColumnsForYAxis').value;
            const cropForZAxis = document.getElementById('cropsForZAxis').value;
            const otherColumnForZAxis = document.getElementById('otherColumnsForZAxis').value;
            
            // Ensure all fields are selected
            if (!cropForYAxis || !otherColumnForYAxis || !cropForZAxis || !otherColumnForZAxis) {
                alert("Please select all options before generating visualization.");
                return;
            }
            
            requestData = {
                category: category,
                visType: visType,
                xAxis: xAxis,
                cropForYAxis: cropForYAxis,
                otherColumnForYAxis: otherColumnForYAxis,
                cropForZAxis: cropForZAxis,
                otherColumnForZAxis: otherColumnForZAxis
            };
        } else {
            const generalYAxis = document.getElementById("generalYAxisDropdown");
            const generalZAxis = document.getElementById("generalZAxisDropdown");
            
            // Ensure all fields are selected
            if (!generalYAxis || !generalZAxis) {
                alert("Please select all options before generating visualization.");
                return;
            }

            requestData = {
                category: category,
                visType: visType,
                xAxis: xAxis,
                generalYAxis: generalYAxis,
                generalZAxis: generalZAxis
            };
        }
    } else {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            const cropForYAxis = document.getElementById('cropsForYAxis').value;
            const otherColumnForYAxis = document.getElementById('otherColumnsForYAxis').value;

            if (!cropForYAxis || !otherColumnForYAxis) {
                alert("Please select all options before generating visualization.");
                return;
            }
            
            requestData = {
                category: category,
                visType: visType,
                xAxis: xAxis,
                cropForYAxis: cropForYAxis,
                otherColumnForYAxis: otherColumnForYAxis
            };
        } else {
            const generalYAxis = document.getElementById('generalYAxisDropdown').value;
            
            // Ensure all fields are selected
            if (!generalYAxis) {
                alert("Please select all options before generating visualization.");
                return;
            }

            requestData = {
                category: category,
                visType: visType,
                xAxis: xAxis,
                generalYAxis: generalYAxis
            };
        }
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