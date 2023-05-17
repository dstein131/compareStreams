// Globals
let charts = [];
const videoData = [];
const apiKeys = ['AIzaSyBWvu_9YTf9KPdiBcDh1rewr0Fo6IJAp14', 'AIzaSyASShv8zh_tbj6m4uhcn9olHBZCihKABXQ', 'AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc', 'AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM'];
let apiKeyIndex = 0;
let activeVideoIds = [];

// Function declarations
function getNextApiKey() {
  const key = apiKeys[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  return key;
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

  for (let i = 1; i <= videoData.length; i++) {
    const video = videoData[i-1];
    video.titleElement.innerText = `Video ${i} Title`;
    video.viewsElement.innerText = '0';
    video.concurrentViewersElement.innerText = '0';
    video.livePercentageElement.innerText = '0';
    document.getElementById(`video-iframe-${i}`).innerHTML = '';
    document.getElementById(`video-card-${i}`).classList.add('d-none');
  }

  charts.forEach(chart => chart.destroy());
  charts = [];
}

function updatePieChart(chart, data) {
  chart.data.datasets[0].data = data;
  chart.update();
}

function prepareDataAndSend() {
  const data = videoData.map(video => ({
    videoId: video.videoId,
    title: video.titleElement.innerText,
    channelTitle: video.channelTitleElement.innerText,
    views: video.viewsElement.innerText,
    likes: video.likesElement.innerText,
    concurrentViewers: video.concurrentViewersElement.innerText,
    superchatTotal: video.superchatTotalElement.innerText,
    livePercentage: video.livePercentageElement.innerText,
    topSuperchatUsers: JSON.stringify(video.topSuperchatUsers)
  }));

  console.log('NEW DATA:', data);

  // Filter out videos without concurrent viewers
  const activeData = data.filter(video => parseInt(video.concurrentViewers) > 0);
  console.log(activeData);

  fetch('http://localhost:3000/livestreamData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activeData),
  })
    .then(response => response.json())
    .then(data => console.log('THIS IS DATA MESSAGE:', data.message))
    .catch((error) => console.error('Error:', error));
}

function updateTime() {
  const date = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formattedDate = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZoneName: 'short',
    timeZone: timeZone
    });
    
    document.getElementById('current-time').innerText = formattedDate;
    }
    
    function setVideoData(video, videoId, title, channelTitle, views, likes, concurrentViewers, superchatTotal, livePercentage, topSuperchatUsers) {
    video.videoId = videoId;
    video.titleElement.innerText = title;
    video.channelTitleElement.innerText = channelTitle;
    video.viewsElement.innerText = views;
    video.likesElement.innerText = likes;
    video.concurrentViewersElement.innerText = concurrentViewers;
    video.superchatTotalElement.innerText = superchatTotal;
    video.livePercentageElement.innerText = livePercentage;
    video.topSuperchatUsers = topSuperchatUsers;
    
    video.chart.update();
    }
    
    // Event handlers
    document.getElementById('video-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const videoIds = document.getElementById('video-ids').value.split('\n').filter(id => id.trim() !== '');
    
    videoIds.forEach((videoId, index) => {
        if (index < 4) {
          const video = {
            videoId: videoId,
            titleElement: document.getElementById(`video-title-${index+1}`),
            channelTitleElement: document.getElementById(`channel-title-${index+1}`),
            viewsElement: document.getElementById(`views-${index+1}`),
            likesElement: document.getElementById(`likes-${index+1}`),
            concurrentViewersElement: document.getElementById(`concurrent-viewers-${index+1}`),
            superchatTotalElement: document.getElementById(`superchat-total-${index+1}`),
            livePercentageElement: document.getElementById(`live-percentage-${index+1}`),
            topSuperchatUsers: [],
            chart: createPieChart(document.getElementById(`chart-canvas-${index+1}`).getContext('2d'), ['Views', 'Likes', 'Concurrent Viewers', 'Superchat Total'], [0, 0, 0, 0])
          };

    videoData.push(video);
    document.getElementById(`video-iframe-${index+1}`).innerHTML = `<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${videoId}?modestbranding=1&autoplay=1&mute=1&controls=1&disablekb=1" allowfullscreen></iframe>`;
    document.getElementById(`video-card-${index+1}`).classList.remove('d-none');
  }
});

activeVideoIds = videoIds;
updateInterval = setInterval(() => activeVideoIds.forEach(updateVideoData), 5000);
document.getElementById('video-form').classList.add('d-none');
document.getElementById('reset-btn').classList.remove('d-none');
document.getElementById('video-ids').value = '';
});

document.getElementById('reset-btn').addEventListener('click', resetComparison);

// Google API client load
gapi.load('client', initClient);

function initClient() {
gapi.client.init({
apiKey: getNextApiKey(),
discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
}).then(function() {
setInterval(updateTime, 1000);
}).catch(function(error) {
console.error('Error:', error);
});
}

function updateVideoData(videoId) {
gapi.client.youtube.videos.list({
part: 'snippet,statistics,liveStreamingDetails',
id: videoId
}).then(function(response) {
const video = videoData.find(v => v.videoId === videoId);

if (video) {
    const data = response.result.items[0];
    const title = data.snippet.title;
    const channelTitle = data.snippet.channelTitle;
    const views = data.statistics.viewCount;
    const likes = data.statistics.likeCount;
    const concurrentViewers = data.liveStreamingDetails.concurrentViewers || 0;
    const superchatTotal = data.liveStreamingDetails.superChatTotal || 0;
    const livePercentage = (concurrentViewers / views * 100).toFixed(2);
    const topSuperchatUsers = video.topSuperchatUsers;
    setVideoData(video, videoId, title, channelTitle, views, likes, concurrentViewers, superchatTotal, livePercentage, topSuperchatUsers);

    const chartData = [views, likes, concurrentViewers, superchatTotal];
    updatePieChart(video.chart, chartData);
  }
  
}).catch(function(error) {
    console.error('Error:', error);
    gapi.client.init({
    apiKey: getNextApiKey(),
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    });
    });
    }
    
    setInterval(prepareDataAndSend, 5000);