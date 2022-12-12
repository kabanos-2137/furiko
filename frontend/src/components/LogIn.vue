<template>
    <div v-if="(!createAcc)" id="log-in-container">
        <input type="text" v-model="username" placeholder="Username"/>
        <input type="password" v-model="password" placeholder="Password"/>
        <input type="submit" value="Log In" @click="logIn"/>
        <a id="log-in-create-acc" v-on:click="(createAcc=true)">Don't have an account</a>
        <p v-if="(loginErr == 1)" id="err">Wrong username or password</p>
        <p v-else-if="(loginErr == 2)" id="err">Please verify your e-mail</p>
    </div> 
    <div v-else-if="(createAcc && !accCreated)" id="create-acc-container">
        <input type="text" v-model="newUsername" placeholder="Username"/>
        <input type="password" v-model="newPassword" placeholder="Password"/>
        <input type="password" v-model="newPasswordConfirm" placeholder="Confirm password"/>
        <input type="email" v-model="newEmail" placeholder="E-mail"/>
        <input type="submit" value="Create new account" @click="createAccount"/>
        <p v-if="(accCreateErr == 1)" id="err">Passwords are not the same</p>
        <p v-else-if="(accCreateErr == 2)" id="err">Data is already used</p>
        <p v-else-if="(accCreateErr == 3)" id="err">Fields cannot be empty</p>
        <a id="create-acc-back" @click="goBack">Go back</a>
    </div>
    <div v-else id="acc-created-container">
        <p>A confirmation email has been sent to: {{newEmail}}</p>
        <a id="create-acc-back" @click="goBack">Go back</a>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'LogIn',
        data(){
            return{
                username: "",
                password: "",
                createAcc: false,
                accCreated: false,
                newUsername: "",
                newPassword: "",
                newPasswordConfirm: "",
                newEmail: "",
                accCreateErr: 0,
                loginErr: 0
            }
        },
        methods: {
            logIn(){
                const data = {
                    username: this.username,
                    password: this.password
                }

                axios.post("http://localhost:1503/login/", data)
                    .then(response => {
                        let _correct = response.data.correct
                        if(_correct){
                            this.updatePassword(this.password)
                            this.updateUserId(response.data.id)
                            this.updateUsername(this.username)
                        }else{
                            this.loginErr = response.data.wrong
                        }
                    })
            },
            createAccount(){
                const data = {
                    username: this.newUsername,
                    password: this.newPassword,
                    confPassword: this.newPasswordConfirm,
                    email: this.newEmail
                }

                axios.post("http://localhost:1503/create_acc/", data)
                    .then(response => {
                        let _correct = response.data.correct
                        if(_correct){
                            this.accCreated = true
                        }else{
                            this.accCreateErr = response.data.wrong
                        }
                    })
            },
            goBack(){
                this.username = ""
                this.password = ""
                this.createAcc = false
                this.accCreated = false
                this.newUsername = ""
                this.newPassword = ""
                this.newPasswordConfirm = ""
                this.newEmail = ""
                this.accCreateErr = 0
                this.loginErr = false
            },
            updatePassword(password){
                this.$emit('updatePassword', password)
            },
            updateUserId(userId){
                this.$emit('updateUserId', userId)
            },
            updateUsername(username){
                this.$emit('updateUsername', username)
            }
        }
    }
</script>

<style>
    #log-in-container, #acc-created-container, #create-acc-container{
        margin-top: 25px;
        height: auto;
        width: 25%;
        margin-left: auto;
        margin-right: auto;
        border: 2px solid #51c1e6;
        border-radius: 25px;
    }

    #log-in-container > input, #create-acc-container > input{
        width: 60%;
        display: block;
        margin-left: auto;
        margin-right: auto;
        border-radius: 25px;
        background-color: #887a7a;
        color: #000000;
        border-style: none;
        height: 25px;
        margin-top: 10px;
        margin-bottom: 10px;
        text-indent: 5px;
    }

    #log-in-container > input::placeholder, #create-acc-container > input::placeholder{
        color: white;
        transition: color 0.5s;
    }

    #log-in-container > input:hover::placeholder, #create-acc-container > input:hover::placeholder{
        color: black
    }

    #log-in-create-acc, #create-acc-back{
        display: block;
        margin-left: auto;
        margin-right: auto;
        color: rgb(82, 163, 198);
        width: auto;
        text-align: center;
        padding-bottom: 10px;
        text-decoration: underline;
    }

    #err{
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: auto;
        text-align: center;
        padding-bottom: 10px;
        text-decoration: underline;
        color: red;
    }

    #acc-created-container > p{
        text-align: center;
    }
</style>