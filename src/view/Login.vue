<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/image/xhy.png" alt="">
      </div>
        <el-form :model="form" :rules="rules" ref="loginFormRef">
          <el-form-item prop="username">
            <el-input
            prefix-icon="iconfont icon-yonghuming"
            v-model="form.username"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
            prefix-icon="iconfont icon-mima"
            v-model="form.password"
            type="password"
            @keyup.enter.native="enterLogin"
            ></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="loginButton" >登录</el-button>
            <el-button type="info" @click="resetForm" >重置</el-button>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
import request from '../network/request'
import axios from 'axios'
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          {required: true,message: '请输入用户名',trigger: 'blur'},
          {min: 3,max: 6,message: '长度必须在3-6位之间',trigger: 'blur'},
        ],
        password: [
          {required: true,message: '请输入密码',trigger: 'blur'},
          {min: 6,max: 16,message: '长度必须在6-16位之间',trigger: 'blur'},
        ]
      }
    }
  },
  methods: {
    resetForm() {
      // 重置表单的操作
      this.$refs.loginFormRef.resetFields()
    },
    loginButton() {
    // 验证表单的回调函数
      this.$refs.loginFormRef.validate().then( res=>{
        if(!res) return
          request({
            url: '/login',
            method: 'POST',
            data: this.form
          }).then(res=>{
            if(res.meta.status !== 200) return this.$message.error('登录失败！');
            this.$message.success('登录成功')
            console.log(res)
            window.sessionStorage.setItem('token', res.data.token)

            this.$router.replace('/home').catch(err=>err)
          })
      })
    },
    enterLogin() {
      this.loginButton()
    }
  }
}
</script>

<style lang="less" scoped>
@import "//at.alicdn.com/t/font_1668035_h174imzwqxi.css";
.login_container {
  background: url('../assets/image/background.jpg') no-repeat;
  background-size: 100% 100%;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: rgba(255,255,255, .9);
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  box-shadow: 0 0 10px rgba(255, 255, 255, .5);
  .avatar_box {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 5px solid #ccc;
    overflow: hidden;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img{
      width: 100%;
      height: 100%;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.el-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>