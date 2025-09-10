<template>
  <view class="privacy-detail-root">
    <view class="privacy-detail-header">
    </view>
    <scroll-view scroll-y class="privacy-detail-content">
      <slot>
        <view class="privacy-detail-text">
          <text>
            用户协议的正文内容
          </text>
        </view>
      </slot>
    </scroll-view>
  </view>
</template>

<script>
import uIcon from '../../uni_modules/uview-ui/components/u-icon/u-icon.vue'
export default {
  name: 'Agreement',
  components: { uIcon },
  methods: {
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-detail-root {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
.privacy-detail-header {
  width: 88vw;
  max-width: 480px;
  display: flex;
  align-items: center;
  margin: 40rpx 0 24rpx 0;
}
.back-icon {
  margin-right: 16rpx;
}
.privacy-detail-title {
  font-size: 36rpx;
  color: #222;
  font-weight: 500;
}
.privacy-detail-content {
  width: 88vw;
  max-width: 480px;
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.04);
  padding: 32rpx;
}
.privacy-detail-text {
  font-size: 30rpx;
  color: #222;
  line-height: 1.8;
  white-space: pre-line;
}
</style> 