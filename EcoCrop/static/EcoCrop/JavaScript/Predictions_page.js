// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add first visualization
    displayCategoryButtons();

    // Set up event listeners
    // document.getElementById('addAnotherPredictionButton')?.addEventListener('click', addAnotherPrediction);
});
//     // Set up event delegation for all toggle buttons
//     .addEventListener('click', (e) => {
//     const containerButtons = [
//         'tradeButton',
//         'productionAndYieldButton',
//         'productionAndYieldWithClimateIndexButton',
//         'climateIndexButton'
//     ];
//     if (containerButtons.some(btnClass => e.target.classList.contains(btnClass))) {

//         // Find the closest parent container
//         const container = e.target.closest('div[class$="Container"]');

//         nextStep(container);
//     }

//     if (e.target.classList.contains('importsButton') ||
//         e.target.classList.contains('exportsButton')) {

//         const group = e.target.dataset.optionGroup;
//         if (!group) return;

//         // Get all buttons in the same option group
//         const allButtons = document.querySelectorAll(`[data-option-group="${group}"]`);

//         // Toggle active state
//         allButtons.forEach(btn => {
//             btn.classList.remove('active'); // Remove from all
//         });
//         e.target.classList.add('active'); // Add to clicked
//     }
// });
// });

// function nextStep(container) {
//     if (container.classList.contains("tradeContainer")) {
//         // Toggle all hidden elements within this container
//         if (container) {
//             container.querySelectorAll('.hidden').forEach(el => {
//                 if (!el.classList.contains("tradeButton")) {
//                     el.classList.toggle('hidden');
//                 }
//             });
//         }
//     }

//     if (container.classList.contains("productionAndYieldContainer")) {
//         if (container) {
//             container.querySelectorAll('.hidden').forEach(el => {
//                 el.classList.toggle('hidden');
//             });
//         }
//     }

//     if (container.classList.contains("productionAndYieldWithClimateIndexContainer")) {
//         if (container) {
//             container.querySelectorAll('.hidden').forEach(el => {
//                 el.classList.toggle('hidden');
//             });
//         }
//     }

//     if (container.classList.contains("climateIndexContainer")) {
//         if (container) {
//             container.querySelectorAll('.hidden').forEach(el => {
//                 el.classList.toggle('hidden');
//             });
//         }
//     }
// }

function displayCategoryButtons() {
    document.querySelector(".categoryButtons").classList.remove("hidden");
    document.body.addEventListener('click', async (e) => {

        const categories = [
            ["tradeButton", "tradeContainer"],
            ["productionAndYieldButton", "productionAndYieldContainer"],
            ["productionAndYieldWithClimateIndexButton", "productionAndYieldWithClimateIndexContainer"],
            ["climateIndexButton", "climateIndexContainer"]
        ];

        let container = null;

        categories.forEach(category => {
            if (e.target.classList.contains(category[0])) {
                container = document.querySelector(`.${category[1]}`)
            }
        })

        document.querySelector(".categoryButtons").classList.add("hidden");

        if (container) {
            container.querySelectorAll('.hidden').forEach(el => {
                if (!el.classList.contains("tradeButton")) {
                    el.classList.toggle('hidden');
                }
            });
        }

        fetchCropsandRegions(container);
    })
}

async function fetchCropsandRegions(container) {
    if (container.classList.contains("tradeContainer") || container.classList.contains("climateIndexContainer")) {
        const containerClass = Array.from(container.classList).find(className =>
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
                console.log("Received data: ", data)
            } else {
                alert("Error fetching data: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            alert("Network error occurred. Please try again.");
        }
    } else {
        const containerClass = Array.from(container.classList).find(className =>
            className.endsWith('Container'));
        const parts = containerClass.split(/(?=Container)/);
        console.log(typeof containerClass);
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
                console.log("Received data: ", data)
            } else {
                alert("Error fetching data: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            alert("Network error occurred. Please try again.");
        }
    }
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

// function addAnotherPrediction() {
//     const visualizationsContainer = document.getElementById("predictions-container");
//     const template = document.getElementById("prediction-template");
// }