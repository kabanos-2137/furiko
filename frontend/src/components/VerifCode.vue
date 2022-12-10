<template>
  <div id="verif-container">
    <input type="text" :value="code" disabled/>
    <input type="text" v-model="username" placeholder="Username"/>
    <input type="password" v-model="password" placeholder="Password"/>
    <input type="submit" value="Verify" @click="verif"/>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'VerifCode',
    props: ['code'],
    data(){
      return{
        username: '',
        password: ''
      }
    },
    methods: {
      verif(){
        let data = {
          username: this.username,
          password: this.password
        }

        axios.post("http://localhost:1503/login/", data)
          .then(response => {
            let _correct = response.data.correct
            if(_correct){
              data = {
                userId: response.data.id,
                password: this.password,
                code: this.code
              }
              axios.post("http://localhost:1503/verif", data)
                .then(response => {
                  if(response.data.correct) this.$emit("verifEnded")
                })
            }
          })
      }
    }
  }
</script>

<style scoped>
  #verif-container{
    margin-top: 25px;
    height: auto;
    width: 25%;
    margin-left: auto;
    margin-right: auto;
    border: 2px solid #51c1e6;
    border-radius: 25px;
  }

  #verif-container > input{
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

  #verif-container > input:disabled{
    width: 60%;
    display: block;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    background-color: #8b8383;
    color: #000000;
    border-style: none;
    height: 25px;
    margin-top: 10px;
    margin-bottom: 10px;
    text-indent: 5px;
  }

  #verif-container > input::placeholder{
    color: white;
    transition: color 0.5s;
  }

  #verif-container > input:hover::placeholder{
    color: black
  }
</style>