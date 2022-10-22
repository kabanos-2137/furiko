//imports
import express from 'express';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express(); //Initialize app
const port = 8079; //Set app port

const database = new Low(
	new JSONFile(
		'./data.json'
	)
); //Initialize database

//Use body parser
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());

await database.read(); //Get database
database.data ||= {} //Set database if empty

app.post('/test', (req, res) => { //Test database
	res.send(database.data); //Send database data
});

app.post('/login', (req, res) => { //Login Request
	//Data sent by user
	let _username = req.body.username;
	let _password = req.body.password;

	let _query = database.data.users.filter(el => //Find the user in db
		el.username == _username && //Check if username is valid
		el.password == _password //Check if password is valid
	);

	let _valid = _query.length > 0

	res.send({
		correct: (_valid ? true : false),
		id: (_valid ? _query[0].id : undefined)
	}); //Check if there are any results of the query and on this basis send data to user
});

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
}) //Start app
