const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const { createWorker } = require("tesseract.js");

// const connection = require("../connection.js");

const app = express();
const port = 3001;

// app.get("/", async (req, res) => {
// 	try {
// 		const conn = await connection();
// 		conn.query("SELECT 1 + 1 AS solution", (err, data) => {
// 			if (err) {
// 				console.error("Error executing query:", err);
// 				res.status(500).send("Error executing query");
// 			} else {
// 				res.send(`The solution is: ${data[0].SOLUTION}`);
// 			}
// 			conn.close(() => {
// 				console.log("Connection closed");
// 			});
// 		});
// 	} catch (err) {
// 		res.status(500).send("Error connecting to the database");
// 	}
// });

const uploadsDir = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Disable strict MIME type checking
app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	next();
});

// Serve frontend files with custom headers
app.use(
	express.static(path.join(__dirname, "../frontend"), {
		setHeaders: (res, filePath) => {
			if (filePath.endsWith(".css")) {
				res.setHeader("Content-Type", "text/css");
			} else if (filePath.endsWith(".js")) {
				res.setHeader("Content-Type", "text/javascript");
			}
		},
	})
);

app.post("/upload", (req, res) => {
	upload.single("file")(req, res, async (err) => {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			console.error("Multer error:", err);
			return res
				.status(500)
				.json({ error: "Multer error occurred during file upload" });
		} else if (err) {
			// An unknown error occurred when uploading.
			console.error("Unknown error:", err);
			return res
				.status(500)
				.json({ error: "Unknown error occurred during file upload" });
		}

		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		const filePath = path.resolve(req.file.path);
		const fileType = path.extname(filePath).toLowerCase();

		performOCR(fs.readFileSync(filePath));
	});
});

async function performOCR(imageFile) {
	const worker = await createWorker("eng");
	const ret = await worker.recognize(imageFile);
	await worker.terminate();
	console.log(ret.data.text);
}

function processText(text, res) {
	const nameMatch = text.match(/Name:\s*(\w+)/i);
	const surnameMatch = text.match(/Surname:\s*(\w+)/i);
	const idMatch = text.match(/ID Number:\s*(\w+)/i);

	res.json({
		name: nameMatch ? nameMatch[1] : null,
		surname: surnameMatch ? surnameMatch[1] : null,
		idNumber: idMatch ? idMatch[1] : null,
	});
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
