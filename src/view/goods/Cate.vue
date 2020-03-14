<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button @click="showAddCateDialog" type="primary" size="small">添加分类</el-button>
      <tree-table
      class="tree-table"
      :data="goodsList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text="#"
      border
      >
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" 
          v-if="scope.row.cat_deleted === false"
          style="color: #84da45"
          ></i>
          <i class="el-icon-error" style="color: #d44e42" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
          <el-button  @click="deleteParams(scope.row)" icon="el-icon-delete" size="mini" type="warning">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cateList.pagenum"
        :page-sizes="[2, 5, 10, 100]"
        :page-size="cateList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialog"
      @close="closeAddCateDialog"
      width="50%">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            clearable
            v-model="cascaderValue"
            :options="FatherList"
            :props="{checkStrictly: true, expandTrigger: 'hover' ,value: 'cat_id',label: 'cat_name'}"
            @change="cascaderChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="commitCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  mounted() {
    this.getCateList()
  },
  computed: {
    FatherList() {
      let FatherList = JSON.parse(JSON.stringify(this.goodsList))
      // let FatherList = []
      // // 深拷贝
      // function deepCopy(newobj, oldobj) {
      //   for(let key in oldobj) {
      //     if(oldobj[key] instanceof Array) {
      //       newobj[key] = []
      //       deepCopy(newobj[key],oldobj[key])
      //     } else if(typeof oldobj[key] === 'Object'){
      //       deepCopy(newobj[key],oldobj[key])
      //     } else {
      //       newobj[key] = oldobj[key]
      //     }
      //   }
      // };

      // deepCopy(FatherList,this.goodsList);
      for(let key in FatherList) {
        for(let k in FatherList[key].children) {
          delete FatherList[key].children[k].children
        }
      }
      return FatherList
    }
  },
  data() {
    return {
      cateList: {
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      goodsList: [],
      addCateDialog: false,
      // 级联选择器的value
      cascaderValue: [],
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
        },{
          label: '是否有效',
          // 表示将这一列渲染为模板列
          type: 'template',
          // 表示模板的使用的名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将这一列渲染为模板列
          type: 'template',
          // 表示模板的使用的名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将这一列渲染为模板列
          type: 'template',
          // 表示模板的使用的名称
          template: 'opt'
        },
      ],
      // 添加分类的表单数据对象
      addCateForm:{
        // 将要添加的分类的名称
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
           { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCateList() {
      const res = await request({url:'categories',data: this.cateList})
      if(res.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
      this.goodsList = res.data
      this.total = res.data.length
    },
    // 监听pagesize改变
    handleSizeChange(newsize) {
      this.cateList.pagesize = newsize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(num) {
      this.cateList.pagenum = num
      this.getCateList()
    },
    // 添加分类按钮的事件
    showAddCateDialog() {
      this.addCateDialog = true
    },
    // 级联选择器change事件
    cascaderChange(res) {
      if(res.length > 0) {
        this.addCateForm.cat_pid = res[res.length -1]
        this.addCateForm.cat_level = res.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭添加分类对话框,重置表单数据
    closeAddCateDialog() {
      this.$refs.addCateFormRef.resetFields()
      this.cascaderValue = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 提交添加分类的请求
    commitCate() {
      // 表单校验成功发起请求
      this.$refs.addCateFormRef.validate(valid=>{
        if(!valid) return 
        request({method: 'post',url: 'categories',data: this.addCateForm}).then(res=>{
          this.addCateDialog = false
          if(res.meta.status !== 201) return this.$message.error('创建分类失败!')
          this.$message.success('创建分类成功!')
          this.getCateList()
        })
      })
    },
    deleteParams(scopeRow) {
      request({url: `categories/${scopeRow.cat_id}`, method: 'delete'}).then(res=>{
        res.meta.status !== 200 ? this.$message.error('删除失败!'):this.$message.success('删除成功!')
        this.getCateList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 10px;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1);
  }
  .tree-table {
    margin-top: 10px;
  }
</style>