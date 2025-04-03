// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Add first visualization
    addAnotherVisualization();
    
    // Set up event listeners
    document.getElementById('addAnotherVisualizationButton')?.addEventListener('click', addAnotherVisualization);
});

// Helper function to get parent container
function getContainer(element) {
    return element?.closest(".Container") || document.querySelector(".Container");
}

// Navigation functions
function nextStep(button, step) {
    const container = getContainer(button);
    for (let i = 1; i <= 4; i++) {
        const stepElement = container.querySelector(`.step${i}`);
        if (stepElement) stepElement.classList.add("hidden");
    }
    container.querySelector(`.step${step}`)?.classList.remove("hidden");
}

function prevStep(button, step) {
    const container = getContainer(button);
    for (let i = 1; i <= 4; i++) {
        const stepElement = container.querySelector(`.step${i}`);
        if (stepElement) stepElement.classList.add("hidden");
    }
    container.querySelector(`.step${step}`)?.classList.remove("hidden");
}

// Fetch columns from server
function fetchColumns(button) {
    const container = getContainer(button);
    const selectedCategory = container.querySelector('.category').value;

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
            populateDropdown(container, "xAxis", data.axes_values[0], selectedCategory);
            populateDropdown(container, "yAxis", data.axes_values[1], selectedCategory);
            populateDropdown(container, "zAxis", data.axes_values[2], selectedCategory);
            nextStep(button, 2);
        } else {
            alert("Error fetching columns from server!");
        }
    })
    .catch(error => console.error("Error:", error));
}

// Populate dropdown menus
function populateDropdown(container, dropdownClass, options, category) {
    const dropdown = container.querySelector(`.${dropdownClass}`);

    if (["yAxis", "zAxis"].includes(dropdownClass)) {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            container.querySelector(`.specific${dropdownClass.charAt(0).toUpperCase() + dropdownClass.slice(1)}`).classList.remove("hidden");
            const cropsDropdown = container.querySelector(`.cropsFor${dropdownClass.charAt(0).toUpperCase() + dropdownClass.slice(1)}`);
            const otherColumnsDropdown = container.querySelector(`.otherColumnsFor${dropdownClass.charAt(0).toUpperCase() + dropdownClass.slice(1)}`);
            
            resetAndPopulateDropdown(cropsDropdown, options[0]);
            resetAndPopulateDropdown(otherColumnsDropdown, options[1]);

            // Add event listeners for duplicate prevention
            cropsDropdown.addEventListener("change", () => {
                filterDropdownOptions(dropdownClass, category);
            });
            otherColumnsDropdown.addEventListener("change", () => {
                filterDropdownOptions(dropdownClass, category);
            });
            
            // Initial filtering
            filterDropdownOptions(dropdownClass, category);
        } else {
            container.querySelector(`.general${dropdownClass.charAt(0).toUpperCase() + dropdownClass.slice(1)}`).classList.remove("hidden");
            const generalDropdown = container.querySelector(`.general${dropdownClass.charAt(0).toUpperCase() + dropdownClass.slice(1)}Dropdown`);
            resetAndPopulateDropdown(generalDropdown, options);

            // Add event listener for duplicate prevention
            generalDropdown.addEventListener("change", () => {
                filterDropdownOptions(dropdownClass, category);
            });
            
            // Initial filtering
            filterDropdownOptions(dropdownClass, category);
        }
    } else {
        resetAndPopulateDropdown(dropdown, options);
    }
}



function resetAndPopulateDropdown(dropdown, options) {
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">Choose...</option>';
    options?.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    });
}

// Toggle Z-axis visibility
function toggleZAxisDropdown(button) {
    const container = getContainer(button);
    const visualizationType = container.querySelector('.visType').value;
    if (!visualizationType) {
        alert("Please select a visualization type first.");
        return;
    }
    
    const zAxisContainer = container.querySelector('.zAxis');
    if (visualizationType !== "3d") {
        zAxisContainer.style.display = "none";
    } else {
        zAxisContainer.style.display = "block";
    }
    nextStep(button, 3);
}

