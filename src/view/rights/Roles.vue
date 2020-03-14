<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图部分 -->
    <el-card>
      <el-row class="row1">
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-table border :data="rolesList"> 
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-row 
                :class="{bordertop: index==0}"
                v-for="(item,index) in scope.row.children"
                :key="item.id"
                >
                  <!-- 一级权限 -->
                  <el-col :span="5" >
                    <el-tag @close="removeTag(scope.row,item.id)" closable type="primary">{{item.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 二三级权限 -->
                  <el-col :span="19">
                    <el-row 
                      v-for="ii in item.children"
                      :key="ii.id">
                      <el-col :span="5">
                        <el-tag @close="removeTag(scope.row,ii.id)" closable type="success">{{ii.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                        <el-col :span="17">
                          <el-tag 
                          @close="removeTag(scope.row,i2.id)"
                          v-for="i2 in ii.children"
                          :key="i2.id" closable type="warning">{{i2.authName}}</el-tag>
                        </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type=index></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column width="300px" label="操作">
              <template v-slot="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button @click="showSetRightDislog(scope.row)" size="mini" type="warning" icon="el-icon-setting">编辑权限</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
    <el-dialog
    title="分配权限"
    :visible.sync="dialogVisible"
    width="50%"
    @close="closeRightDialog"
    >
    <el-tree ref="treeRef" :default-checked-keys="defKeys" default-expand-all show-checkbox node-key="id" :data="rightsList" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
    <span slot="footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button @click="commitRights" type="primary">确定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      rightsList: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  mounted() {
    this.getRolesList()
  },
  methods: {
    getRolesList() {
      request('roles').then(res=>{
        console.log(res)
        if(res.meta.status!==200) return this.$message.error('获取角色列表数据失败!')
        this.rolesList = res.data
      })
    },
    async removeTag(row,resid) {
      const res = await this.$confirm('确定删除这个权限?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)

      if(res !== 'confirm') {
        return this.$message.info('已经取消')
      }
      request({url:`roles/${row.id}/rights/${resid}`,method: 'delete'}).then(res=>{
        if(res.meta.status!==200) return this.$message.error('删除权限失败')
        this.$message.success('删除权限成功')

        // 重新获取数据会刷新页面，直接赋值不会
        row.children = res.data
      })
    },
    // 展示分配权限的对话框
    async showSetRightDislog(role) {
      this.roleId = role.id
      this.dialogVisible = true
      const res = await request('rights/tree')
      if(res.meta.status !== 200) return this.$message.error('获取分配权限列表失败!')
      this.rightsList = res.data

      // 将已经选中的选项勾选的数组
      this.getLeafKeys(role,this.defKeys)
    },
    // 递归获取所有三级权限
    getLeafKeys(node,arr){
      // 如果当前node节点不包括children属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }

        node.children.forEach(item=>{
          this.getLeafKeys(item,arr)
        })
    },
    // 关闭对话框清空权限信息的数组
    closeRightDialog(){
      this.defKeys.length = 0
    },
    handleNodeClick() {},
    // 修改权限对话框的确定按钮
    commitRights() {
      let keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      let idStr = keys.toString()
      
      // 提交修改权限后的数组
      console.log(this.defKeys)
      request({url:`roles/${this.roleId}/rights`,method: 'post',data:{rids: idStr}}).then(res=>{
        if(res.meta.status !== 200) return this.$message.error('更改权限失败!')
        this.$message.success('更新权限列表成功!')

        // 需要在数据获取之后进行状态更新，之前没注意，有点傻
        this.defKeys = keys // 更新数据数组
        this.getRolesList() // 更新树状权限
        this.dialogVisible = false
      })

    }
  }
}
</script>

<style scoped>
.el-card {
  box-shadow: 0 0 1px rgba(0, 0, 0, .2);
  margin-top: 10px;
}
.el-table {
  margin-top: 10px;
}
.el-tag {
  margin: 7px;
}
.el-row {
  border-bottom: 1px solid #eee;
}
.row1 {
  border: 0;
}
.bordertop {
  border-top: 1px solid #eee;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>