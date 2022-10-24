<template>
  <div id="container">
    <TitleBarVue/>
    <LogInVue/>
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
    }
  }
</script>

<style>
  body, html{
    background-color: #5c5c5c;
  }
</style>
