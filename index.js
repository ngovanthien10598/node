const http = require('http');
const https = require('https');
const nodeStatic = require('node-static');
const fs = require('fs');
const mysql = require('mysql');
const fileServer = new nodeStatic.Server("./download");

const image1 = "https://cdn-media-1.freecodecamp.org/images/1*DF0g7bNW5e2z9XS9N2lAiw.jpeg";
const image2 = "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/256/full/nodejslogo.png";
const image3 = "https://miro.medium.com/max/365/1*Jr3NFSKTfQWRUyjblBSKeg.png";

const imageName1 = "nodejs.jpeg";
const imageName2 = "nodejslogo.png";
const imageName3 = "express.png";

// Download images and save to download
https.get(image1, response => {
  response.pipe(fs.createWriteStream("./download/" + imageName1));
});

https.get(image2, response => {
  response.pipe(fs.createWriteStream("./download/" + imageName2));
});

https.get(image3, response => {
  response.pipe(fs.createWriteStream("./download/" + imageName3));
});

// Connect to MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodejs"
});


connection.connect((error) => {
  if (error) throw error;
  console.log("Connected to MySQL");
});


// Create database
connection.query("CREATE DATABASE IF NOT EXISTS nodejs", (error, result) => {
  if (error) throw error;
  console.log("Database created");
});



// Drop table
connection.query("DROP TABLE IF EXISTS nodejs.images", (error, result) => {
  if (error) throw error;
  console.log("Table dropped");
});


// Create table
connection.query("CREATE TABLE IF NOT EXISTS images(id INT PRIMARY KEY AUTO_INCREMENT, path VARCHAR(50))", (error, result) => {
  if (error) throw error;
  console.log("Table created");
});


// Insert images into database
const insertStatement = `INSERT INTO images(path) VALUES ?`;
const host = "http://localhost:3000/";
const data = [
  [host + imageName1],
  [host + imageName2],
  [host + imageName3],
];
connection.query(insertStatement, [data], (error, results, fields) => {
  if (error) throw error;
  console.log(results.affectedRows + " rows affected");
})



/// Get data from database
// use callback
connection.query("SELECT * FROM images", (error, results) => {
  if (error) console.log(error);
  console.log("=========== Callback ===========")
  console.log(results);
})


// Create promise-based function
function getData() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM images", (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    })
  })
}


// use Promise
getData()
.then(results => {
  console.log("=========== Promise ===========")
  console.log(results);
})
.catch(error => {
  console.log(error);
})


// use async/await
async function getDataWithAsyncAwait() {
  try {
    const results = await getData();
    console.log("=========== async/await ===========")
  console.log(results);
  } catch (error) {
    console.log(error);
  }
}
getDataWithAsyncAwait();



// Create server
http.createServer((req, res) => {
  req.addListener('end', () => {
    fileServer.serve(req, res);
  }).resume();
}).listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
})