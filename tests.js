const { JSDOM } = require('jsdom');
const jest = require('jest-mock');

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // Outputs: "Hello world"

// Mocking the gapi client and fetch functions
global.gapi = {
  load: jest.fn(),
  client: {
    init: jest.fn().mockResolvedValue(true),
    youtube: {
      liveChatMessages: {
        list: jest.fn().mockResolvedValue({ result: { items: [] } }),
      },
      videos: {
        list: jest.fn().mockResolvedValue({ result: { items: [] } }),
      },
    },
  },
};
global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue({ result: 'success' }) });

// We need to mock these functions before requiring the script
// that contains them.
const {
  onClientLoad,
  getNextApiKey,
  initClient,
  resetComparison,
} = require('./scripts.js');  // Replace this with the path to your script

describe('YouTube Livestream Comparison', () => {
  beforeEach(() => {
    const dom = new JSDOM();
    global.document = dom.window.document;
    global.window = dom.window;
  });

  it('should call gapi load on client load', () => {
    onClientLoad();
    expect(gapi.load).toHaveBeenCalledWith('client', initClient);
  });

  it('should return the next API key correctly', () => {
    const firstKey = getNextApiKey();
    const secondKey = getNextApiKey();
    expect(firstKey).toBe('AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc');
    expect(secondKey).toBe('AIzaSyCj3uIPZWn9iqhoG4GvTLGMyC2MKl3gOcM');
  });

  it('should call gapi init on init client', async () => {
    await initClient();
    expect(gapi.client.init).toHaveBeenCalledWith({
      apiKey: 'AIzaSyCavuo49y58vKYZM1T-12bJRUqcAu3SuHc',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    });
  });

  // resetComparison() relies heavily on the DOM. We need to mock
  // the DOM elements it interacts with to test it.
  it('should correctly reset the comparison', () => {
    const mockClearInterval = jest.spyOn(global, 'clearInterval');
    const mockGetElementById = jest.spyOn(document, 'getElementById');

    const mockClassList1 = {
        remove: jest.fn(),
        add: jest.fn(),
    };

    const mockClassList2 = {
        remove: jest.fn(),
        add: jest.fn(),
    };

    const mockChart = {
        destroy: jest.fn(),
    };

    mockGetElementById.mockImplementation((id) => {
        switch (id) {
            case 'video-form':
                return {
                    classList: mockClassList1,
                };
            case 'reset-btn':
                return {
                    classList: mockClassList2,
                };
            default:
                return {
                    innerText: '',
                    innerHTML: '',
                    classList: {
                        add: jest.fn(),
                    },
                };
        }
    });

    charts.push(mockChart);

    resetComparison();

    expect(mockClearInterval).toHaveBeenCalled();
    expect(mockClassList1.remove).toHaveBeenCalledWith('d-none');
    expect(mockClassList2.add).toHaveBeenCalledWith('d-none');
    expect(mockChart.destroy).toHaveBeenCalled();
    expect(charts.length).toBe(0);
});

it('should update the pie chart correctly', () => {
    const mockChart = {
        data: {
            datasets: [
                {
                    data: [],
                },
            ],
        },
        update: jest.fn(),
    };
    const newData = [20, 30, 50];

    updatePieChart(mockChart, newData);

    expect(mockChart.data.datasets[0].data).toEqual(newData);
    expect(mockChart.update).toHaveBeenCalled();
});

it('should send data to discord correctly', () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve());
    const message = 'Test message';

    sendToDiscord(message);

    expect(fetchMock).toHaveBeenCalledWith('https://discord.com/api/webhooks/1105650534901354526/zJ0hiGe9MmB1HlZy9n4O6a0Ua7vZ8eaCXtrizoUa-EumSBoo2tD1Srt72769m6gtCs7H', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message
        }),
    });

    fetchMock.mockRestore();
});

it('should prepare data and send correctly', () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve());
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockImplementation(() => ({
        innerText: 'Test text',
    }));

    activeVideoIds = ['videoId1', 'videoId2'];

    prepareDataAndSend();

    expect(fetchMock).toHaveBeenCalled();

    mockGetElementById.mockRestore();
    fetchMock.mockRestore();
});

it('should update time correctly', () => {
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockImplementation(() => ({
        innerText: '',
    }));

    updateTime();

    expect(mockGetElementById).toHaveBeenCalledWith('digital-clock');

    mockGetElementById.mockRestore();
});
});

afterEach(() => {
jest.restoreAllMocks();
});
