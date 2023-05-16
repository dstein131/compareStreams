let charts = [];

function onClientLoad() {
    gapi.load('client', initClient);
}

let video1SuperChatTotal = 0;
let video1TopSuperchatUsers = [];
let video2SuperChatTotal = 0;
let video2TopSuperchatUsers = [];
let video3SuperChatTotal = 0;
let video3TopSuperchatUsers = [];
let video4SuperChatTotal = 0;
let video4TopSuperchatUsers = [];

const videoSuperChatTotals = [];
const videoTopSuperChatUsers = []


let apiKeys = ['AIzaSyASShv8zh_tbj6m4uhcn9olHBZCihKABXQ', 'AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc', 'AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM', 'AIzaSyBWvu_9YTf9KPdiBcDh1rewr0Fo6IJAp14'];
let currentIndex = 0;

function getNextApiKey() {
    let key = apiKeys[currentIndex];
    currentIndex = (currentIndex + 1) % apiKeys.length; // cycle through array
    return key;
}

let activeVideoIds = []; // Make this a global variable

function initClient() {
    gapi.client.init({
        apiKey: getNextApiKey(),
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(() => {
        document.getElementById('video-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const videoIds = [
                document.getElementById('video-id-1').value,
                document.getElementById('video-id-2').value,
                document.getElementById('video-id-3').value,
                document.getElementById('video-id-4').value,
            ];

            activeVideoIds = videoIds.filter(id => id !== ''); // Assign to the global variable here
            console.log(activeVideoIds); // Add this line after assigning activeVideoIds in the initClient() function

            if (activeVideoIds.length >= 2) {
                compareLiveStreams(activeVideoIds);
                this.classList.add('d-none');
                document.getElementById('reset-btn').classList.remove('d-none');
            }
        });
    }).catch(error => {
        console.error('Error initializing YouTube Data API:', error);
        if (currentIndex < apiKeys.length - 1) {
            initClient(); // Reinitialize client with a new API key
        } else {
            console.error('All API keys have exceeded their quota.');
        }
    });

    document.getElementById('sendToDiscord').addEventListener('click', prepareDataAndSend);
    setInterval(initClient, 60 * 1000); // Reinitialize client every 60 seconds
}

function createPieChart(context, labels, data) {
    return new Chart(context, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#007bff', '#cccccc', '#28a745', '#ffc107'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function resetComparison() {
    clearInterval(updateInterval);
    document.getElementById('video-form').classList.remove('d-none');
    document.getElementById('reset-btn').classList.add('d-none');

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`video-title-${i}`).innerText = `Video ${i} Title`;
        document.getElementById(`video-views-${i}`).innerText = '0';
        document.getElementById(`video-concurrent-viewers-${i}`).innerText = '0';
        document.getElementById(`video-percentage-${i}`).innerText = '0';
        document.getElementById(`video-iframe-${i}`).innerHTML = '';
        document.getElementById(`video-card-${i}`).classList.add('d-none');
    }

    charts.forEach(chart => chart.destroy());
    charts = [];
}

let updateInterval;

