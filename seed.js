const db = require('./db.js');
const { insertLivestreamData } = require('./queries.js');

// Function to generate a random number within a range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random superchat data
function generateRandomSuperchatData(videoId) {
  const superchatId = Math.random().toString(36).substr(2, 9);
  const channelId = Math.random().toString(36).substr(2, 9);
  const amount = getRandomNumber(1, 100);
  const currency = 'USD';

  return {
    superchatId,
    videoId,
    channelId,
    amount,
    currency,
  };
}

async function seed() {
  try {
    // Generate example livestream data
    const livestreamData = {
      videoId: '123456789',
      title: 'Example Livestream',
      startTime: new Date(),
      endTime: new Date(),
    };

    // Generate example superchat data
    const superchatData = [];
    for (let i = 0; i < 10; i++) {
      superchatData.push(generateRandomSuperchatData(livestreamData.videoId));
    }

    // Insert the example data
    await insertLivestreamData({
      ...livestreamData,
      superchatData,
    });

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to insert seed data:', error);
    process.exit(1);
  }
}

// Connect to the database and run the seed function
db.connect()
  .then(() => {
    seed();
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });
