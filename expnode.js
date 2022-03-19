const http = require("http");
const url = require("url");
const fs = require("fs");
const os = require("os");
// const 

const hostname = "http://localhost"
const PORT = 4000;
// console.log(os.userInfo());
// os.cpus().forEach(cpu => console.count(cpu.model))
// console.log(http.request("http://google.com"));
const server = http.createServer( async(req, res) => {

    const thisUrl = url.parse(req.url, true);
    console.log(thisUrl.pathname);
    console.log(1, thisUrl.pathname.match(/\/video\/[a-zA-Z]+\.mp4/));
    if (thisUrl.pathname === "/home") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end("<h1>Home</h1>");
    }
    else if (thisUrl.pathname === "/hello" && thisUrl.query.name && req.method === "GET") {
        // console.log(http.IncomingMessage);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Hello ${thisUrl.query.name}!</h1>`);
    }
    else if (thisUrl.pathname === "/hello" && req.method === "GET") {
        // const thisUrl = new URL(`${hostname}:${PORT}${req.url}?uname=daniel`);
        // // console.log(url.parse(req.url, true));
        // console.log(thisUrl);
        // const uname = thisUrl.searchParams.get("uname")
        // res.statusCode = 200;
        // res.setHeader("Content-Type", "text/html");
        // res.end(`<h1>Hello World ${uname}</h1>`);
        res.writeHead(200, { "Content-Type": "text/html" }).end("<h1>Hello World!</h1>");
    } 
    else if (req.url === "/hello" && req.method === "POST") {

        // let sentName = "";
        const buffers = [];
        // req.on("data", chunk => {
        //     sentName += chunk;
        // });
        for await (const chunk of req) {
            buffers.push(chunk);
        };
        const data = JSON.parse(Buffer.concat(buffers).toString());
        // req.on("end", () => {
        //     sentName = JSON.parse(sentName);
        //     console.log(sentName);
        //     res.statusCode = 200;
        //     res.setHeader("Content-Type", "text/html");
        //     res.end(`<h1>Hello ${sentName.name}</h1>`);
        // });
        console.log(data.name);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html")
        res.end(`<h1>Hello ${data.name}</h1>`);
    }
    else if (req.url === "/readfile" && req.method === "GET") {
        fs.readFile("./hellouser.txt", "utf-8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            } 
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(data);
        });
    }
    else if (req.url === "/writefile" && req.method === "POST") {
        const postBuffer = [];
        for await (const chunk of req) {
            postBuffer.push(chunk);
        };
        const sentName = Buffer.concat(postBuffer).toString();
        fs.writeFile("./hellouser.txt", sentName, err => {
            if (err) {
                console.error(err);
                return;
            };
        });
        fs.readFile("./hellouser.txt", "utf-8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log(data);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(`<h1>Hello ${JSON.parse(data).name}!</h1>`);
        });
    }
    else if (req.url === "/readdir" && req.method === "GET"){
        fs.readdir("D:\\", (err, files) => {
            files.forEach((file, i) => {
                res.write(file + "\n");
                if (i === files.length - 1) {
                    res.end();
                }
            })
        })
    }
    else if (thisUrl.pathname === "/gethtml" && req.method === "GET") {
        fs.readFile("./index.html", "utf-8", (err, data) => {
            res.writeHead(200, { "Content-Type" : "text/html" });
            res.end(data);
        });
    }
    else if (thisUrl.pathname.match(/\/video\/[a-zA-Z]+\.mp4/i) && req.method === "GET") {
        const vidName = thisUrl.pathname.split("/")[2];
        const data = fs.createReadStream(vidName);
        data.pipe(res);
        // res.writeHead(200, { "Content-Type": "text/plain" }).end(vidName);
    };
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});