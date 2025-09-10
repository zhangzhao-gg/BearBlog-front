<template>
  <view class="setting-root">
    <view class="setting-list">
      <view class="setting-item">
        <image class="icon" src="/static/img/版本.svg" mode="aspectFit" />
        <text class="label">当前版本</text>
        <text class="versionNumber">{{ settingInfo.versionNumber || '-' }}</text>
        <u-icon name="arrow-right" size="18" color="#ccc" class="arrow" />
      </view>
      <view class="setting-item" @tap="goToPrivacy">
        <image class="icon" src="/static/img/隐私.svg" mode="aspectFit" />
        <text class="label">隐私设置</text>
        <u-icon name="arrow-right" size="18" color="#ccc" class="arrow" />
      </view>
      <view class="setting-item" @tap="goToContact">
        <image class="icon" src="/static/img/联系我们.svg" mode="aspectFit" />
        <text class="label">联系我们</text>
        <u-icon name="arrow-right" size="18" color="#ccc" class="arrow" />
      </view>
      <view class="setting-item" @tap="signOut">
        <image class="icon" src="/static/img/我的.svg" mode="aspectFit" />
        <text class="label">退出登录</text>
        <u-icon name="arrow-right" size="18" color="#ccc" class="arrow" />
      </view>
    </view>
  </view>
</template>

<script>
import uIcon from '../../uni_modules/uview-ui/components/u-icon/u-icon.vue'
export default {
  name: 'Setting',
  components: { uIcon },

  data(){
    return{
        settingInfo: {
        versionNumber: '',
        qrCode: ''
      }
    }
  },
  onLoad() {
    this.fetchSettingInfo();
  },
  methods: {
    goToPrivacy() {
      uni.navigateTo({ url: '/pages/privacy/privacy' });
    },
    goToContact() {
      uni.navigateTo({ url: '/pages/contact/contact?qr=' + encodeURIComponent(this.settingInfo.qrCode) });
    },
    signOut() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.$u.http.delete('/user/signOut', {}).then(resp => {
          uni.removeStorageSync('accountId');
          uni.reLaunch({ url: '/pages/login/login' });
        }).catch(() => {
          uni.showToast({ title: '退出失败', icon: 'none' });
        })
      }
    }
  });
},
    //获取版本号和二维码等设置信息
    fetchSettingInfo() {
      uni.$u.get('/profile/getSettingInfo', {}).then(res => {
        console.log('settingInfo接口返回', res);
        if (res.code === 200 && res.data) {
          this.settingInfo = res.data.settingInfo || res.data;
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.setting-root {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 80rpx;
  box-sizing: border-box;
}
.setting-list {
  width: 88vw;
  max-width: 480px;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.04);
  padding: 32rpx 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.setting-item {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx;
  border-bottom: 1px solid #f2f2f2;
  background: #fff;
  position: relative;
  min-height: 80rpx;
  &:last-child {
    border-bottom: none;
  }
}
.icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 40rpx;
  flex-shrink: 0;
}
.label {
  font-size: 34rpx;
  color: #222;
  flex: 1;
  letter-spacing: 1rpx;
}
.versionNumber {
  font-size: 28rpx;
  color: #c6c3c3;
  margin-right: 250rpx;
}
.arrow {
  margin-left: auto;
}
</style> 