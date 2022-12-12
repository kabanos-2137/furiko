//imports
import express from 'express';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer'

dotenv.config() //Initialize enviromental variables

const app = express(); //Initialize app
const port = process.env.PORT; //Set app port

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

app.post('/', (req, res) => { //Test database
	res.send(database.data); //Send database data
});

app.post('/login', (req, res) => { //Login Request
	//Data sent by user
	let _username = req.body.username;
	let _password = req.body.password;

	let _wrong = 0

	let _query = database.data.users.filter(el => //Find the user in db
		el.username == _username && //Check if username is valid
		el.password == _password//Check if password is valid
	);

	if(_query.length <= 0){
		_wrong = 1
	}else if(!_query[0].verified){
		_wrong = 2
	}

	let _valid = _query.length > 0 && _query[0].verified
	res.send({
		correct: (_valid ? true : false),
		id: (_valid ? _query[0].id : undefined),
		wrong: (!_valid ? _wrong : undefined),
	}); //Check if there are any results of the query and on this basis send data to user
});

app.post('/get_devices', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.password == _password && //Check if password is valid
		el.id == _userId //Check if user id is valid
	);
	let _devicesQuery = [] //Find the devices
	let _devices = [] //Filter the devices data

	if(_userQuery.length > 0){
		_devicesQuery = database.data.devices.filter(el => //Find the devices
			el.permissions.filter(el => 
				el.userId == _userId && //Check if user id is valid
				(el.type == "admin" || 
				el.type == "user") //Check users permissions
			).length > 0 //Check if user has permissions to this device
		);
		
		if(_devicesQuery.length > 0){
			_devicesQuery.forEach(el => {
				_devices.push({ //Filter the devices data
					id: el.id,
					name: el.settings.name
				});
			});
		}
	}

	let _valid = _userQuery.length > 0 && _devices.length > 0;

	res.send({
		correct: (_valid ? true : false),
		devices: (_valid ? _devices : undefined)
	}); // Check if there are any results of the query and on this basis send data to user
})

app.post('/get_settings', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;
	let _deviceId = req.body.deviceId;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.id == _userId && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _deviceQuery = []; //Find the device
	let _permissionsQuery = []; //Find permissions for device

	if(_userQuery.length > 0){
		_deviceQuery = database.data.devices.filter(el => //Find the device
			el.id == _deviceId && //Check if the device id is valid
			el.permissions.filter(el => //Check if user has permission to this device
				el.userId == _userId
			)	
		);

		_permissionsQuery = _deviceQuery[0].permissions.filter(el => //Find permissions for device
			el.userId == _userId
		);
	}

	let _valid = _userQuery.length > 0 && _deviceQuery.length > 0 && _permissionsQuery.length > 0;


	res.send({
		correct: (_valid ? true : false),
		permissions: (_valid ? _permissionsQuery[0].type : undefined),
		settingsData: (_valid ? _deviceQuery[0].settings : undefined)
	}); //Check if there are any results of the query and on this basis send data to user
});

app.post('/set_settings', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;
	let _deviceId = req.body.deviceId;
	let _settings = req.body.settingsData;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.id == _userId && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _deviceQuery = []; //Find the device

	if(_userQuery.length > 0){
		_deviceQuery = database.data.devices.filter(el => //Find the device
			el.id == _deviceId && //Check if the device id is valid
			el.permissions.filter(el => //Check if user has permission to this device
				el.userId == _userId
			)	
		);

		if(_deviceQuery.length > 0){
			database.data.devices.find(el => {
				return el.id == _deviceId
			}).settings = _settings; //Change the settings to the new one
			database.write(); //Save the database
		}
	}

	let _valid = _userQuery.length > 0 && _deviceQuery.length > 0;

	res.send({
		correct: (_valid ? true : false),
		settingsData: (_valid ? _deviceQuery[0].settings : undefined)
	}); //Check if there are any results of the query and on this basis send data to user
});

