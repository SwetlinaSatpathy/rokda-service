//const fetch = require("node-fetch");
//const {TextDecoderStream} = require ("web-streams-polyfill");
const { StringDecoder } = require("string_decoder");
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require("express");
const zlib = require('zlib');
const app = express();
const PORT = process.env.PORT || 4000;
const userAgents = [
    'Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1'
];

app.use(express.json());
// Endpoint for processing webpages
app.get("/webBuffer", (request, response) => {
    const url = request.query.urlToFetch || "";

    console.log(`Received URL: ${url}`);

    async function fetchStream() {
        try {
            const headers = userAgents[Math.floor(Math.random()*userAgents.length)];

            let responseFetched = await fetch(url, headers)
            console.log("streaming started--")
            const streamReader = responseFetched.body.pipeThrough(new TextDecoderStream()).getReader();

            while(true){
                const {done, value} = await streamReader.read();
                if(done){
                    break;
                }
                console.log("chunk received--", value)
                response.write(value)
            }
            console.log("streaming complete")
            response.end()
        }catch (error){
            console.error(`Error occured: ${error}`);
            response.status(500).send(`Error fetching the URL: ${url}`)
        }
    }
    fetchStream()
});

app.use(bodyParser.json());
// Endpoint for processing POST requests
app.post("/retrieve", async (request, response) => {
    const { url, payload } = request.body;
    const headers = {'User-Agent' : userAgents[Math.floor(Math.random()*userAgents.length)]};
    try {
        const fetchedResponse = await axios.post(url, payload, {headers});
        
        return response.json(fetchedResponse);
        
    } catch (error) {
        console.error(`Error processing request: ${error}`);
        response.status(500).send(`Error processing the URL/Payload: ${error}`);
    }
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
