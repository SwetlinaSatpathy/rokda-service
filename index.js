const express = require("express");
const { StringDecoder } = require("string_decoder");
//const fetch = require("node-fetch"); // Import the fetch library
const zlib = require('zlib');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/arbitrage", (request, response) => {
    const url = "https://www.moneycontrol.com/stocks/fno/marketstats/arbitrage/futures-spot-next-1.html";
    //const url = "https://www.rbi.org.in/Scripts/BS_NSDPDisplay.aspx?param=4#";
    let data = {};
    const options = {
        headers: {
            "Content-Type": "text/html",
        },
    };

    async function fetchStream() {
        let res = await fetch(url)
        console.log("streaming started--")
        const streamReader = res.body.pipeThrough(new TextDecoderStream()).getReader();

        while(true){
            const { done, value} = await streamReader.read();
            if(done){
                break;
            }
            console.log("chunk received--", value)
            response.write(value)
        }
        console.log("streaming complete")
        response.end()
    }

    fetchStream()
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});
