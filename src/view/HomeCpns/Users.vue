<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <el-col :span="10">
          <el-input clearable @clear="getUserList" placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="getUserList" >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" >
          <el-button type="primary" @click="dialogVisible=true" >添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
        <el-table
          border
          :data="userlist"
          style="width: 100%">
          <el-table-column type="index"></el-table-column>
          <el-table-column
            prop="username"
            label="用户名"
            width="180">
          </el-table-column>
          <el-table-column
            prop="email"
            label="邮箱"
            width="180">
          </el-table-column>
          <el-table-column
            prop="mobile"
            label="电话">
          </el-table-column>
          <el-table-column
            prop="role_name"
            label="角色">
          </el-table-column>
          <el-table-column
            prop="meg_state"
            label="状态">
            <template v-slot="scope">
              <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            width="180px"
            label="操作">
            <template v-slot="scope">
                <el-button @click="editUser(scope.row)" size="mini" type="primary" icon="el-icon-edit"></el-button>
                <el-button @click="openMsgBox(scope.row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
                <el-tooltip content="设置权限" placement="top">
                  <el-button @click="setRole(scope.row)" size="mini" type="warning" icon="el-icon-setting"></el-button>
                </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器部分 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[2, 5, 10, 20]"
          :page-size="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加用户的Dialog对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      @close="clearForm"
      width="50%">
      <el-form 
      :model="addUser" 
      :rules="addUserRules" 
      label-width="70px"
      ref="addUserRef"
      >
        <el-form-item 
        v-for="(item,index) in addFormList" 
        :key="index"
        :label="item.label" 
        :prop="item.props">
          <el-input v-model="addUser[item.props]"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="commitUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="showEditDialog"
      @close="clearEditForm"
      width="50%">
      <el-form 
      :model="editUserList" 
      :rules="addUserRules" 
      label-width="70px"
      ref="editUserRef"
      >
        <el-form-item 
        v-for="(item,index) in editFormList" 
        :key="index"
        :label="item.label" 
        :prop="item.props">
          <el-input :disabled="index==0" v-model="editUserList[item.props]"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="commitEditUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="commitRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  data() {
    // 验证邮箱的规则：
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮箱格式'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/

      if(regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号格式'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userlist: [],
      total: 0,
      // 控制添加用户dialog对话框的显示隐藏
      dialogVisible: false,
      // 修改用户dialog对话框的显示隐藏
      showEditDialog: false,
      // 分配角色对话框
      setRoleDialogVisible: false,
      userInfo:{},
      rolesList: [],
      selectedRoleId:'',
      addUser: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3,max:10,message: '用户名在3到10个字符之间',trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6,max:16,message: '密码在6到16个字符之间',trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: "blur"}
        ],

      },
      addFormList: [
        {label: '用户名',props: 'username'},
        {label: '密码',props: 'password'},
        {label: '邮箱',props: 'email'},
        {label: '手机',props: 'mobile'},
      ],
      editFormList: [
        {label: '用户名',props: 'username'},
        {label: '邮箱',props: 'email'},
        {label: '手机',props: 'mobile'},
      ],
      editUserList: {
        username: '',
        email: '',
        mobile: ''
      }
    }
  },
  created() {
    this.getUserList()
  },
  computed: {
    pagesize() {
      return Math.ceil(this.total / this.pagesize) 
    }
  },
  methods: {
    async getUserList() {
      // 从结果里取出data赋值给变量res
      let {data: res} = await request({url: '/users',params: this.queryInfo})
      this.userlist = res.users
      this.total = res.total
      console.log(res)
    },
    handleSizeChange(size){
      this.queryInfo.pagesize = size
      this.getUserList()
    },
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page
      this.getUserList()
    },
    // 更改swtich同步到服务器
    async userStateChange(change) {
      const res = await request({url:`users/${change.id}/state/${change.mg_state}`,method: 'put'})
      console.log(res)
      if(res.mg_state !== change.mg_state) {
        this.$message.success(res.meta.msg)
      } else {
        this.$message.error('更改状态失败')
      }
    },
    clearForm() {
      this.$refs.addUserRef.resetFields()
    },
    // 增加用户
    commitUser() {
      this.$refs.addUserRef.validate(valid => {
        if(!valid) return
        // 校验通过发送添加用户请求
        request({url: '/users',method: 'POST',data: this.addUser}).then(res=>{
          console.log(res)
          if(res.meta.status!==201) return this.$message.error('添加用户失败!')

          // 清除并关闭表单对话框
          this.clearForm()
          this.dialogVisible = false
          return this.$message.success('添加用户成功!')
        })
      })
    },
    // 清空修改用户表单
    clearEditForm() {
      this.$refs.editUserRef.resetFields()
    },
    // 更改用户信息
    editUser(scopeRow) {
      this.showEditDialog = true
      console.log(scopeRow)
      this.editUserList.id = scopeRow.id
      this.editUserList.username = scopeRow.username
      this.editUserList.email = scopeRow.email
      this.editUserList.mobile = scopeRow.mobile
    },
    // 提交修改用户信息
    commitEditUser() {
      this.$refs.editUserRef.validate(valid => {
        if(!valid) return
        // 校验通过发送添加用户请求
        // let data = {
        // username: this.editUserList.id,
        // email: this.editUserList.email,
        // mobile: this.editUserList.mobile
        // }
        request({url: `/users/${this.editUserList.id}`,method: 'PUT',data: this.editUserList}).then(res=>{
          console.log(res)
          if(res.meta.status!==200) return this.$message.error('修改用户失败!')

          // 清除并关闭表单对话框
          this.clearEditForm()
          this.showEditDialog = false
          this.getUserList()
          return this.$message.success('修改用户成功!')
        })
      })
    },
    // 打开确认删除用户的对话框
    openMsgBox(scopeRow) {
        let iid = scopeRow.id
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await request({url:`/users/${iid}`,method:'delete'})
          if(res.meta.status !== 200) return this.$message.error('删除用户失败！') 
          this.$message.success('删除用户成功！')
        }).catch(() => {
          this.$message.info('取消操作！') 
        });
    },
    // 展示分配角色的对话框
    setRole(userInfo) {
      this.userInfo = userInfo

      // 在打开对话框之前，获取所有角色的列表
      request('roles').then(res=>{
        if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
        console.log(this.rolesList)
      })
      
      this.setRoleDialogVisible = true
    },
    // 提交重新分配的角色
    commitRole() {
      if(!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色!')
      } 
      request({method:'put',url:`/users/${this.userInfo.id}/role`,data: {rid: this.selectedRoleId}}).then(res=>{
        console.log(res)
        if(res.meta.status !== 200) return this.$message.error('分配角色失败!')
        this.$message.success('分配角色成功!')
        this.getUserList()
        this.setRoleDialogVisible = false
      })
    }
  }
}

</script>

<style lang="less" scoped>
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, .1) !important;
  margin-top: 10px;
}
.el-table {
  margin-top: 20px;
}
</style>