function filterDropdownOptions(dropdownId, category) {
    const container = document.querySelector(".Container:not(.hidden)") || document.querySelector(".Container");
    if (!container) {
        console.error("Container element not found");
        return;
    }

    if (["yAxis", "zAxis"].includes(dropdownId)) {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            // Get all relevant dropdown elements
            const cropsY = container.querySelector(".cropsForYAxis");
            const cropsZ = container.querySelector(".cropsForZAxis");
            const otherY = container.querySelector(".otherColumnsForYAxis");
            const otherZ = container.querySelector(".otherColumnsForZAxis");

            // Get current values
            const currentCropY = cropsY?.value;
            const currentCropZ = cropsZ?.value;
            const currentOtherY = otherY?.value;
            const currentOtherZ = otherZ?.value;

            // Prevent duplicate crop selections
            if (dropdownId === "yAxis" && currentCropY && currentCropY === currentCropZ) {
                alert("Cannot select the same crop for both Y and Z axes");
                cropsY.value = "";
                return;
            }
            if (dropdownId === "zAxis" && currentCropZ && currentCropZ === currentCropY) {
                alert("Cannot select the same crop for both Y and Z axes");
                cropsZ.value = "";
                return;
            }

            // Prevent duplicate metric selections when crops are same
            if (currentCropY && currentCropY === currentCropZ && 
                currentOtherY && currentOtherY === currentOtherZ) {
                alert("Cannot select the same metric for both axes when crops are identical");
                if (dropdownId === "yAxis") otherY.value = "";
                if (dropdownId === "zAxis") otherZ.value = "";
                return;
            }

            // Filter options in otherColumns dropdowns
            if (otherY && otherZ) {
                const otherOptionsY = Array.from(otherY.options);
                const otherOptionsZ = Array.from(otherZ.options);

                otherOptionsY.forEach(option => {
                    option.hidden = currentOtherZ && option.value === currentOtherZ && option.value !== otherY.value;
                });

                otherOptionsZ.forEach(option => {
                    option.hidden = currentOtherY && option.value === currentOtherY && option.value !== otherZ.value;
                });
            }

        } else {
            // Handle general case (non-Economy categories)
            const generalY = container.querySelector(".generalYAxisDropdown");
            const generalZ = container.querySelector(".generalZAxisDropdown");

            const currentGeneralY = generalY?.value;
            const currentGeneralZ = generalZ?.value;

            // Prevent duplicate selections in general case
            if (dropdownId === "yAxis" && currentGeneralY && currentGeneralY === currentGeneralZ) {
                alert("Cannot select the same value for both Y and Z axes");
                generalY.value = "";
                return;
            }
            if (dropdownId === "zAxis" && currentGeneralZ && currentGeneralZ === currentGeneralY) {
                alert("Cannot select the same value for both Y and Z axes");
                generalZ.value = "";
                return;
            }

            // Filter options in general dropdowns
            if (generalY && generalZ) {
                const generalOptionsY = Array.from(generalY.options);
                const generalOptionsZ = Array.from(generalZ.options);

                generalOptionsY.forEach(option => {
                    option.hidden = currentGeneralZ && option.value === currentGeneralZ && option.value !== generalY.value;
                });

                generalOptionsZ.forEach(option => {
                    option.hidden = currentGeneralY && option.value === currentGeneralY && option.value !== generalZ.value;
                });
            }
        }
    }
}

