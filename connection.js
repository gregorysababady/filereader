const { Connection, Statement, IN, NUMERIC, CHAR } = require("idb-pconnector");

async function runQuery() {
	const connection = new Connection({
		url: "*LOCAL",
		username: "TESTING",
		password: "GREGTEST",
	});

	try {
		await connection.connect();
		console.log("Connected to IBM i");

		const statement = new Statement(connection);
		const sql = "SELECT CURRENT DATE FROM SYSIBM.SYSDUMMY1";
		const results = await statement.exec(sql);
		for (const row of results) {
			console.log("Results:", JSON.stringify(results));
		}
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await connection.close();
		console.log("Connection closed");
	}
}

runQuery();
