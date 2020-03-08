<template>
  <el-container class="container" >
    <el-header>
      <div>
        <img class="xhy" src="../assets/image/xhy.png" alt="">
        <span class="title">后台管理系统</span>
      </div>
      <el-button class="exitLogin" type="info" @click="exitLogin">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="collapseFlag? '64px':'200px'">
        <!-- 折叠菜单的按钮 -->
        <div class="toggle_button" @click="toggleCollapse">|||</div>
          <el-menu
          :default-active="NavPath"
          class="el-menu-vertical-demo"
          unique-opened
          :collapse="collapseFlag"
          :collapse-transition="false"
          router
          >
          <el-submenu 
          v-for="item in menuItem"
          :key="item.id"
          :index="item.id+''" 
          >
            <template slot="title">
              <i :class="ListIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item 
              v-for="i in item.children"
              :key="i.id"
              :index="i.path+''"
              @click="saveNavActive(i.path)"
              >
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{i.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>

        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import request from '../network/request'
export default {
  components: {
  },
  data() {
    return {
      menuItem: [],
      collapseFlag: false,
      NavPath: '',
      ListIcon: {
        '125': 'iconfont icon-yonghuming',
        '103': 'iconfont icon-tijikongjian-xianxing',
        '101': 'iconfont icon-daizi-',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-report',
      }
    }
  },
  created() {
    request('/menus').then(res=>{
      this.menuItem = res.data
    })
  },
  mounted() {
    this.NavPath = window.sessionStorage.getItem('path')
  },
  methods:{
    exitLogin() {
      window.sessionStorage.clear()
      this.$router.replace('/login')
    },
    toggleCollapse() {
      this.collapseFlag = !this.collapseFlag
    },
    // 保存侧边栏选项激活状态
    saveNavActive(path) {
      window.sessionStorage.setItem('path', path)
      this.NavPath = path
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
}
.el-header {
  background-color: #414141;
  display: flex;
  justify-content: space-between;
  align-items: center;
  >div {
    height: 50px;
    display: flex;
    align-items: center;
    >span {
      margin-left: 10px;
    }
  }
}
.el-aside {
  background-color: #f6f6f6;
}
.el-container /deep/ .el-main {
  background-color: #eaedf2;
}
.iconfont {
  margin-right: 5px;
}
.xhy {
  height: 100%;
}
.title {
  font-size: 24px;
  color: #fff;
}
.toggle_button {
  background-color: #40407a;
  color: #bbb;
  text-align: center;
  height: 30px;
  line-height: 30px;
  cursor: pointer;
  letter-spacing: 3px;
  font-size: 12px;
}
.el-menu {
  background-color:#f6f6f6;
}
// 穿刺
.el-container /deep/ .el-menu-item-group__title{
  padding: 0 !important;
}
</style>