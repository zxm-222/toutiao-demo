<template>
  <div class="user-profile">
<!--    导航栏-->
    <van-nav-bar
      class="page-nav-bar"
      title="个人信息"
      left-arrow
      @click-left="$router.back()"
    />
    <input
        type="file"
        hidden
        ref="file"
        @change="onFileChange"
    >
    <van-cell title="头像" class="photo-cell" is-link  center @click="$refs.file.click()">
      <van-image
        class="avatar"
        fit="cover"
        round
        :src="user.photo"
      />
    </van-cell>
    <van-cell title="昵称" :value="user.name" is-link @click="isUpdateNameShow = true"/>
    <van-cell title="性别" :value="user.gender === 0 ? '男' : '女'" is-link @click="isUpdateGenderShow = true"/>
    <van-cell title="生日" :value="user.birthday" is-link @click="isUpdateBirthdayShow = true"/>
<!--    编辑昵称弹层-->
    <van-popup
      v-model="isUpdateNameShow"
      style="height: 100%"
      position="bottom"
    >
      <update-name
          @close="isUpdateNameShow=false"
          v-model="user.name"
          v-if="isUpdateNameShow"
      />
    </van-popup>
    <!-- 编辑性别弹层 -->
    <van-popup
        v-model="isUpdateGenderShow"
        position="bottom"
    >
      <update-gender
          @close="isUpdateGenderShow = false"
          v-model="user.gender"
          v-if="isUpdateGenderShow"
      />
    </van-popup>
    <!-- 编辑生日弹层 -->
    <van-popup
        v-model="isUpdateBirthdayShow"
        position="bottom">
      <update-birthday
          v-model="user.birthday"
          @click="isUpdateBirthdayShow=false"
          v-if="isUpdateBirthdayShow"
      />
    </van-popup>
    <!-- 编辑头像 -->
    <van-popup
        v-model="isUpdatePhotoShow"
        position="bottom"
        style="height: 100%;"
    >
      <update-photo
          v-if="isUpdatePhotoShow"
          :img="img"
          @close="isUpdatePhotoShow = false"
          @update-photo="user.photo = $event"
      />
    </van-popup>
  </div>
</template>

<script>
import { getUserProfile } from '@/api/user'
import UpdateName from '@/views/user-profile/components/update-name'
import UpdateGender from '@/views/user-profile/components/update-gender'
import UpdateBirthday from '@/views/user-profile/components/update-birthday'
import UpdatePhoto from '@/views/user-profile/components/update-photo'
export default {
  // 组件名称
  name: 'UserProfile',
  // 局部注册的组件
  components: { UpdatePhoto, UpdateBirthday, UpdateName, UpdateGender },
  // 组件参数 接收来自父组件的数据
  props: {},
  // 组件状态值
  data () {
    return {
      user: {}, // 个人信息
      isUpdateNameShow: false,
      isUpdateGenderShow: false,
      isUpdateBirthdayShow: false,
      isUpdatePhotoShow: false,
      img: null // 预览的图片
    }
  },
  // 计算属性
  computed: {},
  // 侦听器
  watch: {},
  // 生命周期钩子   注：没用到的钩子请自行删除
  /**
   * 组件实例创建完成，属性已绑定，但DOM还未生成，el属性还不存在
   */
  created () {
    this.loadUserProfile()
  },
  /**
   * el 被新创建的 vm.el 替换，并挂载到实例上去之后调用该钩子。
   * 如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.el 也在文档内。
   */
  mounted () {
  },
  // 组件方法
  methods: {
    async loadUserProfile () {
      try {
        const { data } = await getUserProfile()
        this.user = data.data
      } catch (err) {
        this.$toast('获取数据失败')
      }
    },
    onFileChange () {
      // 获取文件对象
      const file = this.$refs.file.files[0]
      // 基于文章对象获取 blob 数据
      this.img = window.URL.createObjectURL(file)
      // 展示预览图片弹出层
      this.isUpdatePhotoShow = true
      // file-input 如果选了同一个文件不会触发 change 事件
      // 解决办法就是每次使用完毕，把它的 value 清空
      this.$refs.file.value = ''
    }
  }
}
</script>

<style scoped lang="less">
.user-profile {
  .avatar {
    width: 60px;
    height: 60px;
  }
  .van-popup {
    background: #f5f7f9;
  }
  .photo-cell {
    .van-cell__value {
      display: flex;
      flex-direction: row-reverse;
    }
  }
}
</style>
