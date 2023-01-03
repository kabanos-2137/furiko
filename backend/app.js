var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//imports
import express from 'express';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
dotenv.config();
const app = express();
const port = Number(process.env.PORT);
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
db.read();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.post('/', (req, res) => {
    res.send(db.data);
});
app.post('/login', (req, res) => {
    let wrong = 0;
    let query = db.data.users.filter(el => el.username == req.body.username && el.password == req.body.password);
    if (query.length <= 0) {
        wrong = 1;
    }
    else if (!query[0].verified) {
        wrong = 2;
    }
    let valid = query.length > 0 && query[0].verified;
    res.send({
        correct: valid,
        id: (valid ? query[0].id : undefined),
        wrong: (valid ? undefined : wrong)
    });
});
app.post('/get_devices', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let devicesQuery = [];
    let devices = [];
    if (userQuery.length > 0) {
        devicesQuery = db.data.devices.filter(el => el.permissions.filter(el => el.userId == req.body.userId && (el.type == "admin" || el.type == "user")).length > 0);
        if (devicesQuery.length > 0) {
            devicesQuery.forEach(el => {
                devices.push({
                    id: el.id,
                    name: el.settings.name
                });
            });
        }
    }
    let valid = userQuery.length > 0 && devices.length > 0;
    res.send({
        correct: valid,
        devices: (valid ? devices : undefined)
    });
});
app.post('/get_settings', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let deviceQuery = [];
    let permissionsQuery = [];
    if (userQuery.length > 0) {
        deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.userId == req.body.userId).length > 0);
        if (deviceQuery.length > 0) {
            permissionsQuery = deviceQuery[0].permissions.filter(el => el.userId == req.body.userId);
        }
    }
    let valid = userQuery.length > 0 && deviceQuery.length > 0 && permissionsQuery.length > 0;
    res.send({
        correct: valid,
        permissions: (valid ? permissionsQuery[0].type : undefined),
        settingsData: (valid ? deviceQuery[0].settings : undefined)
    });
});
app.post('/set_settings', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let deviceQuery = [];
    if (userQuery.length > 0) {
        deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.userId == req.body.userId && el.type == "admin").length > 0);
        if (deviceQuery.length > 0) {
            db.data.devices.find(el => {
                return el.id = req.body.deviceId;
            }).settings = req.body.settingsData;
            db.write();
        }
    }
    let valid = userQuery.length > 0 && deviceQuery.length > 0;
    res.send({
        correct: valid
    });
});
app.post('/invite', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let codeQuery = [];
    let deviceQuery = [];
    let permissionsQuery = [];
    if (userQuery.length > 0) {
        codeQuery = db.data.invites.filter(el => el.code == req.body.code);
        if (codeQuery.length > 0) {
            if (codeQuery[0].deviceId) {
                deviceQuery = db.data.devices.filter(el => el.id == codeQuery[0].deviceId);
                if (deviceQuery.length > 0) {
                    permissionsQuery = deviceQuery[0].permissions.filter(el => el.userId == req.body.userId);
                    if (permissionsQuery.length == 0) {
                        deviceQuery[0].permissions.push({
                            userId: req.body.userId,
                            type: (req.body.code[0] == "1" ? "admin" : "user")
                        });
                    }
                    if (req.body.code[0] == "1") {
                        db.data.invites = db.data.invites.filter(el => el.code != req.body.code);
                        db.write();
                    }
                    else {
                        setTimeout(() => {
                            db.data.invites = db.data.invites.filter(el => { el.code != req.body.code; });
                            db.write();
                        }, 1440000);
                    }
                }
            }
        }
    }
    let valid = userQuery.length > 0 && codeQuery.length > 0 && deviceQuery.length > 0 && permissionsQuery.length == 0;
    res.send({
        correct: valid,
        deviceId: (valid ? deviceQuery[0].id : undefined)
    });
});
app.post('/verif', (req, res) => {
    let decoded = Buffer.from(req.body.code, 'base64').toString('utf-8');
    let userQuery = db.data.users.filter(el => el.username == req.body.username && el.password == req.body.password);
    let codeQuery = [];
    let wrong = 0;
    if (userQuery.length > 0) {
        codeQuery = db.data.invites.filter(el => el.code == decoded && el.id == userQuery[0].id);
        if (codeQuery.length > 0) {
            if (codeQuery[0].code[0] == "2") {
                db.data.invites = db.data.invites.filter(el => el.code != decoded);
                db.data.users.find(el => { return el.username == req.body.username; }).verified = true;
                db.write();
            }
            else {
                wrong = 3;
            }
        }
        else {
            wrong = 2;
        }
    }
    else {
        wrong = 1;
    }
    let valid = userQuery.length > 0 && codeQuery.length > 0 && codeQuery[0].code[0] == "2";
    res.send({
        correct: valid,
        wrong: (valid ? undefined : wrong)
    });
});
app.post('/generate_invite_user', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let deviceQuery = [];
    let randCode;
    if (userQuery.length > 0) {
        deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.type == "admin" && el.userId == req.body.userId).length > 0);
        if (deviceQuery.length > 0) {
            do {
                randCode = '0' + Math.floor(Math.random() * 999999).toString();
            } while (db.data.invites.filter(el => el.code == randCode).length > 0);
            db.data.invites.push({
                id: req.body.deviceId,
                code: randCode
            });
            db.write();
        }
    }
    let valid = userQuery.length > 0 && deviceQuery.length > 0;
    res.send({
        correct: valid,
        code: (valid ? randCode : undefined)
    });
});
app.post('/generate_invite_admin', (req, res) => {
    let deviceId = 0;
    let randCode;
    do {
        deviceId++;
    } while (db.data.devices.filter(el => el.id == deviceId).length > 0);
    db.data.devices.push({
        id: deviceId,
        permissions: [],
        settings: {
            unit: "metric",
            name: "New Furiko"
        }
    });
    do {
        randCode = '1' + Math.floor(Math.random() * 999999).toString();
    } while (db.data.invites.filter(el => el.code == randCode).length > 0);
    db.data.invites.push({
        id: deviceId,
        code: randCode
    });
    db.write();
    res.send({
        correct: true,
        code: randCode,
        deviceId: deviceId
    });
});
app.post('/create_session', (req, res) => {
    let userQuery = [];
    let deviceQuery = [];
    let wrong = 0;
    let sessionId;
    if (req.body.userId && req.body.password && req.body.deviceId && req.body.typeOfGraph && req.body.name) {
        userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
        if (userQuery.length > 0) {
            deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.type == "admin" && el.userId == req.body.userId).length > 0);
            if (deviceQuery.length > 0) {
                sessionId = 0;
                do {
                    sessionId++;
                } while (db.data.sessions.filter(el => el.sessionId == sessionId).length > 0);
                let dataToPush = {
                    deviceId: req.body.deviceId,
                    sessionId: sessionId,
                    typeOfGraph: req.body.typeOfGraph,
                    name: req.body.name,
                    data: []
                };
                db.data.sessions.push(dataToPush);
                db.write();
            }
            else {
                wrong = 3;
            }
        }
        else {
            wrong = 2;
        }
    }
    else {
        wrong = 1;
    }
    let valid = req.body.userId && req.body.password && req.body.deviceId && req.body.typeOfGraph && req.body.name && userQuery.length > 0 && deviceQuery.length > 0;
    res.send({
        correct: valid,
        wrong: (valid ? undefined : wrong),
        sessionId: (valid ? sessionId : undefined)
    });
});
app.post('/end_session', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let deviceQuery = [];
    let sessionQueryIndex;
    if (userQuery.length > 0) {
        deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.type == "admin" && el.userId == req.body.userId).length > 0);
        if (deviceQuery.length > 0) {
            sessionQueryIndex = db.data.sessions.findIndex(el => el.sessionId == req.body.sessionId && el.typeOfGraph == req.body.typeOfGraph && el.deviceId == req.body.deviceId && el.data.length == 0);
            if (sessionQueryIndex >= 0) {
                db.data.sessions[sessionQueryIndex].data = req.body.data;
                db.write();
            }
        }
    }
    let valid = userQuery.length > 0 && deviceQuery.length > 0 && sessionQueryIndex >= 0;
    res.send({
        correct: valid
    });
});
app.post('/get_sessions', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == req.body.password);
    let deviceQueryUser = [];
    let deviceQueryAdmin = [];
    let sessionQuery = [];
    let sessionsList = [];
    if (userQuery.length > 0) {
        deviceQueryAdmin = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.type == "admin" && el.userId == req.body.userId).length > 0);
        deviceQueryUser = db.data.devices.filter(el => el.id == req.body.deviceId && el.permissions.filter(el => el.type == "user" && el.userId == req.body.userId).length > 0);
        if (deviceQueryAdmin.length > 0) {
            sessionQuery = db.data.sessions.filter(el => el.typeOfGraph == req.body.typeOfGraph && el.deviceId == req.body.deviceId);
            sessionQuery.forEach(el => {
                sessionsList.push({
                    sessionsList: el.sessionId,
                    typeOfGraph: el.typeOfGraph,
                    name: el.name
                });
            });
        }
        if (deviceQueryUser.length > 0) {
            sessionQuery = db.data.sessions.filter(el => el.typeOfGraph == req.body.typeOfGraph && el.deviceId == req.body.deviceId && el.data.length > 0);
            sessionQuery.forEach(el => {
                sessionsList.push({
                    sessionId: el.sessionId,
                    typeOfGraph: el.typeOfGraph,
                    name: el.name
                });
            });
        }
    }
    let valid = userQuery.length > 0 && (deviceQueryAdmin.length > 0 || deviceQueryUser.length > 0);
    res.send({
        correct: valid,
        sessions: (valid ? sessionsList : undefined)
    });
});
app.post('/get_session', (req, res) => {
    let userQuery = db.data.users.filter(el => el.id == req.body.userId && el.password == el.password);
    let deviceQuery = [];
    let sessionQuery = [];
    let sessionId;
    let typeOfGraph;
    let name;
    let data;
    if (userQuery.length > 0) {
        deviceQuery = db.data.devices.filter(el => el.id == req.body.deviceId && (el.permissions.filter(el => el.type == "admin" && el.userId == req.body.userId) || el.permissions.filter(el => el.type == "user" && el.userId == req.body.userId)));
        if (deviceQuery.length > 0) {
            sessionQuery = db.data.sessions.filter(el => el.deviceId == req.body.deviceId && el.sessionId == req.body.sessionId && el.typeOfGraph == req.body.typeOfGraph);
            if (sessionQuery.length > 0) {
                sessionId = sessionQuery[0].sessionId;
                typeOfGraph = sessionQuery[0].typeOfGraph;
                name = sessionQuery[0].name;
                data = sessionQuery[0].data;
            }
        }
    }
    let valid = userQuery.length > 0 && deviceQuery.length > 0 && sessionQuery.length > 0;
    res.send({
        correct: valid,
        sessionId: (valid ? sessionId : undefined),
        typeOfGraph: (valid ? typeOfGraph : undefined),
        name: (valid ? name : undefined),
        data: (valid ? data : undefined)
    });
});
app.post('/create_acc', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let query = [];
    let wrong = 0;
    let userId = 0;
    if (req.body.username && req.body.password && req.body.confPassword && req.body.email) {
        if (req.body.password == req.body.confPassword) {
            query = db.data.users.filter(el => el.username == req.body.username || el.email == req.body.email);
            if (query.length == 0) {
                do {
                    userId++;
                } while (db.data.users.filter(el => el.id == userId).length > 0);
                db.data.users.push({
                    id: userId,
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    verified: false
                });
                let randCode;
                do {
                    randCode = '2' + Math.floor(Math.random() * 999999).toString();
                } while (db.data.invites.filter(el => el.code == randCode).length > 0);
                db.data.invites.push({
                    id: userId,
                    code: randCode
                });
                db.write();
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.MAILUSER,
                        pass: process.env.MAILPASS
                    }
                });
                yield transporter.sendMail({
                    to: req.body.email,
                    subject: "Code ✔",
                    html: `Code: <a href="http://localhost:1503/?code=${Buffer.from(randCode).toString("base64")}">http://localhost:1503/?code=${Buffer.from(randCode).toString("base64")}</a>`,
                });
            }
            else {
                wrong = 1;
            }
        }
        else {
            wrong = 2;
        }
    }
    else {
        wrong = 3;
    }
    let valid = req.body.username && req.body.password && req.body.confPassword && req.body.email && req.body.password == req.body.confPassword && query.length == 0;
    res.send({
        correct: valid,
        wrong: (valid ? undefined : wrong),
        userId: (valid ? userId : undefined)
    });
}));
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
