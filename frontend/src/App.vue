<template>
  <div id="container">
    <TitleBarVue :userId="userId" :password="password" :username="username"/>
    <LogInVue v-if="(!userId || !password)" v-on:updatePassword="updatePassword" v-on:updateUserId="updateUserId" v-on:updateUsername="updateUsername"/>
    <MainMenuVue v-else/>
  </div>
</template>

<script>
  import TitleBarVue from './components/TitleBar.vue';
  import LogInVue from './components/LogIn.vue'
  import MainMenuVue from './components/MainMenu.vue'

  export default {
    name: 'App',
    components: {
      TitleBarVue,
      LogInVue,
      MainMenuVue
    },
    data(){
      return{
        userId: "",
        password: "",
        username: ""
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
