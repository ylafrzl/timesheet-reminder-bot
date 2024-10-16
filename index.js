require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const http = require('http');
const fs = require('fs');

// Initialize the bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const chatId = process.env.CHAT_ID;

// Store vote counts and voters to prevent duplicate voting
let voteCounts = { done: 0, notDone: 0 };
const voters = new Set();

// Define arrays for random button texts
const doneMessages = [
  "✅ Y",
  "✅ Done",
  "✅ Sudah",
];

const notDoneMessages = [
  "❌ Gak Mau Isi! udah kaya.",
  "❌ Kangen Ditegur",
  "❌ Udah Punya Trigger!",
];

// Function to get a random button text
const getRandomDoneMessage = () => {
  return doneMessages[Math.floor(Math.random() * doneMessages.length)];
};

const getRandomNotDoneMessage = () => {
  return notDoneMessages[Math.floor(Math.random() * notDoneMessages.length)];
};

// Create the voting buttons
const getVoteOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: `${getRandomDoneMessage()} (${voteCounts.done})`, callback_data: 'vote_done' },
        { text: `${getRandomNotDoneMessage()} (${voteCounts.notDone})`, callback_data: 'vote_not_done' },
      ],
    ],
  },
});

// Function to send the poll message with buttons
const sendPoll = () => {
  voteCounts = { done: 0, notDone: 0 };  // Reset counts
  voters.clear();  // Clear previous voters

  bot.sendMessage(chatId, "Apakah sudah isi timesheet hari ini?", getVoteOptions())
    .catch((error) => console.error('Error sending poll:', error));
};

// Handle button clicks
bot.on('callback_query', (callbackQuery) => {
  const { data, from, message } = callbackQuery;
  const userId = from.id;

  // Check if the user has already voted
  if (voters.has(userId)) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Kamu sudah vote!' });
    return;
  }

  voters.add(userId);  // Add user to voters set

  // Update the vote counts based on user selection
  if (data === 'vote_done') voteCounts.done++;
  if (data === 'vote_not_done') voteCounts.notDone++;

  bot.answerCallbackQuery(callbackQuery.id, { text: 'Terima kasih sudah vote!' });

  // Update the buttons with new counts
  bot.editMessageReplyMarkup(getVoteOptions().reply_markup, {
    chat_id: message.chat.id,
    message_id: message.message_id,
  }).catch((error) => console.error('Failed to update buttons:', error));
});

// Create a function to export log messages to JSX
const logToJsx = (message) => {
  const jsxMessage = `
    <div>
      <h2>Log Message</h2>
      <p>${message}</p>
    </div>
  `;
  return jsxMessage;
};

// Create an HTTP server to serve the JSX code
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const jsxMessage = logToJsx('Bot is running and sending polls at 07:00 AM and 08:00 PM on weekdays!');
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Log</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&display=swap">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
          }
          .log-message {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .log-message h2 {
            margin-top: 0;
            color: #333;
          }
          .log-message p {
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="log-message">
          ${jsxMessage}
        </div>
      </body>
    </html>
  `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Schedule the polls
schedule.scheduleJob('* * * * *', sendPoll);
// schedule.scheduleJob('0 7 * * 1-5', sendPoll);  // 07:00 AM on weekdays
// schedule.scheduleJob('0 20 * * 1-5', sendPoll); // 08:00 PM on weekdays