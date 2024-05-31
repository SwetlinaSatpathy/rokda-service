
//const {TextDecoderStream} = required ("web-streams-polyfill");const express = require("express");
//const fetch = require("node-fetch");
const { StringDecoder } = require("string_decoder");
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

// Endpoint for processing POST requests
app.post("/retrieve", (request, response) => {
    const { url, payload } = request.body;
  
    try {
        if (!url || !payload) {
            return response.status(400).send("Missing required parameters: url and payload");
        }
    
        const fetchedResponse = fetch(url, payload);
    
        if (!fetchedResponse.ok) {
          throw new Error(`Error fetching target URL: ${url} - Status: ${fetchedResponse.status}`);
        }
        response.send(fetchedResponse);
        
    } catch (error) {
        console.error(`Error processing request: ${error}`);
        response.status(500).send(`Error processing the URL/Payload: ${error}`);
    }
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