app.post('/invite', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;
	let _code = req.body.code;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.id == _userId && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _codeQuery = []; //Find the code
	let _deviceQuery = []; //Find the device
	let _permissionsQuery = []; //Find the permissions

	if(_userQuery.length > 0){
		_codeQuery = database.data.invites.filter(el =>  //Find the code
			el.code == _code
		);

		if(_codeQuery.length > 0){
			if(_codeQuery[0].deviceId){
				_deviceQuery = database.data.devices.filter(el => //Find the device
					el.id == _codeQuery[0].deviceId
				);

				if(_deviceQuery.length > 0){
					_permissionsQuery = _deviceQuery[0].permissions.filter(el => //Check if user already has permissions for this device
						el.userId == _userId
					)
	
					if(_permissionsQuery.length == 0){
						_deviceQuery[0].permissions.push({ //Update permissions for a device
							userId: _userId,
							type: (_code.toString()[0] == "1" ? "admin" : "user")
						});
					}
	
					if(_code.toString()[0] == "1"){ //If it is a admin invite, it is immediatly deleted
						database.data.invites = database.data.invites.filter(el => 
							el.code != _code
						);
						database.write();
					}else{ //If it is a user invite, it is deleted after 24 hours
						setTimeout(() => {
							database.data.invites = database.data.invites.filter(el => 
								el.code != _code
							);
							database.write();
						}, 1440000)
					}
				}
			}
		}
	}

	let _valid = _userQuery.length > 0 && _codeQuery.length > 0 && _deviceQuery.length > 0 && _permissionsQuery.length == 0;

	res.send({
		correct: (_valid ? true : false),
		deviceId: (_valid ? _deviceQuery[0].id : undefined)
	}); //Check if there are any results of the query and on this basis send data to user
});

app.post('/verif', (req, res) => {
	let _username = req.body.username;
	let _password = req.body.password;
	let _code = Buffer.from(req.body.code, 'base64');

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.username == _username && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _codeQuery = []
	let _wrong = 0

	if(_userQuery.length > 0){
		_codeQuery = database.data.invites.filter(el =>  //Find the code
			el.code == _code &&
			_userQuery[0].id == el.userId
		);

		if(_codeQuery.length > 0){
			if(_codeQuery[0].code.toString()[0] == "2"){
				database.data.invites = database.data.invites.filter(el =>  //Find the code
					el.code != _code
				);
				database.data.users.find(el => { return el.username == _username }).verified = true
				database.write();
			}else{
				_wrong = 3;
			}
		}else{
			_wrong = 2;
		}
	}else{
		_wrong = 1;
	}

	let _valid = _userQuery.length > 0 && _codeQuery.length > 0 && _codeQuery[0].code.toString()[0] == "2";

	res.send({
		correct: (_valid ? true : false),
		wrong: (!_valid ? _wrong : undefined),
	})
})

app.post('/generate_invite_user', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;
	let _deviceId = req.body.deviceId;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.id == _userId && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _deviceQuery = []; //Find the device
	let _randCode; //Generate random code

	if(_userQuery.length > 0){
		_deviceQuery = database.data.devices.filter(el => //Find the device
			el.id = _deviceId &&
			el.permissions.filter(el => 
				el.type == "admin" &&
				el.userId == _userId
			).length > 0
		);

		if(_deviceQuery.length > 0){
			do{ //Until code is unique, generate new code
				_randCode = '0' + Math.floor(Math.random() * 999999).toString()
			}while(database.data.invites.filter(el => 
				el.code == _randCode
			).length > 0);

			database.data.invites.push({ //Push new code to database
				deviceId: _deviceId,
				code: _randCode
			});
			database.write(); //Save the db
		}
	}

	let _valid = _userQuery.length > 0 && _deviceQuery.length > 0;

	res.send({
		correct: (_valid ? true : false),
		code: (_valid ? _randCode : undefined)
	}); //Send code to user
});

app.post('/generate_invite_admin', (req, res) => {
	let _deviceId = 0; //Generate device id
	let _randCode; //Generate invite code

	do{
		_deviceId++; // Generate new ids until id is not taken
	}while(database.data.devices.filter(el =>
		el.id == _deviceId
	).length > 0);

	database.data.devices.push({ //Push new device to db
		id: _deviceId,
		permissions: [],
		settings: {
			unit: "metric",
			name: "New Furiko"
		}
	});

	do{ //Until code is unique, generate new code
		_randCode = '1' + Math.floor(Math.random() * 999999).toString()
	}while(database.data.invites.filter(el => 
		el.code == _randCode
	).length > 0);

	database.data.invites.push({ //Push new code to database
		deviceId: _deviceId,
		code: _randCode
	});
	database.write(); //Save the db

	res.send({
		correct: true,
		code: _randCode,
		deviceId: _deviceId
	}); //Send data to device
});

