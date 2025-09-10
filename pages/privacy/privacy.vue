<template>
  <view class="privacy-root">
    <view class="privacy-header">
      <!-- <u-icon name="arrow-left" size="22" color="#333" class="back-icon" @tap="goBack" /> -->
      <!-- <text class="privacy-title">隐私设置</text> -->
    </view>
    <view class="privacy-list">
      <view class="privacy-item" v-for="(item, idx) in privacyList" :key="idx" @tap="onItemTap(item)">
        <text class="privacy-label">{{item.label}}</text>
        <u-icon name="arrow-right" size="18" color="#bbb" class="arrow" />
      </view>
    </view>
  </view>
</template>

<script>
import uIcon from '../../uni_modules/uview-ui/components/u-icon/u-icon.vue'
export default {
  name: 'Privacy',
  components: { uIcon },
  data() {
    return {
      privacyList: [
        { label: '用户协议' },
        { label: '隐私政策' },
        { label: '第三方合作目录' },
        { label: '个人信息收集清单' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    onItemTap(item) {
      // 跳转到对应的文本详情页面
      let map = {
        '用户协议': 'agreement',
        '隐私政策': 'policy',
        '第三方合作目录': 'thirdparty',
        '个人信息收集清单': 'collectlist'
      };
      let page = map[item.label];
      if (page) {
        uni.navigateTo({ url: `/pages/privacy/${page}` });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-root {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
  box-sizing: border-box;
}
.privacy-header {
  width: 88vw;
  max-width: 480px;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}
.back-icon {
  margin-right: 16rpx;
}
.privacy-title {
  font-size: 36rpx;
  color: #222;
  font-weight: 500;
}
.privacy-list {
  width: 88vw;
  max-width: 480px;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.04);
  padding: 16rpx 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.privacy-item {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx;
  border-bottom: 1px solid #f2f2f2;
  background: #fff;
  min-height: 80rpx;
  &:last-child {
    border-bottom: none;
  }
}
.privacy-label {
  font-size: 32rpx;
  color: #222;
  flex: 1;
}
.arrow {
  margin-left: auto;
}
</style> 