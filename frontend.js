let profitLossChart; // Declare a variable to hold the chart instance

// Event listener for the button click
document.getElementById('generateBtn').addEventListener('click', function () {
    // Get input values from the user
    const tradePerDay = parseInt(document.querySelector("#tradePerDay").value);
    const ndtpc = parseInt(document.querySelector("#ndtpc").value);
    const tradeAmount = parseFloat(document.querySelector("#tradeAmount").value);
    const riskReward = parseFloat(document.querySelector("#riskReward").value);
    const chancePercent = parseFloat(document.querySelector("#chancePercent").value);
    const chargesPerTrade = parseFloat(document.querySelector("#chargesPerTrade").value);

    // Prepare the data to send to the backend
    const data = {
        tradePerDay,
        ndtpc,
        tradeAmount,
        riskReward,
        chancePercent,
        chargesPerTrade
    };

    // Encryption key (this should be secret and securely stored)
    const encryptionKey = "Shivam"; // Replace with a secure key

    // Encrypt the data using AES
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();

    // Request data from the backend
    fetch('https://tca-server-3kvr.onrender.com/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedData }) // Send the encrypted data
    })
    .then(response => response.json())
    .then(encryptedResult => {
        // Decrypt the received data
        const decryptedData = CryptoJS.AES.decrypt(encryptedResult.encryptedData, encryptionKey);
        const result = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));

        // console.log(result); // Log the result for debugging

        // Display random trades and net profit/loss values
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <h3>Total P&L: ${result.totalNetProfitLoss.toFixed(2)}</h3>
            <h3>Days in Profit: ${result.daysInProfit}</h3>
            <h3>Days in Loss: ${result.daysInLoss}</h3>
            <h3>Days in Break-Even: ${result.daysInBreakEven}</h3>
        `;

        // Update the chart with net profit/loss values
        plotProfitLossChart(result.netProfitLossValues);

        // Display generated trades below the chart
        const tradesDiv = document.getElementById('trades');
        tradesDiv.innerHTML = '<h3>Generated Trades:</h3>';

        for (let day = 0; day < result.ndtpc; day++) {
            const dayTradeList = document.createElement('ul');
            dayTradeList.innerHTML = `<strong>Day ${day + 1}:</strong> ${result.generatedTrades[day].join(', ')}`;
            tradesDiv.appendChild(dayTradeList);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        document.getElementById('results').innerHTML = 'Error retrieving data.';
    });
});

// Function to plot the profit/loss chart using Chart.js
function plotProfitLossChart(profitLossArray) {
    const ctx = document.getElementById('profitLossChart').getContext('2d');

    // Destroy the previous chart if it exists
    if (profitLossChart) {
        profitLossChart.destroy();
    }

    const chartData = {
        labels: Array.from({ length: profitLossArray.length }, (_, i) => `Day ${i + 1}`),
        datasets: [{
            label: 'Net Profit/Loss',
            data: profitLossArray,
            fill: true,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
        }]
    };

    // Create a new chart
    profitLossChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Net Profit/Loss'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
}