// Generate visualization
function generateVisualization(button) {
    const container = getContainer(button);
    const category = container.querySelector('.category').value;
    const visType = container.querySelector('.visType').value;
    const xAxis = container.querySelector('.xAxis').value;

    if (!xAxis) {
        alert("Please select all required options.");
        return;
    }

    let requestData = {};
    
    if (visType === "3d") {
        if (["Economy", "Economy with Climate Index"].includes(category)) {
            const cropForYAxis = container.querySelector('.cropsForYAxis').value;
            const otherColumnForYAxis = container.querySelector('.otherColumnsForYAxis').value;
            const cropForZAxis = container.querySelector('.cropsForZAxis').value;
            const otherColumnForZAxis = container.querySelector('.otherColumnsForZAxis').value;
            
            if (!cropForYAxis || !otherColumnForYAxis || !cropForZAxis || !otherColumnForZAxis) {
                alert("Please select all required options.");
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
            const generalYAxis = container.querySelector('.generalYAxisDropdown').value;
            const generalZAxis = container.querySelector('.generalZAxisDropdown').value;
            
            if (!generalYAxis || !generalZAxis) {
                alert("Please select all required options.");
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
            const cropForYAxis = container.querySelector('.cropsForYAxis').value;
            const otherColumnForYAxis = container.querySelector('.otherColumnsForYAxis').value;

            if (!cropForYAxis || !otherColumnForYAxis) {
                alert("Please select all required options.");
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
            const generalYAxis = container.querySelector('.generalYAxisDropdown').value;
            
            if (!generalYAxis) {
                alert("Please select all required options.");
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

    // Show loading state
    const generateBtn = container.querySelector('.generate-btn');
    const originalBtnText = generateBtn.textContent;
    generateBtn.textContent = "Generating...";
    generateBtn.disabled = true;

    fetch("API/Generate_plot", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        generateBtn.textContent = originalBtnText;
        generateBtn.disabled = false;
        
        if (data.success) {
            container.querySelector('.step4').classList.remove('hidden');
            container.querySelector('.plot-container').innerHTML = data.plot_html;

            // Execute any scripts in the plot HTML
            const scripts = container.querySelector('.plot-container').getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                try {
                    eval(scripts[i].innerText);
                } catch (e) {
                    console.error("Error executing plot script:", e);
                }
            }
            
            container.querySelector(".remove-btn").classList.remove("hidden");
            
            // Show the "Add another" button after successful generation
            document.getElementById("add-another-container").classList.remove("hidden");
            
            nextStep(button, 4);
        } else {
            alert("Error generating visualization: " + (data.message || "Unknown error"));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        generateBtn.textContent = originalBtnText;
        generateBtn.disabled = false;
        alert("Network error occurred. Please try again.");
    });
}

// Get CSRF token for Django
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

// Remove visualization
function removeVisualization(button) {
    const wrapper = button.closest('.visualization-wrapper');
    if (wrapper) {
        wrapper.remove();
    }
}

// Add new visualization
function addAnotherVisualization() {
    const visualizationsContainer = document.getElementById("visualizations-container");
    const template = document.getElementById("visualization-template");
    
    if (!visualizationsContainer || !template) return;
    
    // Clone the template
    const newVisualization = template.cloneNode(true);
    newVisualization.classList.remove("hidden");
    newVisualization.removeAttribute("id");
    
    // Reset the new visualization
    const container = newVisualization.querySelector(".Container");
    if (container) {
        // Show only step 1
        container.querySelector('.step1').classList.remove("hidden");
        for (let i = 2; i <= 4; i++) {
            const step = container.querySelector(`.step${i}`);
            if (step) step.classList.add("hidden");
        }
        
        // Reset all inputs
        container.querySelectorAll('select').forEach(select => {
            select.value = "";
        });
        
        // Clear plot container
        const plotContainer = container.querySelector('.plot-container');
        if (plotContainer) plotContainer.innerHTML = "";
        
        // Hide remove button
        const removeBtn = container.querySelector('.remove-btn');
        if (removeBtn) removeBtn.classList.add("hidden");
        
        // Set up event listeners for this container
        setupContainerEventListeners(container);
    }
    
    // Add to container
    visualizationsContainer.appendChild(newVisualization);
    
    // Hide "Add another" button until this one is generated
    document.getElementById("add-another-container").classList.add("hidden");
    
    // Scroll to the new visualization
    newVisualization.scrollIntoView({ behavior: 'smooth' });
}

// Set up event listeners for a container
function setupContainerEventListeners(container) {
    if (!container) return;
    
    // Next buttons
    container.querySelector('.step1 .next-btn')?.addEventListener('click', function() {
        fetchColumns(this);
    });
    
    container.querySelector('.step2 .next-btn')?.addEventListener('click', function() {
        toggleZAxisDropdown(this);
    });
    
    // Generate button
    container.querySelector('.step3 .generate-btn')?.addEventListener('click', function() {
        generateVisualization(this);
    });
    
    // Back buttons
    container.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const step = this.classList.contains('step2-prev') ? 1 : 
                         this.classList.contains('step3-prev') ? 2 : 
                         this.classList.contains('step4-prev') ? 3 : 1;
            prevStep(this, step);
        });
    });
    
    // Dashboard button
    container.querySelector('.dashboard-btn')?.addEventListener('click', function() {
    const url = this.getAttribute('data-dashboard-url');
    if (url) {
        window.location.href = url;
    } else {
        console.error("Dashboard URL not found");
    }
});
    
    // Remove button
    container.querySelector('.remove-btn')?.addEventListener('click', function() {
        removeVisualization(this);
    });

    container.querySelector('.visType')?.addEventListener('change', function() {
        const zAxisContainer = container.querySelector('.zAxis');
        if (zAxisContainer) {
            zAxisContainer.style.display = this.value === "3d" ? "block" : "none";
            
            // When switching to 2D, clear Z-axis values and reapply filtering
            if (this.value !== "3d") {
                const category = container.querySelector('.category')?.value;
                if (category) {
                    const zAxisDropdowns = [
                        container.querySelector('.cropsForZAxis'),
                        container.querySelector('.otherColumnsForZAxis'),
                        container.querySelector('.generalZAxisDropdown')
                    ];
                    
                    zAxisDropdowns.forEach(dropdown => {
                        if (dropdown) dropdown.value = "";
                    });
                    
                    // Re-filter Y-axis options
                    filterDropdownOptions("yAxis", category);
                }
            }
        }
    });

    // Add change listener for category to reset dependent fields
    container.querySelector('.category')?.addEventListener('change', function() {
        // Reset dependent fields when category changes
        container.querySelectorAll('.yAxis select, .zAxis select').forEach(select => {
            select.value = "";
        });
    });
}
