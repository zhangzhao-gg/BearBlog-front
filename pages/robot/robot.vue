<template>
  <view class="app-layout">
    <!-- 侧边栏 -->
    <view class="sidebar">
      <view class="logo-section">
        <view class="avatar-container">
          <image src="/static/man.png" mode="aspectFit" class="avatar-image" />
          <view class="avatar-glow"></view>
        </view>
        <view class="text-content">
          <text class="logo-text">小熊</text>
          <text class="logo-subtitle">您的专属森林朋友</text>
        </view>
      </view>
      
      <button class="new-chat-button" @click="newChat">
        <view class="button-content">
          <u-icon name="chat" size="26" color="#ffffff"></u-icon>
          <text class="button-text">新会话</text>
        </view>

      </button>
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <view class="chat-container">
        <!-- 消息列表 -->
        <scroll-view class="message-list" scroll-y scroll-into-view="bottom">
          <view
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'message-wrapper',
              message.isUser ? 'user-message-wrapper' : 'bot-message-wrapper'
            ]"
          >
            <view :class="[
              'message',
              message.isUser ? 'user-message' : 'bot-message'
            ]">
              <!-- 头像 -->
              <view class="message-avatar">
                <view :class="[
                  'avatar-circle',
                  message.isUser ? 'user-avatar' : 'bot-avatar'
                ]">
                  <u-icon
                    :name="message.isUser ? 'account' : 'chat'"
                    size="20"
                    :color="message.isUser ? '#FFFFFF' : '#8B4513'"
                  ></u-icon>
                </view>
              </view>
              
              <!-- 消息内容 -->
              <view class="message-content">
                <view :class="[
                  'message-bubble',
                  message.isUser ? 'user-bubble' : 'bot-bubble'
                ]">
                  <rich-text :nodes="message.content" class="message-text"></rich-text>
                  
                  <!-- 加载动画 -->
                  <view
                    class="loading-container"
                    v-if="message.isThinking || message.isTyping"
                  >
                    <view class="loading-dots">
                      <view class="dot dot-1"></view>
                      <view class="dot dot-2"></view>
                      <view class="dot dot-3"></view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view id="bottom"></view>
        </scroll-view>

        <!-- 通知弹窗 -->
        <u-modal 
          :show="notificationPopup" 
          title="计划表已生成"
          content="行为激活表已创建完成，是否立即查看？"
          :showCancelButton="true"
          @confirm="viewPlan()"
          :overlay-style="{ backgroundColor: 'rgba(139, 69, 19, 0.1)' }"
        ></u-modal>

        <!-- 计划编辑弹窗 -->
        <u-popup :show="planModal" mode="center" :overlay-style="{ backgroundColor: 'rgba(139, 69, 19, 0.2)' }">
          <view class="plan-modal-content">
            <view class="modal-header">
              <view class="table-title">{{planTitle}}</view>
              <view class="title-decoration"></view>
            </view>
            
            <scroll-view class="plan-scroll" scroll-y >
              <u-collapse>
                <u-collapse-item
                  v-for="(item, index) in planData"
                  :key="item.id"
                  :title="'ID: ' + item.id + ' - ' + item.name"
                  :name="item.id"
                  :border="false"
                >
                  <view class="collapse-content">
                    <u-form :model="item" label-position="top">
                      <view class="form-grid">
                        <view class="form-item">
                          <u-form-item label="名称" :border-bottom="false">
                            <u-input 
                              v-model="item.name" 
                              placeholder="请输入名称"
                              :custom-style="inputStyle"
                            />
                          </u-form-item>
                        </view>
                        
                        <view class="form-item">
                          <u-form-item label="描述" :border-bottom="false">
                            <u-input 
                              v-model="item.description" 
                              placeholder="请输入描述"
                              type="textarea"
                              :auto-height="true"
                              :custom-style="textareaStyle"
                            />
                          </u-form-item>
                        </view>
                        
                        <view class="form-item">
                          <u-form-item label="计划时间" :border-bottom="false">
                            <u-datetime-picker
                              v-model="item.scheduledTime"
                              mode="datetime"
                              :show="show_time"
							@confirm="confirmDateTime"
							@cancel="cancelDateTime"
                            />
                          </u-form-item>
                          <view class="time-display" @click="openDatePicker(index)">
                            {{$u.timeFormat(item.scheduledTime, 'yyyy年mm月dd日hh点MM分')}}
                          </view>
                        </view>
                        
                        <view class="form-item">
                          <u-form-item  :border-bottom="false">
							  持续时间(分钟)
                            <u-number-box 
                              v-model="item.duration" 
                              :min="0"
                              :positive-integer="true"
                              :button-style="numberBoxStyle"
                            />
                          </u-form-item>
                        </view>
                        
                        <view class="form-item">
                          <u-form-item label="难度" :border-bottom="false">
                            <u-rate 
                              :count="5" 
                              v-model="item.difficulty"
                              active-color="#D2691E"
                              inactive-color="#F5DEB3"
                            />
                          </u-form-item>
                        </view>
                      </view>
                    </u-form>
                  </view>
                </u-collapse-item>
              </u-collapse>
            </scroll-view>
            
            <view class="modal-footer">
              <button class="modal-button cancel-button" @click="cancelPlanChanges">
                取消
              </button>
              <button class="modal-button save-button" @click="savePlanChanges">
                保存
              </button>
            </view>
          </view>
        </u-popup>

        <!-- 输入区域 -->
        <view class="input-container">
          <view class="input-wrapper">
            <u-input
              v-model="inputMessage"
              placeholder="请输入消息..."
              @confirm="sendMessage"
              :clearable="true"
              :custom-style="chatInputStyle"
              class="chat-input"
            ></u-input>
            <button 
              @click="sendMessage" 
              :disabled="isSending" 
              :class="['send-button', { 'sending': isSending }]"
            >
              <u-icon 
                :name="isSending ? 'pause' : 'arrow-right'" 
                size="20" 
                color="#FFFFFF"
                :class="{ 'rotating': isSending }"
              ></u-icon>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>


