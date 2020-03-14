<template>
  <div class="Add">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息"
      type="info"
      center
      show-icon
      :closable="false"
      ></el-alert>
      <!-- 步骤条区域 -->
      <el-steps align-center :space="200" :active="stepIndex*1" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 左侧tab栏区域 -->
      <el-form label-position="top" ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-tabs @tab-click="tabClick" :before-leave="beforeLeave" v-model="stepIndex" tab-position="left">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <!-- 选择商品分类的级联选择框 -->
            <el-form-item label="选择分类" prop="goods_cat">
              <el-cascader
              clearable
              v-model="addForm.goods_cat"
              :options="goodsCate"
              :props="{value: 'cat_id',label: 'cat_name', expandTrigger: 'hover' }"
              @change="cascaderChange">
              </el-cascader>
            </el-form-item>
            
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyAttrParams" :key="item.attr_id" :label="item.attr_name" >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(i,index) in item.attr_vals" :key="index" :label="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyAttrParams" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传的后台api接口 -->
            <el-upload
              class="upload-demo"
              action="https://www.liulongbin.top:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="successCallback"
              >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quillEditor v-model="addForm.goods_introduce" ></quillEditor>
            <el-button @click="Add" type="primary" class="addButton">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      width="70%">
      <img :src="imgPreview" alt="">
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import {quillEditor} from 'vue-quill-editor'
export default {
  components: {
      quillEditor
  },
  data() {
    return {
      stepIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'}
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'}
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ],
        goods_cat: [
          {required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      goodsCate: [],
      // 第二个tab请求的数据
      manyAttrParams: [],
      onlyAttrParams: [],
      // 上传图片没使用axios所以要重新配置一个请求头
      headerObj:{
        Authorization: ''
      },
      imgUrl: '',
      dialogVisible: false,
      // 图片预览的路径
      imgPreview: ''
    }
  },
  created() {
    this.getCateList()
    this.headerObj.Authorization = window.sessionStorage.getItem('token')
  },
  methods: {
    async getCateList() {
      let res = await request('categories')
      this.goodsCate = res.data
    },
    // 级联选择器改变事件
    cascaderChange() {
      console.log(this.addForm.goods_cat)
    },
    // tab切换之前的钩子函数，如果返回false或reject了，则阻止切换
    beforeLeave() {
      if(this.addForm.goods_cat.length == 0) {
        this.$message.error('请选择分类')
        return false
      }
    },
    // tab点击被点击执行的函数
    tabClick() {
      // 说明进入了商品参数标签
      if(this.stepIndex == 1) {
        request({url: `categories/${this.addForm.goods_cat[this.addForm.goods_cat.length-1]}/attributes`,params:{sel: 'many'}}).then(res=>{
          res.data.forEach(item=>{
            item.attr_vals = item.attr_vals.length===0 ?
            [] : item.attr_vals.split(' ')
          })
          this.manyAttrParams = res.data
        })
      } else if (this.stepIndex == 2) {
        request({url: `categories/${this.addForm.goods_cat[this.addForm.goods_cat.length-1]}/attributes`,params:{sel: 'only'}}).then(res=>{
          this.onlyAttrParams = res.data
        })
      }
    },
    // 图片预览
    handlePreview(file) {
      this.imgPreview = file.response.data.url
      this.dialogVisible = true
    },
    // 图片删除
    handleRemove(file) {
      this.addForm.pics = this.addForm.pics.filter(item=>{
        return item.pic !== file.response.data.tmp_path
      }) 
      console.log(this.addForm.pics)
    },
    // 上传成功后的回调函数
    successCallback(res) {
      this.addForm.pics.push({pic: res.data.tmp_path})
      console.log(this.addForm.pics)
    },
    Add() {
      this.$refs.addFormRef.validate(valid=>{
        if(!valid) return this.$message.error('请完成表单内容!')

        // 处理动态参数manyattrs
        this.manyAttrParams.forEach(item=>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyAttrParams.forEach(item=>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })

        // 深拷贝
        let commitForm = JSON.parse(JSON.stringify(this.addForm))
        // 处理goods_cat
        commitForm.goods_cat = commitForm.goods_cat.toString()
        console.log(commitForm)

        // 添加商品的请求
        request({url: 'goods',method: 'post', data: commitForm}).then(res=>{
          console.log(res)
          if(res.meta.status!==201) return this.$message.error('添加商品失败!')
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
  .el-card {
    box-shadow: 0 0 1px rgba(0, 0, 0, .1);
    margin-top: 10px;
  }
  .el-steps {
    margin: 15px auto;
  }
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
  img {
    width: 100%;
  }
  .Add /deep/ .ql-editor{
    min-height: 300px;
  }
  .addButton {
    margin-top: 15px;
  }
</style>