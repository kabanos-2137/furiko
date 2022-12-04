<template>
    <div id="log-in-container">
        <input type="text" v-model="username" placeholder="username"/>
        <input type="password" v-model="password" placeholder="password"/>
        <input type="submit" value="Log In" @click="logIn"/>
    </div> 
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'LogIn',
        data(){
            return{
                username: "",
                password: ""
            }
        },
        methods: {
            logIn(){
                const data = {
                    username: this.username,
                    password: this.password
                }

                const headers = {}

                axios.post("http://localhost:1503/login/", data, { headers })
                    .then(response => {
                        let _correct = response.data.correct
                        if(_correct){
                            this.updatePassword(this.password)
                            this.updateUserId(response.data.id)
                            this.updateUsername(this.username)
                        }
                    })
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
    #log-in-container{
        margin-top: 25px;
        height: auto;
        width: 25%;
        margin-left: auto;
        margin-right: auto;
        border: 2px solid #51c1e6;
        border-radius: 25px;
    }

    #log-in-container > input{
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
    }

    #log-in-container > input::placeholder{
        color: white;
    }
</style>