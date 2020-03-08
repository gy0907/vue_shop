<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 表格部分 -->
      <el-table 
      :data="rightsList"
      stripe
      border
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column label='权限名称' prop="authName"></el-table-column>
        <el-table-column label='路径' prop="path"></el-table-column>
        <el-table-column label='权限等级' prop="level" v-slot="scope">
          <el-tag type="primary" v-if="scope.row.level === '1'" >一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.level === '2'" >二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '../../network/request'

export default {
  data() {
    return {
      // 所有的权限列表
      rightsList: []
    }
  },
  mounted() {
    request('rights/list').then(res=>{
      if(res.meta.status !== 200) return this.$message.error('获取权限列表失败!')
      this.rightsList = res.data
    })
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 10px;
  box-shadow: 0 0 1px rgba(0,0,0,.1);
}
</style>