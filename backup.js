const apiKeys = ['AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc', 'AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM', 'AIzaSyASShv8zh_tbj6m4uhcn9olHBZCihKABXQ', 'AIzaSyBWvu_9YTf9KPdiBcDh1rewr0Fo6IJAp14'];
let currentIndex = 0;
let charts = [];
let activeVideoIds = [];
let updateInterval;

// Reusable functions to get elements by id
const getById = id => document.getElementById(id);
const getValById = id => getById(id).value;

function getNextApiKey() {
    const key = apiKeys[currentIndex];
    currentIndex = (currentIndex + 1) % apiKeys.length;
    return key;
}

function onClientLoad() {
    gapi.load('client', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: getNextApiKey(),
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(() => {
        getById('video-form').addEventListener('submit', handleFormSubmit);
    }).catch(error => {
        console.error('Error initializing YouTube Data API:', error);
        if (currentIndex < apiKeys.length - 1) {
            initClient();
        } else {
            console.error('All API keys have exceeded their quota.');
        }
    });

    getById('sendToDiscord').addEventListener('click', prepareDataAndSend);
    setInterval(initClient, 60 * 1000); // Reinitialize client every minute
}

function handleFormSubmit(event) {
    event.preventDefault();

    const videoIds = Array.from({length: 4}, (_, i) => getValById(`video-id-${i+1}`));
    activeVideoIds = videoIds.filter(Boolean);

    console.log(activeVideoIds);

    if (activeVideoIds.length >= 2) {
        compareLiveStreams(activeVideoIds);
        this.classList.add('d-none');
        getById('reset-btn').classList.remove('d-none');
    }
}

// Rest of your functions...