export default {
  data() {
    return {
      socket: null,
      notificationVisible: false,
      newPlanId: '',
      planModalVisible: false,
      planData: [],
      planTitle: '',
      activeCollapse: [],
      isSending: false,
      uuid: '',
      inputMessage: '',
      messages: [],
      notificationPopup: false,
      planModal: false,
      show_time: false,
	  currentIndex:0,
	  bottom:"bottom",
      
      // 样式配置
      inputStyle: {
        backgroundColor: '#FFF8DC',
        borderRadius: '12px',
        border: '1px solid #DEB887',
        padding: '12px'
      },
      textareaStyle: {
        backgroundColor: '#FFF8DC',
        borderRadius: '12px',
        border: '1px solid #DEB887',
        padding: '12px',
        minHeight: '80px'
      },
      numberBoxStyle: {
        backgroundColor: '#D2691E',
        borderRadius: '8px'
      },
      chatInputStyle: {
        backgroundColor: '#FFFFFF',
        borderRadius: '25px',
        border: '2px solid #DEB887',
        padding: '12px 20px'
      }
    }
  },

  onLoad() {
    this.initUUID();
    this.hello();
    this.initWebSocket();
  },

  onUnload() {
    if (this.socket) {
      this.socket.close();
    }
  },

  methods: {
    confirmDateTime(e){
		console.log(e.value);
		this.planData[this.currentIndex].scheduledTime = uni.$u.timeFormat(e.value, 'yyyy-mm-dd hh:MM');;
		this.show_time = false;
		
	},
	cancelDateTime(){
		this.show_time = false;
	},
	
	openDatePicker(index){
		console.log(index);
		this.show_time=true;
		this.currentIndex=index;
	},
	
    // WebSocket 初始化
    initWebSocket() {
      const wsUrl = `ws://127.0.0.1:8080/api/ws/plan-notifications?userId=${this.uuid}`;
      console.log(wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'plan_created') {
          this.newPlanId = data.planId;
          this.notificationPopup = true;
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    },
    
    // 立即查看计划
    viewPlan() {
      this.notificationPopup = false;
      this.openPlanModal(this.newPlanId);
    },

    // 打开计划模态框
    openPlanModal(planId) {
      uni.$u.get('/cbt/findCbtPlanAllContentById', {cbtPlanId: planId}).then(res => {
        this.planData = res.data.cbtActivityVOS;
        this.activeCollapse = res.data.cbtActivityVOS.map(item => item.id);
        this.planTitle = res.data.planTitle;
        this.planModal = true;
      }).catch(err => {
        console.error('获取文章失败:', err);					
      }).finally(() => {
        this.loading = false;
      });
    },

    // 保存计划更改
    savePlanChanges() {
		  const requestData = {
			cbtActivityParams: this.planData,
		  };
		  var tokenName = uni.getStorageSync('tokenName');
		  var tokenValue = uni.getStorageSync('tokenValue');
		  uni.request({
			url: this.$store.state.baseUrl+'/cbt/updateCbtPlanAllContent',
			method: 'POST',
			data: requestData,
			header: {
				  'Content-Type': 'application/json', // 关键！声明 JSON 类型
				  [tokenName]:tokenValue,
				},
			success: () => {
			  uni.showToast({
				title: '保存成功',
				icon: 'success'
			  });
			},
			fail: (error) => {
			  console.error('更新错误:', error);
			}
		  });
	},
	  
	  

    // 取消计划更改
    cancelPlanChanges() {
      this.planModal = false;
    },

    // 滚动到底部
    scrollToBottom() {
      // 在uniapp中，scroll-view有scroll-into-view属性可以控制滚动位置
    },

    // 初始问候
    hello() {
      this.sendRequest('你好');
    },

    // 发送消息
    sendMessage() {
      if (this.inputMessage.trim()) {
        this.sendRequest(this.inputMessage.trim());
        this.inputMessage = '';
      }
    },

    // 发送请求
    sendRequest(message) {
      this.isSending = true;
      const userMsg = {
        isUser: true,
        content: message,
        isTyping: false,
        isThinking: false,
      };
      
      if(this.messages.length > 0){
        this.messages.push(userMsg);
      }

      // 添加机器人加载消息
      const botMsg = {
        isUser: false,
        content: '',
        isTyping: true,
        isThinking: false,
      };
      this.messages.push(botMsg);
      const lastMsg = this.messages[this.messages.length - 1];
      this.scrollToBottom();
	 var tokenName = uni.getStorageSync('tokenName');
	 var tokenValue = uni.getStorageSync('tokenValue');
	 // 初始化header对象
	 const header = {};
	 
	 // 只有当tokenName和tokenValue都存在且有效时才添加到header
	 if (tokenName && typeof tokenName === 'string' && tokenName.trim() && tokenValue) {
	   header[tokenName.trim()] = tokenValue;
	 }
      uni.request({
        url: this.$store.state.baseUrl+'/xiaozhi/chat',
        method: 'POST',
		enableChunked: true,
        data: { memoryId: this.uuid, message },
        responseType: 'text',
		header:header,
        success: (res) => {
		  if(res.data.code==999){//每次发送请求都是带token的，跟 satoken 进行结合
			  uni.removeStorageSync('tokenName');
			  uni.removeStorageSync('tokenValue');
			  setTimeout(() => {
			  	uni.reLaunch({
			  		url: "/pages/login/login"
			  	});
			  }, 2000);
		  }
          if (typeof res.data === 'string') {
            lastMsg.content = res.data;
          }
          this.messages[this.messages.length - 1].isTyping = false;
          this.isSending = false;
        },
        fail: (error) => {
          console.error('请求失败:', error);
          this.messages[this.messages.length - 1].content = '请求失败，请重试';
          this.messages[this.messages.length - 1].isTyping = false;
          this.isSending = false;
        }
      });
    },

    // 初始化 UUID
    initUUID() {
      let storedUUID = uni.getStorageSync('memory_uuid');
      // 如果没有存储的UUID，则生成新的
      if (!storedUUID) {
        // 生成基于时间的唯一ID：时间戳 + 随机数
        const timestamp = new Date().getTime().toString(); // 13位时间戳
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4位随机数，不足补0
        storedUUID = `${timestamp}${randomNum}`; // 组合成唯一ID
        // 存储生成的UUID
        uni.setStorageSync('memory_uuid', storedUUID);
      }
      
      this.uuid = storedUUID;
    },


    // 转换特殊字符
    convertStreamOutput(output) {
      return output
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },

    // 新建会话
    newChat() {
      uni.removeStorageSync('memory_uuid');
      uni.reLaunch({
        url: '/pages/robot/robot'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 茶色主题色彩变量 */
$primary-brown: #8B4513;
$light-brown: #D2691E;
$cream: #FFF8DC;
$beige: #F5DEB3;
$wheat: #F5DEB3;
$tan: #DEB887;
$warm-white: #FFFEF7;

/* 应用布局 */
.app-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, $cream 0%, $beige 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, $warm-white 0%, $cream 100%);
  border-right: 2px solid $tan;
  padding: 30px 20px;
  box-shadow: 4px 0 20px rgba(139, 69, 19, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $primary-brown, $light-brown, $primary-brown);
  }
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.avatar-image {
  width: 120px !important;
  height: 120px !important;
  border-radius: 50%;
  border: 4px solid $tan;
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(139, 69, 19, 0.3);
  }
}

.avatar-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, $light-brown, transparent, $light-brown);
  opacity: 0;
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: $primary-brown;
  display: block;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 14px;
  color: $light-brown;
  opacity: 0.8;
  display: block;
}

.new-chat-button {
  width: 100%;
  background: linear-gradient(135deg, $primary-brown 0%, $light-brown 100%);
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.button-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.button-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: all 0.6s ease;
}

.new-chat-button:active .button-ripple {
  width: 300px;
  height: 300px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $warm-white;
  height: 100vh;
  // overflow: hidden;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  // overflow: hidden;
}

/* 消息列表 */
.message-list {
	
  // flex: 1;
  // padding: 20px 20px 10px 20px;
  overflow-y: auto;
  // height: 0; /* 这个很重要，让flex: 1 生效 */
  // min-height: 0; /* 防止flex子项收缩问题 */
}

.message-wrapper {
  // margin-bottom: 20px;
  animation: messageSlideIn 0.4s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
}

.user-message-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10rpx;
  margin-top:10rpx;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar {
  background: linear-gradient(135deg, $primary-brown, $light-brown);
}

.bot-avatar {
  background: linear-gradient(135deg, $cream, $beige);
  border: 2px solid $tan;
}

.message-content {
  flex: 1;
}

.message-bubble {
  padding: 16px 20px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.user-bubble {
  background: linear-gradient(135deg, $primary-brown, $light-brown);
  color: white;
  border-bottom-right-radius: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -8px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-left-color: $light-brown;
    border-bottom: none;
  }
}

.bot-bubble {
  background: linear-gradient(135deg, $warm-white, $cream);
  color: $primary-brown;
  border: 1px solid $tan;
  border-bottom-left-radius: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -9px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-right-color: $cream;
    border-bottom: none;
  }
}