app.post('/set_data', (req, res) => {
	//Data sent by user
	let _deviceId = req.body.deviceId;
	let _data = req.body.data;
	
	let _deviceQuery = database.data.devices.filter(el => //Find the device
		el.id == _deviceId	
	);
	
	if(_deviceQuery.length > 0) {
		if(_deviceQuery[0].data.length > 75){ //Check if there are too many data entries
			database.data.devices.find(el => { return el.id == _deviceId }).dataFromDevice.shift();//Remove the excess
		}

		database.data.devices.find(el => { return el.id == _deviceId }).dataFromDevice.push(_data); //Push the data
		database.write(); //Save the db
	}

	let _valid = _deviceQuery.length > 0

	res.send({
		correct: (_valid ? true : false)
	}); //Send information about correctness of the process
});

app.post('/get_data', (req, res) => {
	//Data sent by user
	let _userId = req.body.userId;
	let _password = req.body.password;
	let _deviceId = req.body.deviceId;

	let _userQuery = database.data.users.filter(el => //Find the user in db
		el.id == _userId && //Check if the user id is valid
		el.password == _password	//Check if the password is valid
	);
	let _deviceQuery = []; //Find the device
	let _dataQuery; //Get the data

	if(_userQuery.length > 0){
		_deviceQuery = database.data.devices.filter(el => //Find the device
			el.id = _deviceId &&
			el.permissions.filter(el => 
				el.userId == _userId
			).length > 0
		);

		if(_deviceQuery.length > 0){
			_dataQuery = _deviceQuery[0].data.slice(-1)[0]; // Get data from db
		}
	}

	let _valid = _userQuery.length > 0 && _deviceQuery.length > 0 && _dataQuery != undefined;
	res.send({
		correct: (_valid ? true : false),
		data: (_valid ? _dataQuery : undefined)
	}); //Send code to user
})

app.post('/create_acc', async (req, res) => {
	//Data sent by user
	let _username = req.body.username;
	let _password = req.body.password;
	let _confPassword = req.body.confPassword;
	let _email = req.body.email;

	let _query = [];
	let _wrong = 0;
	let _userId;

	if(_username && _password && _confPassword && _email){
		if(_password == _confPassword){
			_query = database.data.users.filter(el => 
				el.username == _username ||
				el.email == _email
			)
	
			if(_query.length == 0){
				_userId = 0;
	
				do{
					_userId++; // Generate new ids until id is not taken
				}while(database.data.users.filter(el =>
					el.id == _userId
				).length > 0);
	
				database.data.users.push({
					id: _userId,
					username: _username,
					password: _password,
					email: _email,
					verified: false
				})

				let _randCode;

				do{ //Until code is unique, generate new code
					_randCode = '2' + Math.floor(Math.random() * 999999).toString()
				}while(database.data.invites.filter(el => 
					el.code == _randCode
				).length > 0);

				database.data.invites.push({
					userId: _userId,
					code: _randCode
				})

				database.write();

				let _transporter = nodemailer.createTransport({
					host: "smtp.gmail.com",
					port: 587,
					secure: false,
					auth: {
						user: process.env.MAILUSER,
						pass: process.env.MAILPASS
					}
				});
				
				await _transporter.sendMail({
					to: _email, // list of receivers
					subject: "Code ✔", // Subject line
					html: `Code: <a href="http://localhost:1503/?code=${Buffer.from(_randCode).toString("base64")}">http://localhost:1503/?code=${Buffer.from(_randCode).toString("base64")}</a>`, // html body
				});
			}else{
				_wrong = 2;
			}
		}else{
			_wrong = 1;
		}
	}else{
		_wrong = 3;
	}

	let _valid = _username && _password && _confPassword && _email && _password == _confPassword && _query.length == 0;
	res.send({
		correct: (_valid ? true : false),
		wrong: (!_valid ? _wrong : undefined),
		userId: (_valid ? _userId : undefined)
	});
})

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
}) //Start app
