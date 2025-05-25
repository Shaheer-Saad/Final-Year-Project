document.querySelector('.addTestVisualizationButton')?.addEventListener('click', addTestVisualization);

async function addTestVisualization() {
    const formData = { type: 'climateIndex', region: 'Balochistan', regionId: '0', months: '6' };
    const addTestVisualizationButton = document.querySelector('.addTestVisualizationButton');

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

        if (data.success) {
            testVisualizationContainer = document.querySelector('.testVisualizationContainer');
            testVisualizationContainer.innerHTML = data.plot_html;
            const scripts = testVisualizationContainer.getElementsByTagName('script');
            console.log("Scripts: ", scripts);
            for (let i = 0; i < scripts.length; i++) {
                try {
                    eval(scripts[i].innerText);
                    console.log("Done executing plot script");
                } catch (e) {
                    console.error("Error executing plot script:", e);
                }
            }
        } else {
            alert("Prediction failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        alert("Network error: " + error.message);
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