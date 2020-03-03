<template>
  <div>
    <el-button @click="exitLogin">退出</el-button>
  </div>
</template>

<script>
export default {
  methods:{
    exitLogin() {
      window.sessionStorage.clear()
      this.$router.replace('/login')
    }
  }
}
</script>

<style>

</style>