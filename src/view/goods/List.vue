<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input @clear="clearInput" clearable @input="queryInput" placeholder="请输入内容" v-model="goodsQuery.query">
            <el-button @click="queryInput" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="linkAddGoods" class="addButton" type="primary" plain>添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column width="80px" label="商品价格" prop="goods_price" ></el-table-column>
        <el-table-column width="80px" label="商品重量" prop="goods_weight" ></el-table-column>
        <el-table-column width="180px" label="创建时间">
          <template v-slot="scope">
              {{scope.row | goods_time}}
          </template>
        </el-table-column>
        <el-table-column width="130px" label="操作" >
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="deleteGoods(scope.row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页部分 -->
      <el-pagination
      @size-change="goodsSizeChange"
      @current-change="goodsCurrentChange"
      :current-page="goodsQuery.pagenum"
      :page-sizes="[5, 10, 50, 100]"
      :page-size="goodsQuery.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import request from '../../network/request'
import dateFormat from '../../plugins/gettime'
export default {
  filters: {
    goods_time(scopeRow) {
      return dateFormat(scopeRow.add_time*1000)
    }
  },
  data () {
    return {
      inputContent: '',
      goodsQuery: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      goodsList: [],
      total: 0,
    }
  },
  mounted() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      let res = await request({url: 'goods', params: this.goodsQuery})
      console.log(res)
      if(res.meta.status!==200) return this.$message.error('获取商品列表失败!')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 页面显示条数变化
    goodsSizeChange(size) {
      this.goodsQuery.pagesize = size
      this.getGoodsList()
    },
    // 页面切换的事件
    goodsCurrentChange(num) {
      this.goodsQuery.pagenum = num
      this.getGoodsList()
    },
    queryInput() {
      this.goodsQuery.pagenum = 1
      this.getGoodsList()
    },
    clearInput() {
      this.goodsQuery.query = ''
      this.goodsQuery.pagenum = 1
      this.getGoodsList()
    },
    async deleteGoods(scopeRow) {
      const res = await this.$confirm('此操作将永久删除该商品，是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)

      if(res !== 'confirm') return this.$message.info('已取消操作')
      request({url:`goods/${scopeRow.goods_id}`,method: 'delete'}).then(res=>{
        console.log(res)
        if(res.meta.status !== 200) return this.$message.error('删除商品失败!')
        this.getGoodsList()
        this.$message.success('删除商品成功!')
      })
    },

    linkAddGoods() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped lang="less">
.el-card {
  margin-top: 10px;
  box-shadow: 0 0 1px rgba(0, 0, 0, .1);
}
.addButton {
    margin-left: 15px;
    margin-bottom: 15px;
}

</style>