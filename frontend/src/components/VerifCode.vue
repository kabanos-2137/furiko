<template>
  <div v-if="(verifErr < 0)" id="verif-container">
    <input type="text" :value="code" disabled/>
    <input type="text" v-model="username" placeholder="Username"/>
    <input type="password" v-model="password" placeholder="Password"/>
    <input type="submit" value="Verify" @click="verif"/>
    <p v-if="(verifErr == 1)" id="err">Wrong username or password</p>
    <p v-else-if="(verifErr == 2)" id="err">Code not found</p>
    <p v-else-if="(verifErr == 3)" id="err">Code is not valid</p>
  </div>
  <div v-else>
    <p id="verif-info">Verification ended succesfully. </p>
    <p id="back-button" @click="endVerif">Back</p>
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
        password: '',
        verifErr: -1
      }
    },
    methods: {
      verif(){
        let data = {
          username: this.username,
          password: this.password,
          code: this.code
        }

        axios.post("http://localhost:1503/verif", data)
          .then(response => {
            if(response.data.correct) this.verifErr = 0
            else this.verifErr = response.data.wrong
          })
      },
      endVerif(){
        this.username = ''
        this.password = ''
        this.verifErr = -1
        this.$emit("verifEnded");
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

  #back-button{
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: auto;
    text-align: center;
    padding-bottom: 10px;
    text-decoration: underline;
    color: rgb(82, 163, 198);
  }

  #verif-info{
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: auto;
    text-align: center;
    padding-bottom: 10px;
    color: rgb(82, 163, 198);
  }
</style>