const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const CryptoJS = require('crypto-js'); // Import CryptoJS

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const encryptionKey = "Shivam"; // Use the same key for encryption and decryption

app.post('/api/generate', (req, res) => {
    // Decrypt the received data
    const bytes = CryptoJS.AES.decrypt(req.body.encryptedData, encryptionKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Get input values from the decrypted data
    const { tradePerDay, ndtpc, tradeAmount, riskReward, chancePercent, chargesPerTrade } = decryptedData;

    // Initialize variables to hold results
    const generatedTrades = [];
    const netProfitLossValues = [];
    let netProfitLoss = 0;
    let daysInProfit = 0;
    let daysInLoss = 0;
    let daysInBreakEven = 0;

    // Generate random trades and calculate net profit/loss
    for (let day = 0; day < ndtpc; day++) {
        let dailyProfitLoss = 0;
        const dailyTrades = [];

        for (let trade = 0; trade < tradePerDay; trade++) {
            const randomOutcome = Math.random() * 100; // Generate a random number between 0 and 100

            if (randomOutcome < chancePercent) {  // Check if it's a win based on chance percent
                const winAmount = tradeAmount * riskReward;
                dailyProfitLoss += winAmount;
                dailyTrades.push('Profit');
            } else {
                const lossAmount = tradeAmount;
                dailyProfitLoss -= lossAmount;
                dailyTrades.push('Loss');
            }
        }

        // Deduct charges per trade from daily profit/loss
        dailyProfitLoss -= chargesPerTrade * tradePerDay;

        // Update net profit/loss for the total
        netProfitLoss += dailyProfitLoss;
        netProfitLossValues.push(netProfitLoss); // Store the cumulative net profit/loss

        // Update the counters for days in profit/loss/break-even
        if (dailyProfitLoss > 0) {
            daysInProfit++;
        } else if (dailyProfitLoss < 0) {
            daysInLoss++;
        } else {
            daysInBreakEven++;
        }

        generatedTrades.push(dailyTrades);
    }

    // Prepare the result
    const result = {
        generatedTrades,
        netProfitLossValues,
        totalNetProfitLoss: netProfitLoss,
        daysInProfit,
        daysInLoss,
        daysInBreakEven,
        ndtpc
    };

    // Encrypt the result before sending it back
    const encryptedResult = CryptoJS.AES.encrypt(JSON.stringify(result), encryptionKey).toString();

    // Send the encrypted result back
    res.json({ encryptedData: encryptedResult });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
