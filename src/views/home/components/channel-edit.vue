<template>
  <div class="channel-edit">
<!--    我的频道-->
    <van-cell>
      <template #title>
        <div class="title-text">我的频道</div>
      </template>
        <van-button size="mini" round type="danger" plain @click="isEdit = !isEdit">{{ isEdit ? '完成' : '编辑' }}</van-button>
    </van-cell>
    <van-grid :gutter="10" class="my-grid">
      <van-grid-item class="grid-item" v-for="(channel, index) in myChannels" :key="index" @click="onMyChannelClick(channel, index)">
        <van-icon v-show="isEdit && !fixedChannel.includes(channel.id)" slot="icon" name="clear"></van-icon>
      <span
         slot="text"
         :class="{active: index === active}"
         class="text"
      >{{ channel.name }}</span>
      </van-grid-item>
    </van-grid>
<!--    频道推荐-->
    <van-cell :border="false">
      <template #title>
        <div class="title-text">频道推荐</div>
      </template>
    </van-cell>
    <van-grid :gutter="10" class="recommend-grid">
      <van-grid-item class="grid-item" v-for="(channel, index) in recommendChannels" :key="index" :text="channel.name" icon="plus" @click="onAddChannel(channel)"/>
    </van-grid>
  </div>
</template>

<script>
import { getAllChannels, addUserChannel, deleteUserChannel } from '@/api/channel'
import { mapState } from 'vuex'
import { setItem } from '@/utils/storage'

export default {
  // 组件名称
  name: 'ChannelEdit',
  // 局部注册的组件
  components: {},
  // 组件参数 接收来自父组件的数据
  props: {
    myChannels: {
      type: Array,
      required: true
    },
    active: {
      type: Number,
      required: true
    }
  },
  // 组件状态值
  data () {
    return {
      allChannels: [], // 所有的频道
      isEdit: false, // 控制编辑状态
      fixedChannel: [0] // 固定频道的id 不允许删除
    }
  },
  // 计算属性
  computed: {
    recommendChannels () {
      const channels = []
      this.allChannels.forEach(channel => {
        // find 遍历数组 找到满足条件的元素项 没找到会返回undefined
        const ret = this.myChannels.find(myChannel => {
          return myChannel.id === channel.id
        })
        // 如果我的频道中不包括该频道项 则手机到推荐频道中
        if (!ret) {
          channels.push(channel)
        }
      })
      // 返回计算结果
      return channels
    },
    // // 计算属性会观测内部依赖数据的变化
    // // 如果依赖的数据发生变化，则计算属性会重新执行
    // recommendChannels () {
    //   // 数组的 filter 方法：遍历数组，把符合条件的元素存储到新数组中并返回
    //   return this.allChannels.filter(channel => {
    //     // const channels = []
    //
    //     // 数组的 find 方法：遍历数组，把符合条件的第1个元素返回
    //     return !this.myChannels.find(myChannel => {
    //       return myChannel.id === channel.id
    //     })
    //
    //     // return channels
    //   })
    // }
    // 获取user
    ...mapState(['user'])
  },
  // 侦听器
  watch: {},
  // 生命周期钩子   注：没用到的钩子请自行删除
  /**
   * 组件实例创建完成，属性已绑定，但DOM还未生成，el属性还不存在
   */
  created () {
    this.loadAllChannels()
  },
  /**
   * el 被新创建的 vm.el 替换，并挂载到实例上去之后调用该钩子。
   * 如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.el 也在文档内。
   */
  mounted () {
  },
  // 组件方法
  methods: {
    // 加载所有频道
    async loadAllChannels () {
      try {
        const { data } = await getAllChannels()
        this.allChannels = data.data.channels
      } catch (err) {
        this.$toast('获取频道列表数据失败')
      }
    },
    // 把推荐频道添加到我的频道
    async onAddChannel (channel) {
      this.myChannels.push(channel)
      if (this.user) {
        // 已登录 数据存到线上
        try {
          await addUserChannel({
            id: channel.id, // 频道id
            seq: this.myChannels.length // 频道的序号
          })
          this.$toast('添加成功')
        } catch (err) {
          this.$toast('保存失败')
        }
      } else {
        // 未登录
        setItem('TOUTIAO_CHANNELS', this.myChannels)
      }
    },
    // 切换频道
    onMyChannelClick (channel, index) {
      if (this.isEdit) {
        // 1 如果是固定频道 则不删除
        if (this.fixedChannel.includes(channel.id)) {
          return
        }
        // 2 编辑状态 删除频道
        this.myChannels.splice(index, 1)
        // 3 如果删除的激活频道之前的频道 则更新激活的频道项
        // 参数1：要删除的元素的开始索引（包括）
        // 参数2：删除的个数，如果不指定，则从参数1开始一直删除到最后
        if (index <= this.active) {
          // 让激活频道的索引 -1
          this.$emit('update-active', this.active - 1, true)
        }
        // 4 处理持久化
        this.deleteChannel(channel)
      } else {
        // 非编辑状态 执行切换频道
        this.$emit('update-active', index, false)
      }
    },
    async deleteChannel (channel) {
      try {
        if (this.user) {
          // 已登录 数据存储到线上
          await deleteUserChannel(channel.id)
        } else {
          // 未登录 存储到本地
          setItem('TOUTIAO_CHANNELS', this.myChannels)
        }
      } catch (err) {
        this.$toast('删除频道失败，请稍后再试')
      }
    }
  }
}
</script>

<style scoped lang="less">
.channel-edit {
  padding: 85px 0;
  .title-text {
    font-size: 32px;
    color: #333333;
  }

  .edit-btn {
    width: 104px;
    height: 48px;
    font-size: 26px;
    color: #f85959;
    border: 1px solid #f85959;
  }
    /deep/ .grid-item {
      width: 160px;
      height: 86px;
      .van-grid-item__content {
        white-space: nowrap;
        background-color: #f4f5f6;
        .van-grid-item__text, .text {
          font-size: 28px;
          color: #222;
          margin-top: 0;
        }
        .active {
          color: red;
        }
        .van-grid-item__icon-wrapper {
          position: unset;
        }
      }
    }
  /deep/ .my-grid {
    .grid-item {
      .van-icon-clear {
        position: absolute;
        right: -10px;
        top: -10px;
        font-size: 30px;
        color: #cacaca;
        z-index: 2;
      }
    }
  }
    /deep/ .recommend-grid {
      .grid-item {
        .van-grid-item__content {
          flex-direction: row;

          .van-icon-plus {
            font-size: 28px;
            margin-right: 6px;
          }

          //.van-grid-item__text {
          //  margin-top: 0;
          //}
        }
      }
    }
  }
</style>