function updatePieChart(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

function compareLiveStreams(videoIds) {
    videoIds.forEach((videoId, index) => {
        document.getElementById(`video-iframe-${index + 1}`).innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>`;
        document.getElementById(`video-card-${index + 1}`).classList.remove('d-none');
        document.getElementById(`video-iframe-${index + 1}`).innerHTML = `<iframe id="iframe-${index + 1}" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>`;
        document.getElementById(`video-card-${index + 1}`).addEventListener('click', function() {
            const iframe = document.getElementById(`iframe-${index + 1}`);
            iframe.src = iframe.src.replace('&mute=1', '&mute=0');
        });
    });

    let nextPageTokens = Array(videoIds.length).fill(null);
    const superchatTotals = Array(videoIds.length).fill(0);

    let highestSuperchatAmounts = Array(videoIds.length).fill(0);
    let highestSuperchatUsers = Array(videoIds.length).fill("");

    let exchangeRates = {};

    const fetchExchangeRate = async (currency) => {
        if (exchangeRates[currency]) {
            return exchangeRates[currency];
        }

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/d653f6d01951d04f8ef1ca0e/latest/${currency}`);
            const data = await response.json();

            if (data.result === "error") {
                console.error(`Error fetching exchange rate for ${currency}: ${data["error-type"]}`);
                return 1; // Assume an exchange rate of 1 if there's an error, effectively ignoring the conversion
            }

            exchangeRates[currency] = data.conversion_rates.USD;
            return exchangeRates[currency];
        } catch (error) {
            console.error(`Error fetching exchange rate for ${currency}: ${error}`);
            return 1; // Assume an exchange rate of 1 if there's an error, effectively ignoring the conversion
        }
    };

    let topSuperchats = Array(videoIds.length).fill([]);

    const listChatMessages = (videoIndex, pageToken) => {
        gapi.client.youtube.liveChatMessages.list({
            liveChatId: videos[videoIndex].liveStreamingDetails.activeLiveChatId,
            part: 'snippet,authorDetails',
            maxResults: 200,
            pageToken
        }).then(async liveChatResponse => {
            const liveChatMessages = liveChatResponse.result.items;
            const nextPageToken = liveChatResponse.result.nextPageToken;

            for (const message of liveChatMessages) {
                if (message.snippet.hasOwnProperty('superChatDetails')) {
                    const superchatAmount = parseFloat(message.snippet.superChatDetails.amountDisplayString.replace(/[^0-9\.]+/g, ""));
                    const currency = message.snippet.superChatDetails.currency; // Pull the currency from the message
                    const exchangeRate = await fetchExchangeRate(currency);
                    const amountInUsd = superchatAmount * exchangeRate;

                    superchatTotals[videoIndex] += amountInUsd;

                    topSuperchats[videoIndex] = [...topSuperchats[videoIndex], {
                        user: message.authorDetails.displayName,
                        amount: amountInUsd
                    }].sort((a, b) => b.amount - a.amount).slice(0, 5);
                }
            }

            prepareDataAndSend()

            // document.getElementById(`video-superchat-total-${videoIndex + 1}`).innerText = superchatTotals[videoIndex].toFixed(2);
            // document.getElementById(`video-top-superchat-users-${videoIndex + 1}`).innerText = topSuperchats[videoIndex].map((chat, index) => `${index+1}. ${chat.user} - $${chat.amount.toFixed(2)}`).join('\n');

            for (let i = 0; i < superchatTotals.length; i++) {
                videoSuperChatTotals[i] = superchatTotals[i].toFixed(2);
                videoTopSuperChatUsers[i] = topSuperchats[i].map((chat, index) => `${index+1}. ${chat.user} - $${chat.amount.toFixed(2)}`).join('\n');
              }

              for (let i = 0; i < videoSuperChatTotals.length; i++) {
                document.getElementById(`video-superchat-total-${i + 1}`).innerText = videoSuperChatTotals[i];
                document.getElementById(`video-top-superchat-users-${i + 1}`).innerText = videoTopSuperChatUsers[i];
              }

            if (nextPageToken !== nextPageTokens[videoIndex]) {
                nextPageTokens[videoIndex] = nextPageToken;
                listChatMessages(videoIndex, nextPageToken);
            }

        }).catch(error => console.error('Error getting live chat data:', error));
    };

    let videos = [];

    updateInterval = setInterval(() => {
        gapi.client.youtube.videos.list({
            id: videoIds.join(','),
            part: 'liveStreamingDetails,snippet,statis  tics'
        }).then(response => {
            videos = response.result.items;
            videos = videos.filter(video => video.liveStreamingDetails);

            // Update the activeVideoIds array based on the active videos
            activeVideoIds = videos.map(video => video.id);

            const totalConcurrentViewers = videos.reduce((total, video) => {
                return total + (parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0);
            }, 0);

            videos.forEach((video, index) => {
                if (!activeVideoIds.includes(video.id)) {
                    document.getElementById(`video-concurrent-viewers-${index + 1}`).innerText = '0';
                    document.getElementById(`video-percentage-${index + 1}`).innerText = '0';
                } else {
                    listChatMessages(index, nextPageTokens[index]);

                    const channelTitle = video.snippet.channelTitle; // Access channel title here
                    const views = parseInt(video.statistics.viewCount, 10);
                    const likes = parseInt(video.statistics.likeCount, 10);
                    const concurrentViewers = parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0;
                    const livePercentage = ((concurrentViewers / totalConcurrentViewers) * 100).toFixed(2);

                    document.getElementById(`video-channel-title-${index + 1}`).innerText = channelTitle; // Update channel title here
                    document.getElementById(`video-title-${index + 1}`).innerText = video.snippet.title; // Update video titles here
                    document.getElementById(`video-views-${index + 1}`).innerText = views.toLocaleString();
                    document.getElementById(`video-likes-${index + 1}`).innerText = likes.toLocaleString();
                    document.getElementById(`video-concurrent-viewers-${index + 1}`).innerText = concurrentViewers.toLocaleString();
                    document.getElementById(`video-percentage-${index + 1}`).innerText = livePercentage;
                }

                if (index === 0) { // Only create and update chart for the first video
                    const ctx = document.getElementById(`video-chart-1`).getContext('2d');
                    if (charts[0] === undefined) {
                        charts[0] = createPieChart(ctx, videos.map(video => video.snippet.title));
                    }

                    const livePercentages = videos.map(video => {
                        const concurrentViewers = parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0;
                        return ((concurrentViewers / totalConcurrentViewers) * 100).toFixed(2);
                    });

                    updatePieChart(charts[0], livePercentages);
                }
            });

        }).catch(error => console.error('Error getting video data:', error));
    }, 45000);



}



