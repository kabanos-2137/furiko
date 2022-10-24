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

	let _valid = _query.length > 0;

	res.send({
		correct: (_valid ? true : false),
		id: (_valid ? _query[0].id : undefined)
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

	let _valid = _userQuery.length > 0 && _codeQuery.length > 0 && _deviceQuery.length > 0 && _permissionsQuery.length == 0;

	res.send({
		correct: (_valid ? true : false),
		deviceId: (_valid ? _deviceQuery[0].id : undefined)
	}); //Check if there are any results of the query and on this basis send data to user
});

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
	let _deviceId = req.params.deviceId;
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

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
}) //Start app
