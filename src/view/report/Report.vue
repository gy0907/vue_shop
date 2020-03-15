<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main" style="width: 800px; height: 500px"></div>
    </el-card>
  </div>
</template>

<script>
import request from '../../network/request'

import echarts from 'echarts'

import _ from 'lodash'
export default {
  data() {
    return {
      options: {
        title: {text: '用户来源'},
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {backgroundColor: '#e9eef3'}
          }
        },
        grid: {
          left: '10%',
          right: '4%',
          bottom: '10%',
          conrainLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
          type: 'value'
          }
        ]
      },
    }
  },
  async mounted() {
    // 初始化echarts
    let myChart = echarts.init(document.getElementById('main'))

    let {data: res} = await request('reports/type/1')
    // 合并数据 (lodash方法)
    let result = _.merge(res,this.options)

    // 生成图表
    myChart.setOption(result)
  },
}
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 10px;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1);
  }
</style>