<template>
  <div class="home-container">
<!--    导航栏-->
    <van-nav-bar class="page-nav-bar" fixed>
      <van-button
          class="search-btn"
          slot="title"
          type="info"
          size="small"
          round
          icon="search"
          to="/search"
      >搜索</van-button>
    </van-nav-bar>
<!--    频道列表-->
    <van-tabs v-model="active" class="channel-tabs" animated swipeable>
      <van-tab v-for="channel in channels" :key="channel.id" :title="channel.name">
        <article-list :channel="channel"></article-list>
      </van-tab>
      <div slot="nav-right" class="placeholder"></div>
      <div slot="nav-right" class="hamburger-btn" @click="isChannelEditShow = true">
        <i class="iconfont icon-gengduo"></i>
      </div>
    </van-tabs>
<!--    频道编辑弹出层-->
    <van-popup
      v-model="isChannelEditShow"
      position="bottom"
      :style="{height: '100%'}"
      closeable
      close-icon-position="top-left"
    >
      <!-- 传递channels 传递active高亮索引 定义update-active事件-->
      <channel-edit :my-channels="channels" :active="active" @update-active="onUpdateActive"/>
<!--      <ChannelEdit />-->
    </van-popup>
  </div>
</template>

<script>
// 1 导入频道列表方法
import { getUserChannels } from '@/api/user'
import { mapState } from 'vuex'
import { getItem } from '@/utils/storage'
import ArticleList from './components/article-list'
import ChannelEdit from './components/channel-edit'
export default {
  // 组件名称
  name: 'HomeIndex',
  // 局部注册的组件
  components: {
    ArticleList,
    ChannelEdit
  },
  // 组件参数 接收来自父组件的数据
  props: {},
  // 组件状态值
  data () {
    return {
      active: 0,
      //  4 定义数据接收频道列表
      channels: [],
      isChannelEditShow: false // 控制弹窗页面
    }
  },
  // 计算属性
  computed: {
    ...mapState(['user'])
  },
  // 侦听器
  watch: {},
  // 生命周期钩子   注：没用到的钩子请自行删除
  /**
   * 组件实例创建完成，属性已绑定，但DOM还未生成，el属性还不存在
   */
  created () {
  //  3 调用获取频道列表
    this.loadChannels()
  },
  /**
   * el 被新创建的 vm.el 替换，并挂载到实例上去之后调用该钩子。
   * 如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.el 也在文档内。
   */
  mounted () {
  },
  // 组件方法
  methods: {
  //  定义加载频道列表的方法
    async loadChannels () {
      // try {
      //   // const { data } = await getUserChannels()
      //   // this.channels = data.data.channels
      //   let channels = []
      //   if (this.user) {
      //     // 已登录 请求获取用户频道列表
      //     const { data } = await getUserChannels()
      //     this.channels = data.data.channels
      //   } else {
      //     // 未登录
      //     const localChannels = getItem('TOUTIAO_CHANNELS')
      //     if (localChannels) {
      //       // 有本地数据 使用
      //       channels = localChannels
      //     } else {
      //       // 没有本地数据 请求默认的
      //       const { data } = await getUserChannels()
      //       channels = data.data.channels
      //     }
      //   }
      //   // 将数据更新到组件中
      //   this.channels = channels
      // } catch (err) {
      //   this.$toast('获取用户列表失败')
      // }

      // 优化
      try {
        let channels = []
        const localChannels = getItem('TOUTIAO_CHANNELS')
        if (this.user || !localChannels) {
          // 登录 或者 未登录本地没有存储 获取后端数据
          const { data } = await getUserChannels()
          channels = data.data.channels
        } else {
          // 未登录且本地有数据
          channels = localChannels
        }
        // 将数据更新到组件中
        this.channels = channels
      } catch (err) {
        this.$toast('获取用户列表失败')
      }
    },
    onUpdateActive (index, isChannelEditShow = true) {
      this.active = index // 更新激活的频道项
      this.isChannelEditShow = false // 关闭编辑频道的弹出层
    }
  }
}
</script>

<style scoped lang="less">
.home-container {
  padding-top: 174px;
  padding-bottom: 100px;
  /deep/ .van-nav-bar__title {
    max-width: unset;
  }
  .search-btn {
    width: 555px;
    height: 64px;
    background-color: #5babfb;
    border: none;
    font-size: 28px;
    .van-icon {
      font-size: 32px;
    }
  }
  /deep/ .channel-tabs {
    .van-tabs__wrap {
      position: fixed;
      top: 92px;
      z-index: 1;
      left: 0;
      right: 0;
      height: 82px;
    }
    .van-tab {
      min-width: 200px;
      border-right: 1px solid #edeff3;
      font-size: 30px;
      color: #777777;
    }

    .van-tab--active {
      color: #333333;
    }

    .van-tabs__nav {
      padding-bottom: 0;
    }

    .van-tabs__line {
      bottom: 8px;
      width: 31px !important;
      height: 6px;
      background: #3296fa;
    }
    .placeholder {
      flex-shrink: 0;
      width: 66px;
      height: 82px;
    }
    .hamburger-btn {
      position: fixed;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 66px;
      height: 82px;
      background-color: #fff;
      opacity: 0.902;
      i.iconfont {
        font-size: 33px;
      }
      &:before {
        content: "";
        position: absolute;
        left: 0;
        width: 1px;
        height: 58px;
        background-image: url(~@/assets/gradient-gray-line.png);
        background-size: contain;
      }
    }
  }
}
</style>
