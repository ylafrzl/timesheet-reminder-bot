require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

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

// Schedule the polls
schedule.scheduleJob('* * * * *', sendPoll);
// schedule.scheduleJob('0 7 * * 1-5', sendPoll);  // 07:00 AM on weekdays
// schedule.scheduleJob('0 20 * * 1-5', sendPoll); // 08:00 PM on weekdays

console.log('Bot is running and sending polls at 07:00 AM and 08:00 PM on weekdays!');