.message-text {
  line-height: 1.6;
  word-wrap: break-word;
}

/* 加载动画 */
.loading-container {
  margin-top: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot-1 { animation-delay: 0s; }
.dot-2 { animation-delay: 0.2s; }
.dot-3 { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 60%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 计划模态框 */
.plan-modal-content {
  background: $warm-white;
  border-radius: 20px;
  padding: 30px;
  max-width: 90vw;
  max-height: 80vh;
  box-shadow: 0 20px 60px rgba(139, 69, 19, 0.3);
  border: 2px solid $tan;
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.table-title {
  font-weight: 700;
  font-size: 24px;
  color: $primary-brown;
  margin-bottom: 10px;
}

.title-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, $primary-brown, $light-brown);
  margin: 0 auto;
  border-radius: 2px;
}

.plan-scroll {
  max-height: 400px;
  margin-bottom: 20px;
}

.collapse-content {
  padding: 20px;
  background: $cream;
  border-radius: 12px;
  margin-top: 10px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  background: $warm-white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid $tan;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $light-brown;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  }
}

.time-display {
  background: $beige;
  padding: 12px 16px;
  border-radius: 8px;
  color: $primary-brown;
  text-align: center;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: $tan;
    transform: translateY(-1px);
  }
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.modal-button {
  padding: 12px 30px;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.cancel-button {
  background: $beige;
  color: $primary-brown;
  border: 2px solid $tan;
  
  &:hover {
    background: $tan;
    transform: translateY(-2px);
  }
}

.save-button {
  background: linear-gradient(135deg, $primary-brown, $light-brown);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
  }
}

