require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const http = require('http');

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

// Array of random messages for the poll question
const pollMessages = [
  "Pagi-pagi minum kopi, Sambil browsing berita hari ini. Jangan lupa update daily, Timesheet harus diisi.",
  "Rapat pagi via Zoom, Diskusi proyek yang menanti. Sebelum pikiran jadi suram, Timesheet segera perbaiki.",
  "Coding sampai sore hari, Debug error tak kunjung selesai. Meski lelah jangan lari, Dari timesheet yang wajib diisi.",
  "Isi Timesheet lu, lagi males pantun gw",
  "Meeting client jam sembilan, Presentasi fitur yang baru. Timesheet jangan diabaikan, Isi dengan detail yang seru.",
  "Makan siang di food court, Sambil cek email yang masuk. Ingat timesheet, jangan kendor, Isi sebelum pulang kantor.",
  "Desain UI yang menarik, Revisi mock-up berkali-kali. Timesheet kosong tidak menarik, Isi sekarang, jangan nanti.",
  "Baca dokumentasi API, Integrasi sistem yang rumit. Timesheet kosong jangan diberi, Isi detailnya, jangan sulit.",
  "Deploy ke server production, Monitoring bug yang mungkin ada. Timesheet itu bukan fiksi, Isi dengan data yang nyata.",
  "Diskusi dengan tim UX, Bahas flow yang lebih baik. Timesheet bukan hal yang kompleks, Isi tiap hari, jangan panik.",
  "Review code pull request, Pastikan kualitas terjaga. Timesheet jangan bikin stress, Isi rutin, tak perlu lega.",
  "Buat laporan mingguan, Rangkum progress yang sudah dibuat. Timesheet bukan beban berat, Isi dengan hati yang tepat.",
  "Perbaiki bug di database, Query yang lambat dioptimasi. Timesheet bukan sekedar base, Tapi bukti dedikasi.",
  "Update status di Jira, Task yang selesai dan on progress. Timesheet bukan hanya citra, Tapi data untuk sukses.",
  "Baca artikel teknologi, Update skill yang relevan. Timesheet cermin produktivitas, Isi dengan penuh ketelitian.",
  "Brainstorming fitur baru, Ide inovatif bermunculan. Timesheet jangan bikin pilu, Isi sesuai pekerjaan.",
  "Setup environment local, Konfigurasi yang rumit. Timesheet bukan hal sepele, Isi detailnya, jangan sakit.",
  "Code review dengan senior, Belajar best practice coding. Timesheet jangan bikin horror, Isi rutin tanpa pending.",
  "Buat unit test yang solid, Pastikan fungsi berjalan baik. Timesheet bukan hal yang rigid, Isi fleksibel, tapi tetap cantik.",
  "Diskusi arsitektur sistem, Rancang solusi yang scalable. Timesheet bukan antagonisme, Tapi alat ukur yang reliable.",
  "Troubleshoot error di staging, Cari akar masalah yang tersembunyi. Timesheet jangan bikin pusing, Isi dengan hati yang jernih.",
  "Buat dokumentasi API, Pastikan developer lain paham. Timesheet bukan birokratis, Tapi alat bantu yang tangguh.",
  "Optimize query database, Tingkatkan performa aplikasi. Timesheet bukan sekedar base, Tapi cermin dedikasi.",
  "Implementasi fitur security, Lindungi data dari serangan. Timesheet bukan formalitas, Tapi bukti pengorbanan.",
  "Rapat review sprint kemarin, Evaluasi pencapaian tim. Timesheet jangan bikin kerin, Isi dengan data yang intim.",
  "Buat wireframe prototype, Visualisasi ide produk. Timesheet bukan stereotype, Tapi data yang mendukung.",
  "Investigasi bug report, Analisis log dan reproduksi. Timesheet bukan hal yang distort, Tapi fakta kontribusi.",
  "Setup continuous integration, Otomasi proses deployment. Timesheet bukan komplikasi, Tapi alat manajemen.",
  "Optimasi performa frontend, Kurangi waktu loading page. Timesheet jangan jadi beban, Isi rutin tanpa rage.",
  "Migrasi data ke sistem baru, Pastikan integritas terjaga. Timesheet bukan hal yang tabu, Tapi kewajiban berharga.",
  "Implementasi caching strategy, Tingkatkan respons aplikasi. Timesheet cermin strategi, Isi dengan penuh apresiasi.",
  "Code refactoring legacy system, Tingkatkan maintainability. Timesheet bukan antagonisme, Tapi bukti produktivitas.",
  "Buat user guide aplikasi, Panduan untuk end-user. Timesheet jangan diabaisi, Isi tiap hari tanpa blur.",
  "Implementasi multithreading, Optimalkan resource CPU. Timesheet bukan hal menyebalkan, Tapi data yang selalu ditunggu.",
  "Setup monitoring dan alerting, Pantau health check sistem. Timesheet jangan bikin pusing, Isi rutin tanpa pesimis.",
  "Buat presentation deck, Untuk meeting dengan stakeholder. Timesheet jangan bikin gerek, Isi dengan data yang fair.",
  "Implementasi design pattern, Tingkatkan kualitas kode. Timesheet bukan beban, Tapi alat ukur yang oke.",
  "Analisis competitor product, Cari inspirasi improvement. Timesheet jangan bikin stuck, Isi dengan penuh komitmen.",
  "Setup load balancer, Distribusi traffic yang merata. Timesheet bukan hal aneh, Tapi standar kerja nyata.",
  "Implementasi internasionalisasi, Dukung multi bahasa di aplikasi. Timesheet bukan birokrasi, Tapi bukti partisipasi.",
  "Buat technical documentation, Panduan untuk developer baru. Timesheet bukan komplikasi, Tapi data yang selalu ditunggu.",
  "Optimasi query Elasticsearch, Tingkatkan performa pencarian. Timesheet jangan bikin stress, Isi rutin tanpa keraguan.",
  "Implementasi rate limiting, Lindungi API dari abuse. Timesheet bukan hal menyebalkan, Tapi data yang harus disajikan.",
  "Setup disaster recovery, Antisipasi worst case scenario. Timesheet jangan jadi mystery, Isi dengan detail yang pro.",
  "Buat regression test suite, Pastikan fitur lama tetap jalan. Timesheet bukan beban yang berat, Tapi kewajiban harian.",
  "Implementasi single sign-on, Tingkatkan user experience. Timesheet jangan bikin bengong, Isi dengan penuh confidence.",
  "Analisis root cause problem, Investigasi insiden production. Timesheet bukan hal yang random, Tapi cermin dari action.",
  "Setup A/B testing framework, Uji efektivitas fitur baru. Timesheet jangan bikin letih, Isi tiap hari tanpa ragu.",
  "Implementasi microservices, Pisahkan modul yang kompleks. Timesheet jangan bikin main-main, Tapi data yang harus direspek.",
  "Buat capacity planning, Antisipasi lonjakan traffic. Timesheet jangan bikin pening, Isi rutin tanpa taktik.",
  "Implementasi GraphQL API, Optimalkan network request. Timesheet bukan teori, Tapi praktek yang harus di-manifest.",
  "Setup kubernetes cluster, Orkestrasi container yang efisien. Timesheet jangan bikin frustasi, Isi dengan data yang konsisten.",
  "Implementasi real-time features, Dengan WebSocket atau Server-Sent Events. Timesheet jangan bikin frustasi, Isi dengan data yang konsisten.",
  "Optimasi bundle size frontend, Kurangi waktu load aplikasi. Timesheet jangan bikin bingung, Isi rutin penuh dedikasi.",
  "Implementasi CI/CD pipeline, Otomasi proses delivery. Timesheet bukan deadline, Tapi alat ukur yang friendly.",
  "Buat technical design document, Rancang solusi yang scalable. Timesheet jangan jadi beban berat, Isi dengan data yang reliable.",
  "Setup monitoring dashboard, Visualisasi metrik penting. Timesheet jangan diabaikan, Isi tiap hari tanpa pending.",
  "Implementasi authentication JWT, Amankan akses ke API. Timesheet bukan hal yang rumit, Tapi kewajiban yang harus diakui.",
  "Optimasi database indexing, Tingkatkan kecepatan query. Timesheet jangan bikin pusing, Isi rutin tanpa berhenti.",
  "Implementasi service worker, Dukung offline functionality. Timesheet bukan beban besar, Tapi bukti produktivitas.",
  "Buat data migration script, Pindahkan data ke struktur baru. Timesheet jangan bikin sulit, Isi dengan detail yang seru.",
  "Setup message queue system, Pisahkan proses yang time-consuming. Timesheet bukan antagonisme, Tapi alat manajemen yang penting.",
  "Implementasi rate limiting, Lindungi sistem dari overload. Timesheet jangan bikin bingung, Isi rut in, jangan diboikot.",
  "Optimasi lazy loading module, Tingkatkan initial load time. Timesheet bukan hal yang fool, Tapi cermin kerja yang sublime.",
  "Implementasi distributed caching, Tingkatkan skalabilitas sistem. Timesheet jangan bikin pusing, Isi dengan data yang optimis.",
  "Buat API documentation, Panduan untuk integrasi. Timesheet bukan komplikasi, Tapi standar operasi.",
  "Setup log aggregation, Centralisasi log dari berbagai service. Timesheet jangan jadi beban, Isi rutin dengan penuh service.",
  "Implementasi content delivery network, Optimalkan delivery static asset. Timesheet bukan hal yang mengganggu, Tapi data yang harus di-submit.",
  "Buat disaster recovery plan, Antisipasi worst case scenario. Timesheet jangan bikin minder, Isi dengan detail yang pro.",
  "Implementasi database sharding, Tingkatkan performa dan skalabilitas. Timesheet jangan bikin bimbang, Isi rutin penuh integritas.",
  "Optimasi image processing, Kurangi ukuran tanpa turunkan kualitas. Timesheet jangan bikin stress, Isi tiap hari dengan kapasitas.",
  "Setup blue-green deployment, Minimalisir downtime saat rilis. Timesheet bukan penghalang, Tapi alat ukur yang presisi.",
  "Implementasi data encryption, Amankan data sensitif user. Timesheet bukan beban, Tapi kewajiban yang harus diatur.",
  "Buat performance benchmark, Ukur baseline performa sistem. Timesheet jangan bikin jenuh, Isi rutin dengan optimisme.",
  "Implementasi websocket, Dukung komunikasi real-time. Timesheet jangan jadi beban berat, Isi tiap hari tanpa overtime.",
  "Optimasi database query, Tingkatkan response time API. Timesheet bukan teori, Tapi praktek yang harus diakui.",
  "Setup infrastructure as code, Otomasi provisioning infrastruktur. Timesheet jangan bikin depresi, Isi dengan data yang terstruktur.",
  "Implementasi feature flags, Kontrol rilis fitur dengan fleksibel. Timesheet jangan bikin malas, Isi rutin, jangan sampai terlambat.",
  "Buat security penetration test, Identifikasi celah keamanan. Timesheet jangan jadi beban berat, Isi dengan penuh keyakinan.",
  "Implementasi full-text search, Tingkatkan pengalaman pencarian user. Timesheet jangan bikin stress, Isi tiap hari tanpa kabur.",
  "Optimasi server-side rendering, Tingkatkan SEO dan initial load. Timesheet jangan bikin bingung, Isi rutin tanpa overload.",
  "Setup continuous profiling, Pantau performa aplikasi real-time. Timesheet jangan bikin pusing, Isi dengan data yang sublime.",
  "Implementasi rate limiting, Lindungi API dari abuse. Timesheet bukan hal yang menyebalkan, Tapi bukti kerja yang serius.",
  "Buat load testing scenario, Uji kapasitas sistem under stress. Timesheet jangan jadi beban, Isi rutin dengan progres.",
  "Implementasi serverless function, Optimalkan resource dan biaya. Timesheet bukan beban, Tapi data yang selalu dinanti.",
  "Optimasi database connection pool, Tingkatkan throughput sistem. Timesheet jangan bikin repot, Isi dengan data yang realistis."
];

// Function to get a random button text
const getRandomDoneMessage = () => {
  return doneMessages[Math.floor(Math.random() * doneMessages.length)];
};

const getRandomNotDoneMessage = () => {
  return notDoneMessages[Math.floor(Math.random() * notDoneMessages.length)];
};

// Function to get a random poll message
const getRandomPollMessage = () => {
  return pollMessages[Math.floor(Math.random() * pollMessages.length)];
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

  const pollMessage = getRandomPollMessage();  // Get a random poll message

  bot.sendMessage(chatId, pollMessage, getVoteOptions())
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
schedule.scheduleJob('0 7 * * 1-5', sendPoll);  // 07:00 AM on weekdays
schedule.scheduleJob('0 20 * * 1-5', sendPoll); // 08:00 PM on weekdays

const logMessage = 'Bot is running and sending polls at 07:00 AM and 08:00 PM on weekdays!';
console.log(logMessage);

const sendLogMessage = () => {
  const logRequest = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, (res) => {
    console.log(`Log message sent to index.js: ${res.statusCode}`);
  });

  logRequest.write(JSON.stringify({ message: logMessage }));
  logRequest.end();
};

// Wait for 5 seconds before sending the log message
setTimeout(sendLogMessage, 5000);
