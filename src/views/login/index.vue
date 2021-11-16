<template>
  <div class="login-container">
    <van-nav-bar class="page-nav-bar"
                 title="登录"
    >
      <van-icon slot="left" name="cross" @click="$router.back()"/>
    </van-nav-bar>
    <!--    登录表单-->
    <van-form ref="loginForm" @submit="onSubmit">
      <van-field
          v-model="user.mobile"
          required
          clearable
          name="mobile"
          placeholder="手机号"
          :rules="userFormRules.mobile"
          type="number"
          maxlength="11"
      >
        <!--        通过插槽自定义图标-->
        <template #left-icon>
          <i class="iconfont icon-shouji"></i>
        </template>
      </van-field>
      <van-field
          v-model="user.code"
          name="code"
          type="number"
          placeholder="请输入验证码"
          required
          :rules="userFormRules.code"
          maxlength="6"
      >
        <template #left-icon>
          <i class="iconfont icon-yanzhengma"></i>
        </template>
        <template #button>
          <!--          time 倒计时时间 单位毫秒 ss 表示时间格式只有秒 s 字符格式-->
          <van-count-down v-if="isCountDownShow" :time="1000 * 60" format="ss s" @finish="isCountDownShow = false"/>
          <van-button v-else class="send-code" native-type="button" round size="small" type="default"
                      @click="onSendSms">发送验证码
          </van-button>
        </template>
      </van-field>
      <div class="login-btn">
        <van-button class="login" block type="info" native-type="submit">登录</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { login, sendSms } from '@/api/user'

export default {
  name: 'LoginIndex',
  components: {},
  props: {},
  data () {
    return {
      user: {
        mobile: '',
        code: ''
      },
      userFormRules: {
        mobile: [{
          required: true,
          message: '手机号码不能为空'
        }, {
          pattern: /^1[35789]\d{9}/,
          message: '手机号码格式错误'
        }],
        code: [{
          required: true,
          message: '验证码不能为空'
        }, {
          pattern: /^\d{6}$/,
          message: '验证码格式错误'
        }]
      },
      isCountDownShow: false
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {
    async onSubmit () {
      // 获取表单数据
      // 加载提示
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0 // 提示持续时间 默认2秒 0表示不会停止 直到成功或者失败
      })
      try {
        const { data } = await login(this.user)
        this.$store.commit('setUser', data.data)
        this.$toast.success('登录成功')

        // 登录成功后跳转到原来的界面
        this.$router.back()
      } catch (err) {
        if (err.response.status === 400) {
          console.log('手机号或验证码错误', err)
          this.$toast.fail('手机号或验证码错误')
        } else {
          console.log('登录失败，请稍后再试', err)
          this.$toast.fail('登录失败，请稍后重试')
        }
      }
    },
    async onSendSms () {
      // 验证手机号
      try {
        await this.$refs.loginForm.validate('mobile') // 调用validate手动校验
      } catch (err) {
        return console.log('验证失败', err)
      }
      // 校验通过 显示倒计时
      this.isCountDownShow = true

      // 请求发送验证码
      try {
        await sendSms(this.user.mobile)
        this.$toast('发送成功')
      } catch (err) {
        // 发送失败，关闭倒计时
        this.isCountDownShow = false
        if (err.response.status === 429) {
          this.$toast('发送太频繁，请稍后再试')
        } else {
          this.$toast('发送失败，请稍后再试')
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  .iconfont {
    font-size: 37px;
  }

  .send-code {
    width: 152px;
    height: 46px;
    line-height: 46px;
    background-color: #ededed;
    font-size: 22px;
    color: #666;
    padding: 0;
  }

  .login-btn {
    padding: 53px 33px;

    .login {
      background-color: #6db4fb;
      border: none;
    }
  }
}
</style>
