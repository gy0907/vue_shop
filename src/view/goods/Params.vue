<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert show-icon title="只允许设置三级分类参数" icon="icon" type="warning"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
          clearable
          v-model="selectGoodsCate"
          :options="goodsCate"
          :props="{value: 'cat_id',label: 'cat_name', expandTrigger: 'hover' }"
          @change="cascaderChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="ParamsDialogVisible = true" :disabled="buttonDisable" size="mini" type="primary">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                  <el-tag closable @close="deleteTag(scope.row,index)" v-for="(item,index) in scope.row.attr_vals" :key="item.id">{{item}}</el-tag>
                  <!-- 新增标签的按钮 -->
                  <el-input
                    style="width: 100px"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else  class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button @click="editParamsDialog(scope.row)" size="mini" icon="el-icon-edit" type="primary">修改</el-button>
                <el-button @click="deleteParams(scope.row)" size="mini" icon="el-icon-delete" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="ParamsDialogVisible = true" :disabled="buttonDisable" size="mini" type="primary">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyParamsList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                  <el-tag closable @close="deleteTag(scope.row,index)" v-for="(item,index) in scope.row.attr_vals" :key="item.id">{{item}}</el-tag>
                  <el-input
                    style="width: 100px"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else  class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button @click="editParamsDialog(scope.row)" size="mini" icon="el-icon-edit" type="primary">修改</el-button>
                <el-button @click="deleteParams(scope.row)" size="mini" icon="el-icon-delete" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和属性公用的对话框 -->
    <el-dialog
      :title="editDialogTitle==''?'添加'+dialogTitle:editDialogTitle"
      :visible.sync="ParamsDialogVisible"
      @close="closeAddParams"
      width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="editDialogTitle==''?dialogTitle:'属性名'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="commitAddParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除参数的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="deleteDialogVisible"
      width="50%">
      <span>确认删除?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteButton">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  computed:{
    dialogTitle() {
      return this.activeName == 'many' ? '动态参数':'静态属性'
    }
  },
  data() {
    return {
      goodsCate: [],
      selectGoodsCate: [],
      activeName: 'many',
      buttonDisable: true,
      // 存放动态参数
      manyParamsList: [],
      // 存放静态属性
      onlyParamsList: [],
      ParamsDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules:{
        attr_name: [
            { required: true, message: '请输入添加名称', trigger: 'blur' },
          ],
      },
      editDialogTitle: '',
      // 当前项的scopeRow
      scopeRow: {},
      // 控制删除对话框的显示和隐藏
      deleteDialogVisible: false,
    }
  },
  mounted() {
    this.getGoodsCate()
  },
  methods: {
    // 获取分类信息
    async getGoodsCate() {
      let res = await request('categories')
      if(res.meta.status !== 200) return this.message.error('获取商品分类数据失败!')
      this.goodsCate = res.data
    },
    // 获取参数列表
    async getParams() {
      // 获取响应的动静态参数并保存
      let res = await request({url:`categories/${this.selectGoodsCate[this.selectGoodsCate.length-1]}/attributes`,params:{sel: this.activeName}})
      if(res.meta.status !== 200) return this.message.error('获取参数失败!')

      // 为attr_vals提供一个单独的inputvalue
      res.data.forEach(item=>{
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      
      
      // 三元表达式
      this.activeName == 'many' ? 
      this.manyParamsList = res.data :
      this.onlyParamsList = res.data
    },
    // 级联选择器状态变化的事件
    cascaderChange(value) {
      // 控制添加参数按钮的禁用状态
      value.length === 0 ? this.buttonDisable = true : this.buttonDisable = false
      this.getParams()
    },
    // tab标签点击事件
    handleTabClick() {
      this.getParams()
    },
    // 关闭添加参数的对话框事件
    closeAddParams() {
      this.ParamsDialogVisible = false
      this.editDialogTitle = ''
      this.$refs.addFormRef.resetFields() // 这个方法有点问题
      this.addForm.attr_name = '' //手动清空一下就好了
    },
    // 提交参数的事件
    commitAddParams() {
      // 由于三个功能用了同一个对话框,所以需要增加判断条件发送不同的请求
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        if(this.editDialogTitle=='') {
          let res = await request({method: 'post', url:`categories/${this.selectGoodsCate[this.selectGoodsCate.length-1]}
          /attributes`,data:{
            attr_sel: this.activeName,
            attr_name: this.addForm.attr_name,
            }})
            console.log(res)
            res.meta.status !== 201 ? this.$message.error('添加参数失败!') :
            this.$message.success('添加参数成功!')
        } else { // 这表示是修改请求了
          let res = await request({method: 'put', url:`categories/${this.selectGoodsCate[this.selectGoodsCate.length-1]}
          /attributes/${this.scopeRow.attr_id}`,data:{
            attr_sel: this.scopeRow.attr_sel,
            attr_name: this.addForm.attr_name,
            }})
            console.log(res)
            res.meta.status !== 200 ? this.$message.error('修改参数失败!') :
            this.$message.success('修改参数成功!')
        }

          // 关闭对话框
          this.closeAddParams()
          // 重新获取列表
          this.getParams()
      })
    },
    // 修改的按钮事件
    editParamsDialog(scopeRow) {
      console.log(scopeRow)
      this.scopeRow = scopeRow
      this.ParamsDialogVisible = true
      this.editDialogTitle = '修改属性'
      this.addForm.attr_name = scopeRow.attr_name

    },
    // 删除按钮的点击事件
    deleteParams(scopeRow) {
      console.log("sadf");
      this.scopeRow = scopeRow
      this.deleteDialogVisible = true
    },
    // 删除对话框的确认事件
    async deleteButton() {
      let res = await request({method: 'delete', url:`categories/${this.selectGoodsCate[this.selectGoodsCate.length-1]}
    /attributes/${this.scopeRow.attr_id}`,})
    console.log(res);
    res.meta.status !== 200 ? this.$message.error('删除参数失败!') :
      this.$message.success('删除成功!')
      // 关闭对话框
      this.deleteDialogVisible = false
      // 重新获取列表
      this.getParams()
    },
    // 提交tag的事件
    handleInputConfirm(scopeRow) {
      if(scopeRow.inputValue.trim().length!==0) {
        scopeRow.attr_vals.push(scopeRow.inputValue)
        this.scopeRow = scopeRow
        // 发起请求提交标签
        this.tagRequest()
      }
        scopeRow.inputValue = ''
        scopeRow.inputVisible = false
    },
    // tag修改的网络请求
    async tagRequest() {
      let res = await request({method: 'put', url:`categories/${this.selectGoodsCate[this.selectGoodsCate.length-1]}
      /attributes/${this.scopeRow.attr_id}`,data:{
        attr_sel: this.scopeRow.attr_sel,
        attr_name: this.scopeRow.attr_name,
        attr_vals: this.scopeRow.attr_vals.join(' ')
        }})
        console.log(res)
        res.meta.status !== 200 ? this.$message.error('操作失败!') :
        this.$message.success('操作成功!')
    },
    // 显示与隐藏新增tag事件
    showInput(scopeRow) {
      scopeRow.inputVisible = true
      // 自动获取焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除标签tag,其实就是修改了本地的attr_vals然后重新提交服务器
    deleteTag(scopeRow,index) {
      this.scopeRow = scopeRow
      this.scopeRow.attr_vals.splice(index,1)
      this.tagRequest()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card{
    margin-top: 10px;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1);
  }
  .cat_opt {
    margin: 15px 0;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-tag {
    margin: 0 5px;
  }
</style>