/* 输入区域 */
.input-container {
  flex-shrink: 0; /* 防止输入区域被压缩 */
  padding: 15px 20px 20px 20px;
  background: linear-gradient(180deg, transparent, rgba(245, 222, 179, 0.3));
  border-top: 1px solid $tan;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-input {
  flex: 1;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: $light-brown !important;
    box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.1) !important;
  }
}

.send-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, $primary-brown, $light-brown);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.sending {
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 - 移动端优化 */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    padding: 15px;
    flex-shrink: 0;
    border-right: none;
    border-bottom: 2px solid $tan;
    
    &::before {
      height: 2px;
    }
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    text-align: left;
  }
  
  .avatar-container {
    margin-bottom: 0;
    flex-shrink: 0;
  }
  
  .avatar-image {
    width: 60px !important;
    height: 60px !important;
  }
  
  .text-content {
    flex: 1;
    align-items: flex-start;
  }
  
  .logo-text {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .logo-subtitle {
    font-size: 12px;
  }
  
  .new-chat-button {
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 120px;
    margin-left: auto;
    flex-shrink: 0;
  }
  
  .button-text {
    font-size: 14px;
  }
  
  .main-content {
    flex: 1;
    height: 0; /* 让flex生效 */
    min-height: 0;
    overflow: hidden;
  }
  
  .chat-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .message-list {
    // flex: 1;
    // padding: 15px 15px 10px 15px;
    // height: 0;
    // min-height: 0;
    overflow-y: auto;
  }
  
  .message {
    max-width: 90%;
  }
  
  .message-bubble {
    padding: 12px 16px;
  }
  
  .input-container {
    flex-shrink: 0;
    padding: 10px 15px 15px 15px;
  }
  
  .input-wrapper {
    gap: 8px;
  }
  
  .send-button {
    width: 45px;
    height: 45px;
  }
  
  .plan-modal-content {
    padding: 20px;
    max-width: 95vw;
    max-height: 85vh;
  }
  
  .table-title {
    font-size: 20px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .sidebar {
    padding: 10px;
  }
  
  .logo-section {
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .avatar-image {
    width: 50px !important;
    height: 50px !important;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .new-chat-button {
    padding: 10px 12px;
    max-width: 100px;
  }
  
  .button-text {
    font-size: 12px;
  }
  
  .message-list {
    padding: 10px;
  }
  
  .input-container {
    padding: 8px 10px 12px 10px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: $cream;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, $tan, $light-brown);
  border-radius: 4px;
  
  &:hover {
    background: linear-gradient(180deg, $light-brown, $primary-brown);
  }
}
</style>