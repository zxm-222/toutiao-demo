<template>
  <div class="article-container">
    <!--    导航栏-->
    <van-nav-bar class="page-nav-bar" left-arrow @click-left="$router.back()" title="黑马头条"></van-nav-bar>

    <div class="main-wrap">
      <!--    加载中-->
      <div v-if="loading" class="loading-wrap">
        <van-loading color="#3296fa" vertical>加载中</van-loading>
      </div>

      <!--      加载完成（文章详情）-->
      <div v-else-if="article.title" class="article-detail">
        <!--        文章标题-->
        <h1 class="article-title">{{ article.title }}</h1>

        <!--        用户信息-->
        <van-cell class="user-info" center :border="false">
          <van-image
              class="avatar"
              slot="icon"
              round
              fit="cover"
              :src="article.aut_photo"
          />
          <template #title>
            <div class="user-name">{{ article.aut_name }}</div>
          </template>
          <template #label>
            <div class="publish-date">{{ article.pubdate | relativeTime }}</div>
          </template>
          <!--
            模板中的 $event 是事件参数
            当我们传递给子组件的数据既要使用还要修改。
              传递：props
                :is-followed="article.is_followed"
              修改：自定义事件
                @update-is_followed="article.is_followed = $event"
            简写方式：在组件上使用 v-model
              value="article.is_followed"
              @input="article.is_followed = $event"

            如果需要修改 v-model 的规则名称，可以通过子组件的 model 属性来配置修改

            一个组件上只能使用一次 v-model，
            如果有多个数据需要实现类似于 v-model 的效果，咋办？
            可以使用属性的 .sync 修饰符。
           -->
          <follow-user
              class="follow-btn"
              v-model="article.is_followed"
              :user-id="article.aut_id"
          />
<!--          <van-button-->
<!--              v-if="article.is_followed"-->
<!--              class="follow-btn"-->
<!--              round-->
<!--              size="small"-->
<!--              @click="onFollow"-->
<!--              :loading="followLoading"-->
<!--          >-->
<!--            已关注-->
<!--          </van-button>-->
<!--          <van-button-->
<!--              v-else-->
<!--              class="follow-btn"-->
<!--              type="info"-->
<!--              color="#3296fa"-->
<!--              round-->
<!--              size="small"-->
<!--              icon="plus"-->
<!--              @click="onFollow"-->
<!--              :loading="followLoading"-->
<!--          >-->
<!--            关注-->
<!--          </van-button>-->
        </van-cell>

        <!--        文章内容-->
        <div class="article-content markdown-body" v-html="article.content" ref="article-content"></div>
        <van-divider>正文结束</van-divider>
      </div>
      <!--    加载失败404-->
      <div v-else-if="errStatus === 404" class="error-wrap">
        <van-icon name="failure"/>
        <p class="text">该资源不存在或已删除！</p>
      </div>

      <!--    加载失败（未知错误）-->
      <div v-else class="error-wrap">
        <van-icon name="failure"/>
        <p class="text">加载内容失败！</p>
        <van-button class="retry-btn" @click="loadArticle">点击重试</van-button>
      </div>
    </div>

    <!--  底部区域-->
    <div class="article-bottom">
      <van-button class="comment-btn" type="default" round size="small">写评论</van-button>
      <van-icon class="comment-icon" name="comment-o badge=123"/>
      <van-button class="btn-item" icon="star-o"/>
      <van-button class="btn-item" icon="good-job-o"/>
      <van-icon name="share" color="#777"></van-icon>
    </div>
  </div>
</template>

<script>
import { getArticleById } from '@/api/article'
import { ImagePreview } from 'vant'
// import { addFollow, deleteFollow } from '@/api/user'
import FollowUser from '@/components/follow-user'
export default {
  // 组件名称
  name: 'ArticleIndex',
  // 局部注册的组件
  components: {
    FollowUser
  },
  // 组件参数 接收来自父组件的数据
  props: {
    articleId: {
      type: [Number, String, Object],
      required: true
    }
  },
  // 组件状态值
  data () {
    return {
      article: {}, // 文章详情
      loading: true, // 加载中的loading状态
      errStatus: 0, // 失败的状态码
      followLoading: false
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
    this.loadArticle()
  },
  /**
   * el 被新创建的 vm.el 替换，并挂载到实例上去之后调用该钩子。
   * 如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.el 也在文档内。
   */
  mounted () {
  },
  // 组件方法
  methods: {
    async loadArticle () {
      // 展示loading加载中
      this.loading = true
      try {
        const { data } = await getArticleById(this.articleId)
        // 随机错误
        // if (Math.random() > 0.5) {
        //   JSON.parse('qwer')
        // }
        this.article = data.data

        // 初始化图片点击预览
        setTimeout(() => {
          this.previewImage()
        }, 0)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.errStatus = 404
        }
        // console.log('请求出错', err)
      }
      // 成功与否 都要关闭loading
      this.loading = false
    },
    previewImage () {
      // 得到所有的 img 节点
      const articleContent = this.$refs['article-content']
      const imgs = articleContent.querySelectorAll('img')

      // 获取所有 img 地址
      const images = []
      imgs.forEach((img, index) => {
        images.push(img.src)
        // 给每个 img 注册点击事件，在处理函数中调用预览
        img.onclick = () => {
          ImagePreview({
            // 预览的图片地址数组
            images,
            // 起始位置（从0开始）
            startPosition: index
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
@import "./github-markdown.css";

.article-container {
  .main-wrap {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
  }

  .article-detail {
    position: fixed;
    left: 0;
    right: 0;
    top: 92px;
    bottom: 88px;
    overflow-y: scroll;
    background-color: #fff;

    .article-title {
      font-size: 40px;
      padding: 50px 32px;
      margin: 0;
      color: #3a3a3a;
    }

    .user-info {
      padding: 0 32px;

      .avatar {
        width: 70px;
        height: 70px;
        margin-right: 17px;
      }

      .van-cell__label {
        margin-top: 0;
      }

      .user-name {
        font-size: 24px;
        color: #3a3a3a;
      }

      .publish-date {
        font-size: 23px;
        color: #b7b7b7;
      }

      .follow-btn {
        width: 170px;
        height: 58px;
      }
    }

    .article-content {
      padding: 55px 32px;

      /deep/ p {
        text-align: justify;
      }
    }
  }

  .loading-wrap {
    padding: 200px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }

  .error-wrap {
    padding: 200px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;

    .van-icon {
      font-size: 122px;
      color: #b4b4b4;
    }

    .text {
      font-size: 30px;
      color: #666666;
      margin: 33px 0 46px;
    }

    .retry-btn {
      width: 280px;
      height: 70px;
      line-height: 70px;
      border: 1px solid #c3c3c3;
      font-size: 30px;
      color: #666666;
    }
  }

  .article-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-sizing: border-box;
    height: 88px;
    border-top: 1px solid #d8d8d8;
    background-color: #fff;

    .comment-btn {
      width: 282px;
      height: 46px;
      border: 2px solid #eeeeee;
      font-size: 30px;
      line-height: 46px;
      color: #a7a7a7;
    }

    /deep/ .van-icon {
      font-size: 40px;
    }

    .comment-icon {
      top: 2px;
      color: #777;

      .van-info {
        font-size: 16px;
        background-color: #e22829;
      }
    }

    .btn-item {
      border: none;
      padding: 0;
      height: 40px;
      line-height: 40px;
      color: #777777;
    }

    .collect-btn--collected {
      color: #ffa500;
    }

    .like-btn--liked {
      color: #e5645f;
    }
  }
}
</style>
