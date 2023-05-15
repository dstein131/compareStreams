
        let charts = [];

        function onClientLoad() {
            gapi.load('client', initClient);
        }

        let apiKeys = ['AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc', 'AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM', 'AIzaSyASShv8zh_tbj6m4uhcn9olHBZCihKABXQ', 'AIzaSyBWvu_9YTf9KPdiBcDh1rewr0Fo6IJAp14'];
        let currentIndex = 0;

        function getNextApiKey() {
            let key = apiKeys[currentIndex];
            currentIndex = (currentIndex + 1) % apiKeys.length; // cycle through array
            return key;
        }


        let activeVideoIds = [];  // Make this a global variable

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
        
                    activeVideoIds = videoIds.filter(id => id !== '');  // Assign to the global variable here
                    console.log(activeVideoIds);  // Add this line after assigning activeVideoIds in the initClient() function

        
                    if (activeVideoIds.length >= 2) {
                        compareLiveStreams(activeVideoIds);
                        this.classList.add('d-none');
                        document.getElementById('reset-btn').classList.remove('d-none');
                    }
                });
            }).catch(error => console.error('Error initializing YouTube Data API:', error));
            document.getElementById('sendToDiscord').addEventListener('click', prepareDataAndSend);
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
      return 1;  // Assume an exchange rate of 1 if there's an error, effectively ignoring the conversion
    }

    exchangeRates[currency] = data.conversion_rates.USD;
    return exchangeRates[currency];
  } catch (error) {
    console.error(`Error fetching exchange rate for ${currency}: ${error}`);
    return 1;  // Assume an exchange rate of 1 if there's an error, effectively ignoring the conversion
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

        topSuperchats[videoIndex] = [...topSuperchats[videoIndex], {user: message.authorDetails.displayName, amount: amountInUsd}].sort((a, b) => b.amount - a.amount).slice(0, 5);
      }
    }

    document.getElementById(`video-superchat-total-${videoIndex + 1}`).innerText = superchatTotals[videoIndex].toFixed(2);
    document.getElementById(`video-top-superchat-users-${videoIndex + 1}`).innerText = topSuperchats[videoIndex].map((chat, index) => `${index+1}. ${chat.user} - $${chat.amount.toFixed(2)}`).join('\n');
    
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
        part: 'liveStreamingDetails,snippet,statistics'
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
function sendToDiscord(message) {
    fetch('https://discord.com/api/webhooks/1105650534901354526/zJ0hiGe9MmB1HlZy9n4O6a0Ua7vZ8eaCXtrizoUa-EumSBoo2tD1Srt72769m6gtCs7H', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message
        }),
    }).catch((error) => console.error('Error:', error));
}

function prepareDataAndSend() {
    let data = [];
    console.log(data)
    for (let i = 0; i < activeVideoIds.length; i++) {  // Use the global variable here
        const titleElement = document.getElementById(`video-title-${i + 1}`);
        if (titleElement && titleElement.innerText) {
            const title = titleElement.innerText;
            const liveViewers = document.getElementById(`video-concurrent-viewers-${i}`).innerText;
            const likes = document.getElementById(`video-likes-${i}`).innerText;
            const views = document.getElementById(`video-views-${i}`).innerText;
            const livePercentage = document.getElementById(`video-percentage-${i}`).innerText;
            const videoId = activeVideoIds[i - 1];
            const superchatTotal = document.getElementById(`video-superchat-total-${i}`).innerText;
            data.push({
                videoId,
                title,
                views,
                likes,
                concurrentViewers: liveViewers,
                superchatTotal,
                livePercentage
            });
        }
    }

    fetch('http://localhost:3000/livestreamData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).catch((error) => console.error('Error:', error));

    let message = "";
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (let i = 1; i <= 4; i++) {
        const titleElement = document.getElementById(`video-title-${i}`);
        if (titleElement && titleElement.innerText) {
            const title = titleElement.innerText;
            const liveViewers = document.getElementById(`video-concurrent-viewers-${i}`).innerText;
            const superchatTotal = document.getElementById(`video-superchat-total-${i}`).innerText;
            const likes = document.getElementById(`video-likes-${i}`).innerText;
            const views = document.getElementById(`video-views-${i}`).innerText;
            const livePercentage = document.getElementById(`video-percentage-${i}`).innerText;
            const topSuperchatUsers = document.getElementById(`video-top-superchat-users-${i}`).innerText;
            let date = new Date();
            let formattedDate = date.toLocaleString('en-US', { timeZoneName: 'short' });

            message += `Title: ${title}, Live Viewers: ${liveViewers} (${livePercentage}%), Superchat Total: $${superchatTotal}, Likes: ${likes}, Views: ${views}, Top Superchat Users: ${topSuperchatUsers}, Data as of: ${formattedDate} (${timeZone})\n\n`;
        }
    }
    sendToDiscord(message);
}


setInterval(prepareDataAndSend, 5 * 60 * 1000); // 5 minutes in milliseconds



function updateTime() {
    let date = new Date();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let formattedDate = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZoneName: 'short' });
    let formattedFullDate = date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
    
    document.getElementById('digital-clock').innerText = formattedFullDate + ' ' + formattedDate;
}

setInterval(updateTime, 1000); // update time every second

