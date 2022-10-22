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

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
}) //Start app
