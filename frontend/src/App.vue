<template>
  <div id="container">
    <TitleBarVue v-on:updatePassword="updatePassword" v-on:updateUserId="updateUserId"/>
    <LogInVue v-on:updatePassword="updatePassword" v-on:updateUserId="updateUserId"/>
  </div>
</template>

<script>
  import TitleBarVue from './components/TitleBar.vue';
  import LogInVue from './components/LogIn.vue'

  export default {
    name: 'App',
    components: {
      TitleBarVue,
      LogInVue
    },
    data(){
      return{
        userId: "",
        password: ""
      }
    },
    methods: {
      updatePassword(password){
        this.password = password
      },
      updateUserId(userId){
        this.userId = userId
      }
    }  
  }
</script>

<style>
  body, html{
    background-color: #5c5c5c;
  }
</style>
