let charts = [];
let video1SuperChatTotal = 0;
let video1TopSuperchatUsers = [];
let video2SuperChatTotal = 0;
let video2TopSuperchatUsers = [];
let video3SuperChatTotal = 0;
let video3TopSuperchatUsers = [];
let video4SuperChatTotal = 0;
let video4TopSuperchatUsers = [];
let videoSuperChatTotals = [];
let videoTopSuperChatUsers = [];
let apiKeys = [
  "AIzaSyASShv8zh_tbj6m4uhcn9olHBZCihKABXQ",
  "AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc",
  "AIzaSyCRO6LdrRE0hdjHFXblMZZFHNN_3-4lpYU",
  "AIzaSyCluXZQNYEP5PI0s511RL2yoKNwsJX1DwQ",
  "AIzaSyBWvu_9YTf9KPdiBcDh1rewr0Fo6IJAp14",
  "AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM",
];
let currentIndex = 0;

function getNextApiKey() {
  let key = apiKeys[currentIndex];
  currentIndex = (currentIndex + 1) % apiKeys.length; // cycle through array
  console.log("Using API key: " + key);
  return key;
}

let activeVideoIds = []; // Make this a global variable

function onClientLoad() {
  gapi.load("client");
}


async function initClient() {
  try {
    gapi.client
      .init({
        apiKey: getNextApiKey(),
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
        ],
      })
      .then(() => {
        if (activeVideoIds.length >= 2) {
          compareLiveStreams(activeVideoIds);
        }
      })
      .catch((error) => {
        console.error("Error initializing YouTube Data API:", error);
      });
  } catch (error) {
    console.error("Error initializing YouTube Data API:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("video-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const videoIds = [
        document.getElementById('video-id-1').value,
        document.getElementById('video-id-2').value,
        document.getElementById('video-id-3').value,
        document.getElementById('video-id-4').value,
    ];
      activeVideoIds = videoIds.filter((id) => id !== "");
      initClient(); // Initialize client after updating super chat totals
      //hide the video-form
      if (activeVideoIds.length >= 2) {
        compareLiveStreams(activeVideoIds);
        this.classList.add('d-none');
      }
    });
    
});

setInterval(initClient, 60 * 1000); // Reinitialize client every 60 seconds

function createPieChart(context, labels, data) {
  return new Chart(context, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#007bff", "#cccccc", "#28a745", "#ffc107"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function resetComparison() {
  clearInterval(updateInterval);
  document.getElementById("video-form").classList.remove("d-none");
  document.getElementById("reset-btn").classList.add("d-none");

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`video-title-${i}`).innerText = `Video ${i} Title`;
    document.getElementById(`video-views-${i}`).innerText = "0";
    document.getElementById(`video-concurrent-viewers-${i}`).innerText = "0";
    document.getElementById(`video-percentage-${i}`).innerText = "0";
    document.getElementById(`video-iframe-${i}`).innerHTML = "";
    document.getElementById(`video-card-${i}`).classList.add("d-none");
  }

  charts.forEach((chart) => chart.destroy());
  charts = [];
}

let updateInterval;

function updatePieChart(chart, data) {
  chart.data.datasets[0].data = data;
  chart.update();
}

