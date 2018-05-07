const StreamrClient = require('streamr-client');
const Mta = require('mta-gtfs');

// Ahoy Hacker, fill in this!
const STREAM_NAME = 'Subway-setti';
const API_KEY = 'A_i-1UZjQyKdlTRgBfyPQAe6P93hydSaCCZnn_aKBJtw'
if (API_KEY === undefined) {
  throw new Error('Must export environment variable API_KEY');
}

var mta = new Mta({
    key: '6f5e1eb44ccf481af09af844abf78c28', // only needed for mta.schedule() method
    feed_id: 1                  // optional, default = 1
  });

main().catch(console.error);


async function main() {
    // Initialize Streamr-Client library
    const client = new StreamrClient({
        apiKey: API_KEY
    });

    // Get a Stream (creates one if does not already exist)
    const stream = await client.getOrCreateStream({
        name: STREAM_NAME
    });
    console.info("Initialized stream:", stream.id);

    // Generate and produce randomized data to Stream
    await generateEventAndSend(635, stream, 0);
}

async function generateEventAndSend(stationId, stream, i) {
    const res = await mta.schedule(stationId, 1)
    let delays = [];
    let all = [];
    console.log(res.schedule[stationId].N)
    res.schedule[stationId].N.forEach(element => {
        if(element.delay !== null) {
            delays.push(element)
        }
        all.push(element)
    });
    const msg = {
        delayPercentage : (delays.length/all.length)/100
    }
    
    console.log(res)
    await stream.produce(msg);

    setTimeout(generateEventAndSend.bind(null, stationId, stream, i + 1), 30 * 1000);
}
