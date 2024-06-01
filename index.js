//const fetch = require("node-fetch");
//const {TextDecoderStream} = require ("web-streams-polyfill");
const { StringDecoder } = require("string_decoder");
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require("express");
const zlib = require('zlib');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Endpoint for processing webpages
app.get("/webBuffer", (request, response) => {
    const url = request.query.urlToFetch || "";

    console.log(`Received URL: ${url}`);

    async function fetchStream() {
        try {
            let responseFetched = await fetch(url)
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
    const headers = request.headers;
    const parsedPayload = JSON.parse(payload);
    console.log (`Url: ${url} & Payload: ${payload}`)
    console.log(`Request: ${request}`)
    console.log(`Parsed Payload: ${parsedPayload}`)
    console.log(`BODY: ${JSON.stringify(parsedPayload)}`);
    try {
        const fetchedResponse = await axios.post(url, parsedPayload, {
            headers
        });

        // if (!url || !payload) {
        //     //return response.status(400).send("Missing required parameters: url and payload");
        //     console.log(`no URL & no payload`)
        // } else{
        //     url = request.payload.url;
        //     url = request.payload.payload;
        //     console.log (`${url} & Payload: ${payload}`)
        // }
    
        // if (!fetchedResponse.ok) {
        //   throw new Error(`Error fetching target URL: ${url} - Status: ${fetchedResponse.status}`);
        // }
        return response.json({data: fetchedResponse.data, message: "Data received and processed"});
        
    } catch (error) {
        console.error(`Error processing request: ${error}`);
        response.status(500).send(`Error processing the URL/Payload: ${error}`);
    }
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
