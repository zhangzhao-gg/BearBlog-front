<template>
  <view class="contact-root">
    <!-- <view class="contact-title">联系我们</view> -->
    <image v-if="qrCode" :src="qrCode" class="qr-img" mode="aspectFit" />
    <view v-else class="no-qr">暂无二维码</view>
  </view>
</template>

<script>
export default {
  name: 'Contact',
  data() {
    return {
      qrCode: ''
    }
  },
  onLoad(options) {
    if (options.qr) {
      this.qrCode = decodeURIComponent(options.qr)
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-root {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 100rpx;
  box-sizing: border-box;
}
.contact-title {
  font-size: 36rpx;
  color: #222;
  font-weight: 500;
  margin-bottom: 60rpx;
}
.qr-img {
  width: 340rpx;
  height: 340rpx;
  top: 100rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
  background: #fafafa;
}
.no-qr {
  color: #bbb;
  font-size: 28rpx;
  margin-top: 120rpx;
}
</style> 