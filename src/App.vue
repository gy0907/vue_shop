<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Login from './view/Login'
export default {
  name: 'App',
  components: {
    Login
  }
}
</script>

<style scpoed>
  @import "./assets/css/normalize.css";
  @import "./assets/css/global.css";

</style>
