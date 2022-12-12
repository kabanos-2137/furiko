<template>
  <div id="container">
    <TitleBarVue :userId="userId" :password="password" :username="username"/>
    <LogInVue v-if="((!userId || !password) && !(code))" v-on:updatePassword="updatePassword" v-on:updateUserId="updateUserId" v-on:updateUsername="updateUsername"/>
    <VerifCodeVue v-else-if="(codeExists)" :code="code" v-on:verifEnded="verifEnded"/>
    <MainMenuVue v-else/>
  </div>
</template>

<script>
  import TitleBarVue from './components/TitleBar.vue';
  import LogInVue from './components/LogIn.vue'
  import MainMenuVue from './components/MainMenu.vue'
  import VerifCodeVue from './components/VerifCode.vue'
  import { Buffer } from 'buffer';

  export default {
    name: 'App',
    components: {
      TitleBarVue,
      LogInVue,
      MainMenuVue,
      VerifCodeVue
    },
    data(){
      return{
        userId: "",
        password: "",
        username: "",
        code: 0,
        codeExists: false
      }
    },
    mounted() {
      let uri = window.location.search.substring(1); 
      let params = new URLSearchParams(uri);
      if(params.get("code")){
        this.code = Buffer.from(params.get("code"), 'base64')
        this.codeExists = true
        console.log(this)
      }
    },
    methods: {
      updatePassword(password){
        this.password = password
      },
      updateUserId(userId){
        this.userId = userId
      },
      updateUsername(username){
        this.username = username
      },
      verifEnded(){
        this.userId = ""
        this.password = ""
        this.username = ""
        this.code = 0
        this.codeExists = false
      }
    }  
  }
</script>

<style>
  body, html{
    background-color: #5c5c5c;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>