function prepareDataAndSend() {
    let data = [];
    for (let i = 1; i <= 4; i++) {
        const titleElement = document.getElementById(`video-title-${i}`);
        const channelTitleElement = document.getElementById(`video-channel-title-${i}`);
        const liveViewersElement = document.getElementById(`video-concurrent-viewers-${i}`);
        const likesElement = document.getElementById(`video-likes-${i}`);
        const viewsElement = document.getElementById(`video-views-${i}`);
        const livePercentageElement = document.getElementById(`video-percentage-${i}`);
        const videoId = activeVideoIds[i - 1];
        const superchatTotalElement = document.getElementById(`video-superchat-total-${i}`);
        const topSuperchatUsersElement = videoTopSuperChatUsers[i];

        if (titleElement && liveViewersElement && likesElement && viewsElement && livePercentageElement && superchatTotalElement) {
            data.push({
                videoId,
                title: titleElement.innerText,
                channelTitle: channelTitleElement.innerText,
                views: viewsElement.innerText,
                likes: likesElement.innerText,
                concurrentViewers: liveViewersElement.innerText,
                superchatTotal: superchatTotalElement.innerText,
                livePercentage: livePercentageElement.innerText,
                topSuperchatUsers: topSuperchatUsersElement
            });
        } else {
            console.log(`One or more elements not found for video card ${i}`);
        }
    }

    console.log('NEW DATA:', data);

    // Filter out videos without concurrent viewers
    data = data.filter(video => parseInt(video.concurrentViewers) > 0);

    console.log(data);
    fetch('http://localhost:3000/livestreamData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json()) // Parse the JSON response from the server
        .then(data => console.log('THIS IS DATA MESSAGE:', data.message)) // Log the message from the server
        .catch((error) => console.error('Error:', error));

}

setInterval(prepareDataAndSend, 5 * 60 * 1000); // 5 minutes in milliseconds

function updateTime() {
    let date = new Date();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let formattedDate = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZoneName: 'short'
    });
    let formattedFullDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('digital-clock').innerText = formattedFullDate + ' ' + formattedDate;
}

setInterval(updateTime, 1000); // update time every second


function getSuperchatTotal(videoId) {
    fetch(`http://localhost:3000/superchatData?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data.message))
      .catch((error) => console.error('Error:', error));
  }


