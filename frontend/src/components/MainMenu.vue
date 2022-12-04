<template>
  <div id="main-menu-container">
    <div id="main-menu-sidebar">
      <div id="0" class="main-menu-sidebar-element selected" v-on:click="changeTab(0)">
        Lorem   
      </div>
      <div id="1" class="main-menu-sidebar-element" v-on:click="changeTab(1)">
        Ipsum
      </div>
      <div id="2" class="main-menu-sidebar-element" v-on:click="changeTab(2)">
        Dolor
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'MainMenu',
    methods: {
      changeTab(tab){
        Array.from(document.getElementById("main-menu-sidebar").children).forEach(element => {
          if(tab == element.id) element.classList.add('selected')
          else element.classList.remove('selected')
        });
      }
    }
  }
</script>

<style scoped>
  #main-menu-container{
    margin-top: 25px;
    height: auto;
    width: calc(75% - 4px);
    margin-left: auto;
    margin-right: auto;
    border: 2px solid #51c1e6;
    border-radius: 25px;
    background-color: #51c1e6;
  }

  #main-menu-sidebar{
    width: calc(25% - 2px);
    border-radius: 25px 0 0 25px;
    border-right: 2px solid #51c1e6;
    background-color: #5c5c5c;
  }

  .main-menu-sidebar-element{
    height: auto;
    text-align: center;
    padding-top: 9px;
    padding-bottom: 9px;
    border-radius: 25px 0 0 25px;
    transition: margin-left 0.5s, background-color 0.5s;
  }

  .main-menu-sidebar-element:hover{
    height: auto;
    text-align: center;
    padding-top: 9px;
    padding-bottom: 9px;
    border-radius: 25px 0 0 25px;
    margin-left: 20px;
    background-color: #73cbe8;
  }
  .main-menu-sidebar-element.selected{
    height: auto;
    text-align: center;
    padding-top: 9px;
    padding-bottom: 9px;
    border-radius: 25px 0 0 25px;
    margin-left: 20px;
    background-color: #51c1e6;
  }
</style>