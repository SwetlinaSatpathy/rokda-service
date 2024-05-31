const express = require("express");
//const {TextDecoderStream} = required ("web-streams-polyfill");
const { StringDecoder } = require("string_decoder");
//const fetch = require("node-fetch"); // Import the fetch library
const zlib = require('zlib');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/arbitrage", (request, response) => {
    //const url = "https://www.moneycontrol.com/stocks/fno/marketstats/arbitrage/futures-spot-next-1.html";
    //const url = "https://www.rbi.org.in/Scripts/BS_NSDPDisplay.aspx?param=4#";
    //const url = "https://www.google.co.in/search?q=tata%20Motors%20share%20price";
    const url     = request.body?.url || "";
    const options    = request.body || {};
    //const options = request.options || {};


    console.log(`Received URL: ${url}`);
    console.log(`Received Options: ${JSON.stringify(options)}`);
    let data = {};
    // const options = {
    //     headers: {
    //         "Content-Type": "text/html",
    //     },
    // };

    async function fetchStream() {
        try {
            let res = await fetch(url, options)
            console.log("streaming started--")
            const streamReader = res.body.pipeThrough(new TextDecoderStream()).getReader();

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

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
