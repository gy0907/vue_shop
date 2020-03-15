<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
       <el-row>
        <el-col :span="8">
          <el-input @clear="clearInput" clearable @input="queryInput" placeholder="请输入内容" v-model="orderQuery.query">
            <el-button @click="queryInput" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table stripe border :data="orderList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column width="80" label="订单价格" prop="order_price"></el-table-column>
        <el-table-column width="80" label="是否付款">
          <template v-slot="scope">
              <el-tag type="warning" v-if="scope.row.order_pay == 0">未付款</el-tag>
              <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="80" label="是否发货" prop="is_send"></el-table-column>
        <el-table-column width="180" label="下单时间" prop="create_time">
          <template v-slot="scope">
              {{ scope.row.create_time | getDate }}
          </template>
        </el-table-column>
        <el-table-column width="130" label="操作">
          <el-button @click="openDialog" type="primary" size="mini" icon="el-icon-edit"></el-button>
          <el-button  @click="showProgressBox"  type="success" size="mini" icon="el-icon-map-location"></el-button>
        </el-table-column>
      </el-table>
          <!-- 分页器部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderQuery.pagenum"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="orderQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      width="50%"
      @close='closeDialog'
      >
      <el-form :model="addrRuleForm" :rules="addrRules" ref="addrFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
          v-model="addrRuleForm.value"
          :options="citydata"
          :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addrRuleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="ProgressDialogVisible"
      width="50%"
      >
      <!-- 时间线，用于显示物流状态 -->
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(activity, index) in progressList"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ProgressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ProgressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
import getTime from '../../plugins/gettime'

import citydata from '../order/citydata'
export default {
  filters: {
    getDate(time) {
      return getTime(time*1000)
    }
  },
  data() {
    return {
      orderQuery: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      orderList: [],
      total: 0,
      // 修改地址对话框的表单项
      addrRuleForm: {
        value: [],
        address2: ''
      },
      addrRules: {
        address1: [
          { required: true, message: '请选择地址', trigger: 'blur' }
        ],
        address2: [
        { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      // 物流进度对话框显示于隐藏
      ProgressDialogVisible: false,
      citydata,
      // 存储物流信息
      progressList: []
    }
  },
  created() {
    this.getOrders()
  },
  methods: {
    // 获取订单列表
    async getOrders() {
      let res = await request({url: 'orders', params: this.orderQuery})
      if(res.meta.status !== 200) return this.$message.error('获取订单列表数据失败!')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 清空输入框的事件
    clearInput() {
      this.orderQuery.query = ''
      this.getOrders()
    },
    // 输入框的输入事件
    queryInput() {
      this.getOrders()
    },
    // 显示数量改变
    handleSizeChange(size) {
      this.orderQuery.pagesize = size
      this.getOrders()
    },
    // 当前页面改变
    handleCurrentChange(num){
      this.orderQuery.pagenum = num
      this.getOrders()
    },
    // 打开对话框
    openDialog() {
      this.dialogVisible = true
    },
    closeDialog() {
      this.$refs.addrFormRef.resetFields()
    },
    showProgressBox() {
      this.ProgressDialogVisible = true
      // 请求物流信息
      let num = '251183077100'
      request(`/kuaidi/${num}`).then(res=>{
        if(res.meta.status !== 200) return this.$message.error('获取物流信息失败')
        this.progressList = res.data
      })
    }
  }
}
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 10px;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1);
  }
  .el-pagination {
    margin-top: 10px;
  }
  .el-input {
    margin-bottom: 10px;
  }
</style>