const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const busboy = require("busboy");
const formidable = require("formidable");

const PORT = 4000;
// console.log(os.userInfo());
// os.cpus().forEach(cpu => console.count(cpu.model))
// console.log(http.request("http://google.com"));
const server = http.createServer( async(req, res) => {

    const thisUrl = url.parse(req.url, true);
    console.log(thisUrl.pathname.split("/"));
    console.log(1, thisUrl.pathname.match(/\/image\/[a-zA-Z0-9]\+.jpg/));
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
            if (err) throw(err);
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
            if (err) throw(err);
            res.writeHead(200, { "Content-Type" : "text/html" });
            res.end(data);
        });
    }
    else if (thisUrl.pathname.match(/\/video\/[a-zA-Z]+\.mp4/i) && req.method === "GET") {
        const vidName = thisUrl.pathname.split("/")[2];
        console.log("here",vidName);

        res.setHeader("Content-Type", "video/mp4" );
        // res.setHeader("Content-Encoding", "gzip");
        // fs.createReadStream(vidName).pipe(zlib.createGzip()).pipe(res);
        const data = fs.createReadStream(vidName);
        // data.pipe(zlib.createGzip()).pipe(res);
        // data.on("data", chunk => res.write(chunk));
        // data.on("end", () => res.end());
        data.pipe(res);
        // res.writeHead(200, { "Content-Type": "text/plain" }).end(vidName);
    } 
    else if (thisUrl.pathname === "/uploadbusboy") {

        if (req.method === "POST") {
            const bb = busboy({ headers: req.headers });

            bb.on("file", (name, file, info) => {
                const { filename, encoding, mimeType } = info;
    
                console.log(`File [${name}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);
    
                file.on("data", data => {
                    console.log(`File [${name}] got ${data.length} bytes`);
                }).on("close", () => console.log(`File [${name}] done`));
            });
    
            bb.on("field", (name, val, info) => {
                console.log(`Field [${name}]: value ${val}`);
            }).on("close", () => {
                console.log("Done parsing form");
                res.writeHead(200, { Connection: "close", Location: "/" }).end();
            });
            req.pipe(bb);
        }
        else if (req.method === "GET") {
            res.writeHead(200, { Connection: "close" });
            res.end(`
                <html>
                    <head></head>
                    <body>
                        <form method="POST" enctype="multipart/form-data">
                            <input type="file" name="fieldfield"></br>
                            <input type="text" name="textfield"></br>
                            <input type="submit">
                        </form>
                    </body>
                </html>
            `)
        };
        // const buffArray = []
        // req.on("data", chunk => {
        //     console.log(req.headers);
        //         buffArray.push(chunk)
        //         // console.log(Buffer.from((chunk)).toString());
        // });
        
        // req.on("end", () => {
        //     const resCon = Buffer.concat(buffArray).toLocaleString();
        //     // console.log(resCon);
        //     const resO = resCon.match(/Content-Disposition: form-data; name="image"; filename="(?:[^"]|"")*" Content-Type: image\/jpeg/)
        //     console.log(resO);
        //     res.statusCode = 200;
        //     res.setHeader("Content-Type", "text/html").end(`<h1>OK ${resCon.match(/filename/)}</h1>`);
        // });
    }
    else if (thisUrl.pathname === "/uploadformid") {
        if (req.method === "GET") {
            res.writeHead(200, { Connection: "close" });
            res.end(`
                <html>
                    <head></head>
                    <body>
                        <form method="POST" action="http://localhost:4000/uploadformid" enctype="multipart/form-data">
                            <input type="file" name="fieldfield"></br>
                            <input type="text" name="textfield"></br>
                            <input type="submit">
                        </form>
                    </body>
                </html>
            `)
        }
        else if (req.method === "POST") {
            const options = {
                multiples: false,
                uploadDir: `${__dirname}/formidable-images`,
                keepExtensions: true,
                allowEmptyFiles: false,
                filter: ({ name, originalFilename, mimetype }) => {
                    return mimetype && mimetype.includes("image");
                }
            }

            const form = formidable(options);

            form.parse(req, (err, fields, file) => {
                if (err) {
                    res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
                    res.end(String(err));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ fields, file }, null, 2));
            });
            return;
        };
    } else if (thisUrl.pathname === "/imagehtml" && req.method === "GET") {
        res.writeHead(200, { "Content-Type" : "text/html" });
        res.write(`
            <html>
                <head></head>
                <body>
                    <img src="http://localhost:4000/image/a0306263869df9951c68d0c00.jpg" alt="image">
                </body>
            </html>
        `);
        res.end();
    }
    else if (thisUrl.pathname.match(/\/image\/[a-zA-Z0-9]+\.jpg/i) && req.method) {
        const image = fs.createReadStream(`${__dirname}/formidable-images/${thisUrl.pathname.split("/")[2]}`);
        image.on("error", err => console.error(err));
        image.pipe(res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});