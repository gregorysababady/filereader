document.getElementById("uploadButton").addEventListener("click", () => {
	const fileInput = document.getElementById("fileInput");
	const file = fileInput.files[0];
	const formData = new FormData();
	formData.append("file", file);

	fetch("http://192.168.0.1:3001/upload", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("name").innerText = data.name || "Not found";
			document.getElementById("surname").innerText =
				data.surname || "Not found";
			document.getElementById("idNumber").innerText =
				data.idNumber || "Not found";
		})
		.catch((error) => {
			console.error("Error uploading the file:", error);
		});
});
