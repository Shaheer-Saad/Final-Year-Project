// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add first visualization
    addAnotherPrediction();

    // Set up event listeners
    document.getElementById('addAnotherPredictionButton')?.addEventListener('click', addAnotherPrediction);
});

function addAnotherPrediction() {
    const predictionsContainer = document.querySelector('.predictionsContainer');
    const template = document.getElementById('predictionTemplate');

    if (!predictionsContainer || !template) return;

    // Clone the template
    const newPrediction = template.cloneNode(true);
    newPrediction.id = ''; // Remove ID from clone
    newPrediction.classList.remove('hidden');

    // Add to container
    predictionsContainer.appendChild(newPrediction);

    // Set up event listeners for this specific prediction
    setupEventListeners(newPrediction);

    // Hide "Add another" button until this one is complete
    document.querySelector('.addAnotherPredictionButtonContainer').classList.add('hidden');
}

function setupEventListeners(container = document) {
    const categoryButtons = container.querySelector('.categoryButtons');
    if (categoryButtons) categoryButtons.classList.remove('hidden');

    const buttons = [
        'tradeButton',
        'productionAndYieldButton',
        'productionAndYieldWithClimateIndexButton',
        'climateIndexButton'
    ].map(btn => container.querySelector(`.${btn}`));

    buttons.forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => displayCategoryButtons(e, container));
        }
    });

    container.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-option-group')) {
            e.preventDefault();
            const group = e.target.getAttribute('data-option-group');
            container.querySelectorAll(`[data-option-group="${group}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
        }

        if (e.target.classList.contains('cropsDropdownTrigger')) {
            e.preventDefault();
            const dropdown = e.target.closest('.cropsDropdownContainer');
            dropdown.querySelector('.cropsDropdownContent').classList.toggle('hidden');
        }

        if (e.target.classList.contains('regionsDropdownTrigger')) {
            e.preventDefault();
            const dropdown = e.target.closest('.regionsDropdownContainer');
            dropdown.querySelector('.regionsDropdownContent').classList.toggle('hidden');
        }

        if (!e.target.closest('.cropsDropdownContainer')) {
            document.querySelectorAll('.cropsDropdownContent').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }

        if (!e.target.closest('.regionsDropdownContainer')) {
            document.querySelectorAll('.regionsDropdownContent').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }
    });

    container.querySelectorAll('.predictionForm').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = collectFormData(this);
            if (validateFormData(this, formData)) {
                submitPrediction(this, formData, container);
            }
        });
    });

    const backButton = container.querySelector('.backButton');
    if (backButton) {
        backButton.addEventListener('click', (e) => handleBackButton(e, container));
    }
}

function displayCategoryButtons(e, container) {
    const categories = [
        ["tradeButton", "tradeContainer"],
        ["productionAndYieldButton", "productionAndYieldContainer"],
        ["productionAndYieldWithClimateIndexButton", "productionAndYieldWithClimateIndexContainer"],
        ["climateIndexButton", "climateIndexContainer"]
    ];

    // Hide all containers in this prediction
    categories.forEach(category => {
        container.querySelector(`.${category[1]}`).classList.add('hidden');
    })

    // Show selected container
    const selectedCategory = categories.find(category => e.target.classList.contains(category[0]));
    console.log("Selected category: ", selectedCategory);
    if (selectedCategory) {
        const targetContainer = container.querySelector(`.${selectedCategory[1]}`);
        console.log("Target container: ", targetContainer);
        if (targetContainer) {
            targetContainer.classList.remove('hidden');
            container.querySelector('.categoryButtons').classList.add('hidden');

            // Show back button for this prediction
            const backButton = container.querySelector('.backButton');
            if (backButton) backButton.classList.remove('hidden');

            fetchCropsandRegions(container, targetContainer);
        }
    }
}

function handleBackButton(e, container) {
    // Hide all forms
    const containers = [
        "tradeContainer",
        "productionAndYieldContainer",
        "productionAndYieldWithClimateIndexContainer",
        "climateIndexContainer"
    ];

    containers.forEach(containerClass => {
        const formContainer = container.querySelector(`.${containerClass}`);
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
    });

    container.querySelectorAll('.predictionForm').forEach(form => {
        form.classList.remove('hidden');
    });

    // Remove the prediction result
    const existingResult = container.querySelector('.predictionResult');
    if (existingResult) {
        existingResult.remove();
    }

    // Hide back button and show categories
    e.target.classList.add('hidden');

    // Show category buttons again
    container.querySelector(".categoryButtons").classList.remove("hidden");
}

async function fetchCropsandRegions(container, targetContainer) {
    //targetContainer = container.querySelector(`.${targetContainer}`)
    const containerClass = Array.from(targetContainer.classList).find(className =>
        className.endsWith('Container'));
    const parts = containerClass.split(/(?=Container)/);
    let requestData = {
        category: parts[0]
    }
    try {
        const response = await fetch("API/Fetch_crops_and_regions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(requestData)
        });
        const data = await response.json();
        if (data.success) {
            console.log("Received data: ", data);
            populateDropdowns(container, targetContainer, data);
        } else {
            alert("Error fetching data: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        alert("Network error occurred. Please try again.");
    }
}

function populateDropdowns(container, targetContainer, data) {
    if ((targetContainer.classList.contains("tradeContainer")) || targetContainer.classList.contains("productionAndYieldContainer") || targetContainer.classList.contains("productionAndYieldWithClimateIndexContainer")) {
        const cropsDropdownList = targetContainer.querySelector('.cropsDropdownList');
        if (cropsDropdownList && data.crops) {
            cropsDropdownList.innerHTML = ''; // Clear existing options

            // Add new options
            data.crops.forEach(crop => {
                const option = document.createElement('div');
                option.className = 'crop-option';
                option.textContent = crop.name;
                option.dataset.value = crop.id;
                option.addEventListener('click', () => {
                    // Update selected crop display
                    const trigger = targetContainer.querySelector('.cropsDropdownTrigger');
                    if (trigger) {
                        trigger.textContent = crop.name;
                        trigger.dataset.value = crop.id;
                        container.querySelectorAll('.cropsDropdownContent').forEach(dropdown => {
                            dropdown.classList.add('hidden');
                        });
                    }
                });
                cropsDropdownList.appendChild(option);
            });
        }
    }

    if (targetContainer.classList.contains("productionAndYieldContainer")) {
        const regionsDropdownList = targetContainer.querySelector('.regionsDropdownList');
        if (regionsDropdownList && data.regions) {
            regionsDropdownList.innerHTML = ''; // Clear existing options

            // Add new options
            data.regions.forEach(region => {
                const option = document.createElement('div');
                option.className = 'region-option';
                option.textContent = region.name;
                option.dataset.value = region.id;
                option.addEventListener('click', () => {
                    // Update selected region display
                    const trigger = targetContainer.querySelector('.regionsDropdownTrigger');
                    if (trigger) {
                        trigger.textContent = region.name;
                        trigger.dataset.value = region.id;
                        container.querySelectorAll('.regionsDropdownContent').forEach(dropdown => {
                            dropdown.classList.add('hidden');
                        });
                    }
                });
                regionsDropdownList.appendChild(option);
            });
        }
    }

    if (targetContainer.classList.contains("productionAndYieldWithClimateIndexContainer")) {
        const regionsDropdownList = targetContainer.querySelector('.regionsDropdownList');
        if (regionsDropdownList && data.regions) {
            regionsDropdownList.innerHTML = ''; // Clear existing options

            // Add new options
            data.regions.forEach(region => {
                const option = document.createElement('div');
                option.className = 'region-option';
                option.textContent = region.name;
                option.dataset.value = region.id;
                option.addEventListener('click', () => {
                    // Update selected region display
                    const trigger = targetContainer.querySelector('.regionsDropdownTrigger');
                    if (trigger) {
                        trigger.textContent = region.name;
                        trigger.dataset.value = region.id;
                        container.querySelectorAll('.regionsDropdownContent').forEach(dropdown => {
                            dropdown.classList.add('hidden');
                        });
                    }
                });
                regionsDropdownList.appendChild(option);
            });
        }
    }

    if (targetContainer.classList.contains("climateIndexContainer")) {
        const regionsDropdownList = targetContainer.querySelector('.regionsDropdownList');
        if (regionsDropdownList && data.regions) {
            regionsDropdownList.innerHTML = ''; // Clear existing options

            // Add new options
            data.regions.forEach(region => {
                const option = document.createElement('div');
                option.className = 'region-option';
                option.textContent = region.name;
                option.dataset.value = region.id;
                option.addEventListener('click', () => {
                    // Update selected region display
                    const trigger = targetContainer.querySelector('.regionsDropdownTrigger');
                    if (trigger) {
                        trigger.textContent = region.name;
                        trigger.dataset.value = region.id;
                        container.querySelectorAll('.regionsDropdownContent').forEach(dropdown => {
                            dropdown.classList.add('hidden');
                        });
                    }
                });
                regionsDropdownList.appendChild(option);
            });
        }
    }
}

function collectFormData(form) {
    const formType = form.dataset.type;
    const formData = { type: formType };

    switch (formType) {
        case 'trade':
            const activeTradeType = form.querySelector('[data-option-group="trade-type"].active');

            if (!activeTradeType) {
                alert("Please select either Imports or Exports");
                return null;
            }

            formData.tradeType = activeTradeType.textContent.trim();
            formData.cropId = form.querySelector('.cropsDropdownTrigger').dataset.value;
            formData.production = form.querySelector('.productionInput').value;
            break;

        case 'productionAndYield':
            const activeProductionType = form.querySelector('[data-option-group="production-type"].active');

            if (!activeProductionType) {
                alert("Please select either Production or Yield");
                return null;
            }

            formData.productionType = activeProductionType.textContent.trim();
            formData.cropId = form.querySelector('.cropsDropdownTrigger').dataset.value;
            formData.regionId = form.querySelector('.regionsDropdownTrigger').dataset.value;
            formData.area = form.querySelector('.areaInput').value;
            break;

        case 'productionAndYieldWithClimateIndex':
            const activeProductionTypeWithClimate = form.querySelector('[data-option-group="production-type"].active');

            if (!activeProductionTypeWithClimate) {
                alert("Please select either Production or Yield");
                return null;
            }

            formData.productionType = activeProductionTypeWithClimate.textContent.trim();
            formData.cropId = form.querySelector('.cropsDropdownTrigger').dataset.value;
            formData.regionId = form.querySelector('.regionsDropdownTrigger').dataset.value;
            formData.area = form.querySelector('.areaInput').value;
            formData.climateIndex = form.querySelector('.climateIndexInput').value;
            break;

        case 'climateIndex':
            formData.regionId = form.querySelector('.regionsDropdownTrigger').dataset.value;
            formData.months = form.querySelector('.monthsInput').value;
            break;
    }

    return formData;
}

function validateFormData(form, formData) {
    switch (formData.type) {
        case 'trade':
            console.log("Form data: ", formData);
            if (!formData.tradeType || !formData.cropId || !formData.production) {
                alert("Please fill all trade prediction fields");
                return false;
            }
            break;

        case 'productionAndYield':
            console.log("Form data: ", formData);
            if (!formData.cropId || !formData.regionId || !formData.area) {
                alert("Please fill all production and yield fields");
                return false;
            }
            break;

        case 'productionAndYieldWithClimateIndex':
            console.log("Form data: ", formData);
            if (!formData.cropId || !formData.regionId || !formData.area || !formData.climateIndex) {
                alert("Please fill all production and yield with climate index fields");
                return false;
            }
            break;

        case 'climateIndex':
            console.log("Form data: ", formData);
            if (!formData.regionId || !formData.months) {
                alert("Please fill all climate index fields");
                return false;
            }
            break;
    }

    return true;
}

async function submitPrediction(form, formData, container) {
    // Show loading state for this specific prediction
    const generateBtn = container.querySelector('.generateButton');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = "Generating...";
    generateBtn.disabled = true;

    try {
        const response = await fetch("API/Generate_prediction", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        generateBtn.textContent = originalText;
        generateBtn.disabled = false;

        if (data.success) {
            displayPredictionResult(form, data, container);
        } else {
            alert("Prediction failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        alert("Network error: " + error.message);
    }
}

function displayPredictionResult(form, data, container) {
    // Remove any existing result display
    const existingResult = container.querySelector('.predictionResult');
    if (existingResult) {
        existingResult.remove();
    }

    // Hide the form
    form.classList.add('hidden');

    // Ensure back button is visible
    const backButton = container.querySelector('.backButton');
    if (backButton) {
        backButton.classList.remove('hidden');
    }

    // Create a container for the results
    const resultContainer = document.createElement('div');
    resultContainer.className = 'predictionResult';

    // Create a title based on the prediction type
    const title = document.createElement('h3');
    title.textContent = `Prediction Results for ${data.category[1] || data.category[0]}`;
    resultContainer.appendChild(title);

    // Handle different prediction types
    if (data.category[0] === 'trade') {
        console.log("Category: ", data.category);
        console.log("Prediction: ", data.prediction);
        const resultText = document.createElement('p');
        resultText.textContent = `Predicted ${data.category[1].toLowerCase()}: ${data.prediction[0].toFixed(2)} tons`;
        resultContainer.appendChild(resultText);
    }
    else if (data.category[0] === 'productionAndYield') {
        const resultText = document.createElement('p');
        const unit = data.category[1] === 'Production' ? 'tons' : 'tons per acre';
        resultText.textContent = `Predicted ${data.category[1].toLowerCase()}: ${data.prediction[0].toFixed(2)} ${unit}`;
        resultContainer.appendChild(resultText);
    }
    else if (data.category[0] === 'productionAndYieldWithClimateIndex') {
        const resultText = document.createElement('p');
        const unit = data.category[1] === 'Production' ? 'tons' : 'tons per acre';
        resultText.textContent = `Predicted ${data.category[1].toLowerCase()}: ${data.prediction[0].toFixed(2)} ${unit}`;
        resultContainer.appendChild(resultText);

        const climateNote = document.createElement('p');
        climateNote.textContent = `(with climate index factor: ${data.climateIndex})`;
        climateNote.style.fontStyle = 'italic';
        resultContainer.appendChild(climateNote);
    }
    else if (data.category[0] === 'climateIndex') {
        const resultTitle = document.createElement('h4');
        resultTitle.textContent = 'Climate Index Forecast:';
        resultContainer.appendChild(resultTitle);

        const forecastList = document.createElement('ul');
        forecastList.style.listStyleType = 'none';
        forecastList.style.padding = '0';

        data.prediction.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item[0]}: ${item[1]}`;
            forecastList.appendChild(listItem);
        });

        resultContainer.appendChild(forecastList);
    }

    // Add some basic styling
    resultContainer.style.marginTop = '20px';
    resultContainer.style.padding = '15px';
    resultContainer.style.border = '1px solid #4CAF50';
    resultContainer.style.borderRadius = '5px';
    resultContainer.style.backgroundColor = '#f8f8f8';

    console.log("Form: ", form);

    // Insert the result after the form
    const parentDiv = form.parentNode;
    console.log("Parent container: ", parentDiv);
    form.parentNode.insertBefore(resultContainer, form.nextSibling);

    // Show "Add another" button
    document.querySelector('.addAnotherPredictionButtonContainer').classList.remove('hidden');
}

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