function compareLiveStreams(videoIds) {
    let nextPageTokens = Array(videoIds.length).fill(null),
      superchatTotals = Array(videoIds.length).fill(0),
      exchangeRates = {},
      topSuperchats = Array(videoIds.length).fill([]);
  
    const fetchExchangeRate = async (currency) => {
      if (exchangeRates[currency]) return exchangeRates[currency];
      try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/d653f6d01951d04f8ef1ca0e/latest/${currency}`);
        const data = await res.json();
        return (exchangeRates[currency] = (data.result === "error") ? 1 : data.conversion_rates.USD);
      } catch (error) { return 1; }
    };
  
    const listChatMessages = (videoIndex, pageToken) => {
      gapi.client.youtube.liveChatMessages
        .list({
          liveChatId: videos[videoIndex].liveStreamingDetails.activeLiveChatId,
          part: "snippet,authorDetails",
          maxResults: 200,
          pageToken,
        })
        .then(async (liveChatResponse) => {
          const liveChatMessages = liveChatResponse.result.items;
          const nextPageToken = liveChatResponse.result.nextPageToken;
  
          for (const message of liveChatMessages) {
            if (message.snippet.hasOwnProperty("superChatDetails")) {
              const superchatAmount = parseFloat(
                message.snippet.superChatDetails.amountDisplayString.replace(
                  /[^0-9\.]+/g,
                  ""
                )
              );
              const currency = message.snippet.superChatDetails.currency;
              const exchangeRate = await fetchExchangeRate(currency);
              const amountInUsd = superchatAmount * exchangeRate;
  
              superchatTotals[videoIndex] += amountInUsd;
  
              topSuperchats[videoIndex] = [
                ...topSuperchats[videoIndex],
                {
                  user: message.authorDetails.displayName,
                  amount: amountInUsd,
                },
              ]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            }
          }
  
          for (let i = 0; i < superchatTotals.length; i++) {
            let videoSuperChatTotal = superchatTotals[i].toFixed(2);
            let videoTopSuperChatUsers = topSuperchats[i]
              .map(
                (chat, index) =>
                  `${index + 1}. ${chat.user} - $${chat.amount.toFixed(2)}`
              )
              .join("\n");
  
            document.getElementById(`video-superchat-total-${i + 1}`).innerText =
              videoSuperChatTotal;
            document.getElementById(
              `video-top-superchat-users-${i + 1}`
            ).innerText = videoTopSuperChatUsers;
          }
  
          if (nextPageToken !== nextPageTokens[videoIndex]) {
            nextPageTokens[videoIndex] = nextPageToken;
            listChatMessages(videoIndex, nextPageToken);
          }
        })
        .catch((error) => console.error("Error getting live chat data:", error));
    };
  
    videoIds.forEach((videoId, index) => {
      let videoIframe = document.getElementById(`video-iframe-${index + 1}`),
        videoCard = document.getElementById(`video-card-${index + 1}`);
    if (!document.getElementById(`iframe-${index + 1}`)) {
        videoIframe.innerHTML = `<iframe id="iframe-${index + 1}" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>`;
      }
      videoCard.classList.remove("d-none");
      videoCard.addEventListener("click", () => {
        const iframe = document.getElementById(`iframe-${index + 1}`);
        iframe.src = iframe.src.replace("&mute=1", "&mute=0");
      });
    });
  
    let videos = [];
    setInterval(() => {
      gapi.client.youtube.videos
        .list({
          id: videoIds.join(","),
          part: "liveStreamingDetails,snippet,statistics",
        })
        .then((response) => {
          videos = response.result.items;
          videos = videos.filter((video) => video.liveStreamingDetails);
  
          const totalConcurrentViewers = videos.reduce((total, video) => {
            return (
              total +
              (parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0)
            );
          }, 0);
  
          videos.forEach((video, index) => {
            listChatMessages(index, nextPageTokens[index]);
  
            const channelTitle = video.snippet.channelTitle;
            const views = parseInt(video.statistics.viewCount, 10);
            const likes = parseInt(video.statistics.likeCount, 10);
            const concurrentViewers =
              parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0;
            const livePercentage = (
              (concurrentViewers / totalConcurrentViewers) *
              100
            ).toFixed(2);
  
            document.getElementById(
              `video-channel-title-${index + 1}`
            ).innerText = channelTitle;
            document.getElementById(`video-title-${index + 1}`).innerText =
              video.snippet.title;
            document.getElementById(`video-views-${index + 1}`).innerText =
              views.toLocaleString();
            document.getElementById(`video-likes-${index + 1}`).innerText =
              likes.toLocaleString();
            document.getElementById(
              `video-concurrent-viewers-${index + 1}`
            ).innerText = concurrentViewers.toLocaleString();
            document.getElementById(`video-percentage-${index + 1}`).innerText =
              livePercentage;
  
            if (index === 0) {
              const ctx = document
                .getElementById(`video-chart-1`)
                .getContext("2d");
              if (charts[0] === undefined) {
                charts[0] = createPieChart(
                  ctx,
                  videos.map((video) => video.snippet.title)
                );
              }
  
              const livePercentages = videos.map((video) => {
                const concurrentViewers =
                  parseInt(video.liveStreamingDetails.concurrentViewers, 10) || 0;
                return (
                  (concurrentViewers / totalConcurrentViewers) *
                  100
                ).toFixed(2);
              });
  
              updatePieChart(charts[0], livePercentages);
            }
          });
        })
        .catch((error) => console.error("Error getting video data:", error));
    }, 45000);
  }
  
  function prepareDataAndSend() {
    let data = [];
    for (let i = 1; i <= 4; i++) {
      const elements = {
        title: document.getElementById(`video-title-${i}`),
        channelTitle: document.getElementById(`video-channel-title-${i}`),
        liveViewers: document.getElementById(`video-concurrent-viewers-${i}`),
        likes: document.getElementById(`video-likes-${i}`),
        views: document.getElementById(`video-views-${i}`),
        livePercentage: document.getElementById(`video-percentage-${i}`),
        superchatTotal: document.getElementById(`video-superchat-total-${i}`),
      };
  
      const videoId = activeVideoIds[i - 1];
      const topSuperchatUsers = videoTopSuperChatUsers[i - 1];
  
      if (Object.values(elements).every(Boolean) && topSuperchatUsers) {
        const usersArray = topSuperchatUsers.split("\n").filter((user) => user.trim() !== "");
        const formattedArray = usersArray.map((user) => {
          const [name, amount] = user.split(" - ");
          return { name, amount };
        });
        const jsonTopSuperchatUsers = JSON.stringify(formattedArray);
  
        data.push({
          videoId,
          title: elements.title.innerText,
          channelTitle: elements.channelTitle.innerText,
          views: elements.views.innerText,
          likes: elements.likes.innerText,
          concurrentViewers: elements.liveViewers.innerText,
          superchatTotal: elements.superchatTotal.innerText,
          livePercentage: elements.livePercentage.innerText,
          topSuperchatUsers: jsonTopSuperchatUsers,
        });
      } else {
        console.log(`One or more elements not found for video card ${i}`);
      }
    }
    console.log("NEW DATA:", data);
  
    // Filter out videos without concurrent viewers
    data = data.filter((video) => parseInt(video.concurrentViewers, 10) > 0);
  
    console.log(data);
    fetch("http://localhost:3000/livestreamData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response from the server
      })
      .then((data) => console.log("THIS IS DATA MESSAGE:", data.message)) // Log the message from the server
      .catch((error) => console.error("Error:", error));
  }
  
  // 5 minutes in milliseconds
  function startDataPreparationInterval() {
    setInterval(prepareDataAndSend, 5 * 60 * 1000);
  }
  
  startDataPreparationInterval();
  
