<template>
	
  <view class="app-layout">

    <view class="sidebar">
      <view class="logo-section">
        <image src="/static/man.png" mode="aspectFit" style="width: 160px; height: 160px;" />
        <text class="logo-text">行为激活师</text>
      </view>
      <button class="new-chat-button" @click="newChat">
        <u-icon name="chat-fill" size="16"></u-icon>
        <text>新会话</text>
      </button>
    </view>
    <view class="main-content">
      <view class="chat-container">
        <scroll-view class="message-list" scroll-y>
          <view
            v-for="(message, index) in messages"
            :key="index"
            :class="
              message.isUser ? 'message user-message' : 'message bot-message'
            "
          >
            <!-- 会话图标 -->
             <u-icon
              :name="message.isUser ? 'account' : 'chat'"
              size="30"
              class="message-icon"
            ></u-icon>
            <!-- 会话内容 -->
            <view>
              <rich-text :nodes="message.content"></rich-text>
              <!-- loading -->
              <view
                class="loading-dots"
                v-if="message.isThinking || message.isTyping"
              >
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>
        </scroll-view>
		
		<view>
			<u-modal :show="notificationPopup" 
			title="计划表已生成"
			content="行为激活表已创建完成，是否立即查看？"
			:showCancelButton="true"
			 @confirm="viewPlan()"></u-modal>
		</view>
		<u-popup :show="planModal" mode="center">
		  <view class="plan-modal-content">
		    <view class="table-title" style="font-weight: 600; font-size: 22px; margin-bottom: 10px;">
		      {{planTitle}}
		    </view>
		    <u-collapse >
		      <u-collapse-item
		        v-for="(item, index) in planData"
		        :key="item.id"
		        :title="'ID: ' + item.id + ' - ' + item.name"
		        :name="item.id"
		      >
		        <view class="collapse-content">
		          <u-form :model="item" label-position="top">
		            <!-- 移除u-row/u-col布局，直接使用view排列 -->
		            <view class="form-item">
		              <u-form-item label="名称">
		                <u-input v-model="item.name" placeholder="请输入名称" />
		              </u-form-item>
		            </view>
		            
		            <view class="form-item">
		              <u-form-item label="描述">
		                <u-input 
		                  v-model="item.description" 
		                  placeholder="请输入描述"
		                  type="textarea"
		                  :auto-height="true"
		                />
		              </u-form-item>
		            </view>
		            
		            <view class="form-item">
		              <u-form-item label="计划时间" >
		                <u-datetime-picker
		                  v-model="item.scheduledTime"
		                  mode="datetime"
		                  :show="show_time"
		                />
		              </u-form-item>
					  <view @click="show_time=true">
						  {{$u.timeFormat(item.scheduledTime, 'yyyy年mm月dd日hh点MM分')}}
					  </view>
					  
		            </view>
		            
		            <view class="form-item">
		              <u-form-item label="持续时间(分钟)">
		                <u-number-box 
		                  v-model="item.duration" 
		                  :min="0"
		                  :positive-integer="true"
		                />
		              </u-form-item>
		            </view>
		            
		            <view class="form-item">
		              <u-form-item label="难度">
		                <u-rate 
		                  :count="5" 
		                  v-model="item.difficulty"
		                  active-color="#2979ff"
		                />
		              </u-form-item>
		            </view>
		          </u-form>
		        </view>
		      </u-collapse-item>
		    </u-collapse>
		    <view class="modal-footer">
		      <u-button @click="cancelPlanChanges">取消</u-button>
		      <u-button type="primary" @click="savePlanChanges">保存</u-button>
		    </view>
		  </view>
		</u-popup>

        <view class="input-container">
          <u-input
              v-model="inputMessage"
              placeholder="请输入消息"
              @confirm="sendMessage"
              :clearable="true"
          ></u-input>
          <button @click="sendMessage" :disabled="isSending" class="send-button"
            >发送</button
          >
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
		  show_time:false,

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
		  confirm_test(){
				this.show_time_test=false;
		  },
	    //websocket
	    initWebSocket() {
	      const wsUrl = `ws://127.0.0.1:8080/api/ws/plan-notifications?userId=${this.uuid}`;
	      console.log(wsUrl);
	      this.socket = new WebSocket(wsUrl);
	
	      this.socket.onmessage = (event) => {
	        const data = JSON.parse(event.data);
	        if (data.type === 'plan_created') {
	          this.newPlanId = data.planId;
	          this.notificationPopup=true;
	        }
	      };
	
	      this.socket.onclose = () => {
	        console.log('WebSocket disconnected');
	        // 可添加重连逻辑
	      };
	    },
	    
	    //立刻查看
	    viewPlan() {
	      this.notificationPopup=false;
	      this.openPlanModal(this.newPlanId);
	    },
	
	    openPlanModal(planId) {
	      // uni.request({
	      //   url: `/api/cbt/findCbtPlanAllContentById?cbtPlanId=${planId}`,
	      //   success: (response) => {
	      //     this.planData = response.data.data.cbtActivityVOS;
	      //     this.activeCollapse = response.data.data.cbtActivityVOS.map(item => item.id);
	      //     this.planTitle = response.data.data.planTitle;
	      //     this.planModal=true;
	      //   }
	      // });
		  
		  uni.$u.get('/cbt/findCbtPlanAllContentById', {cbtPlanId:planId}).then(res => {
			this.planData = res.data.cbtActivityVOS;
			this.activeCollapse = res.data.cbtActivityVOS.map(item => item.id);
			this.planTitle = res.data.planTitle;
			this.planModal=true;
		  	
		  }).catch(err => {
		  	console.error('获取文章失败:', err);					
		  }).finally(() => {
		  	this.loading = false;
		  });
	    },
		
		
	
	    savePlanChanges() {
	      const requestData = {
	        cbtActivityParams: this.planData,
	      };
	      
	      uni.request({
	        url: '/api/cbt/updateCbtPlanAllContent',
	        method: 'POST',
	        data: requestData,
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
	      
	      this.planModal=false;
	    },
	
	    cancelPlanChanges() {
	      this.planModal=false;
	    },
	
	    scrollToBottom() {
	      // 在uniapp中，scroll-view有scroll-into-view属性可以控制滚动位置
	      // 需要在模板中设置scroll-into-view属性
	    },
	
	    hello() {
	      this.sendRequest('你好');
	    },
	
	    sendMessage() {
	      if (this.inputMessage.trim()) {
	        this.sendRequest(this.inputMessage.trim());
	        this.inputMessage = '';
	      }
	    },
	
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
	        content: '', // 增量填充
	        isTyping: true, // 显示加载动画
	        isThinking: false,
	      };
	      this.messages.push(botMsg);
	      const lastMsg = this.messages[this.messages.length - 1];
	      this.scrollToBottom();
	
	      uni.request({
	        url: this.$store.state.baseUrl+'/xiaozhi/chat',
	        method: 'POST',
	        data: { memoryId: this.uuid, message },
	        responseType: 'text',
	        success: (res) => {
	          // 处理流式响应
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
	      let storedUUID = uni.getStorageSync('user_uuid');
	      if (!storedUUID) {
	        storedUUID = "111";
	        uni.setStorageSync('user_uuid', storedUUID);
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
	
	    newChat() {
	      uni.removeStorageSync('user_uuid');
	      uni.reLaunch({
	        url: '/pages/robot/robot'
	      });
	    }
	  }
	};

</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #EDE6DB, #D1C4A1);
  color: #4B3B2B;
}

.sidebar {
  width: 220px;
  background-color: #6B4C3B;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 2px 0 8px rgba(107, 76, 59, 0.4);
  transition: background-color 0.3s ease;
}

.sidebar:hover {
  background-color: #7A5A47;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section image {
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(107, 76, 59, 0.6);
  transition: transform 0.3s ease;
}

.logo-section image:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  margin-top: 15px;
  color: #F5F1E9;
  text-shadow: 0 1px 3px rgba(75, 59, 43, 0.7);
}

.new-chat-button {
  width: 100%;
  margin-top: 30px;
  background-color: #8B6D5C;
  color: white;
  font-weight: 600;
  border-radius: 25px;
  box-shadow: 0 4px 8px rgba(139, 109, 92, 0.6);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.new-chat-button:hover {
  background-color: #7A5A47;
  box-shadow: 0 6px 12px rgba(122, 90, 71, 0.8);
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #F5F1E9;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(107, 76, 59, 0.15);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background-color: #FFF9F0;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(107, 76, 59, 0.05);
}

.message {
  margin-bottom: 15px;
  padding: 15px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  font-size: 16px;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(107, 76, 59, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.user-message {
  max-width: 70%;
  background-color: #A67B5B;
  color: white;
  align-self: flex-end;
  flex-direction: row-reverse;
  box-shadow: 0 4px 12px rgba(166, 123, 91, 0.6);
}

.user-message:hover {
  background-color: #8B6D5C;
  box-shadow: 0 6px 16px rgba(139, 109, 92, 0.8);
}

.bot-message {
  max-width: 75%;
  background-color: #EDE6DB;
  color: #4B3B2B;
  align-self: flex-start;
  box-shadow: 0 4px 12px rgba(237, 230, 219, 0.8);
}

.bot-message:hover {
  background-color: #D1C4A1;
  box-shadow: 0 6px 16px rgba(209, 196, 161, 0.9);
}

.message-icon {
  margin: 0 15px;
  font-size: 1.4em;
  color: #7A5A47;
  flex-shrink: 0;
}

.loading-dots {
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.dot {
  display: inline-block;
  margin-left: 6px;
  width: 10px;
  height: 10px;
  background-color: #8B6D5C;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(2) {
  animation-delay: -0.7s;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.7);
    opacity: 0.5;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-container {
  display: flex;
}

.input-container .uni-easyinput {
  flex: 1;
  margin-right: 15px;
  border-radius: 25px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(107, 76, 59, 0.1);
  transition: box-shadow 0.3s ease;
}

.input-container .uni-easyinput:hover {
  box-shadow: 0 0 8px #7A5A47;
}

.input-container .uni-easyinput:focus-within {
  box-shadow: 0 0 8px #7A5A47;
}

.input-container button {
  border-radius: 25px;
  font-weight: 600;
  padding: 10px 25px;
  box-shadow: 0 4px 12px rgba(139, 109, 92, 0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.input-container button:disabled {
  background-color: #BBAA99;
  box-shadow: none;
  cursor: not-allowed;
}

.input-container button:not(:disabled):hover {
  background-color: #7A5A47;
  box-shadow: 0 6px 16px rgba(122, 90, 71, 0.8);
}

.input-container .send-button {
  background-color: #8B6D5C;
  color: white;
  border-radius: 25px;
  font-weight: 600;
  padding: 10px 25px;
  box-shadow: 0 4px 12px rgba(139, 109, 92, 0.6);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.input-container .send-button:hover {
  background-color: #7A5A47;
  box-shadow: 0 6px 16px rgba(122, 90, 71, 0.8);
}

.plan-modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

/* 媒体查询，当设备宽度小于等于 768px 时应用以下样式 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px 10px;
  }
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 15px 10px;
  }

  .logo-section {
    flex-direction: row;
    align-items: center;
  }

  .logo-text {
    font-size: 22px;
    color: #F5F1E9;
  }

  .logo-section image {
    width: 50px;
    height: 50px;
  }

  .new-chat-button {
    margin-right: 30px;
    width: auto;
    margin-top: 5px;
    background-color: #8B6D5C;
    color: white;
    box-shadow: 0 4px 8px rgba(139, 109, 92, 0.4);
  }

  .new-chat-button:hover {
    background-color: #7A5A47;
    box-shadow: 0 6px 12px rgba(122, 90, 71, 0.6);
  }
}

/* 媒体查询，当设备宽度大于 768px 时应用原来的样式 */
@media (min-width: 769px) {
  .main-content {
    padding: 30px;
  }

  .app-layout {
    display: flex;
    height: 100vh;
  }

  .sidebar {
    width: 220px;
    background-color: #6B4C3B;
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 2px 0 8px rgba(107, 76, 59, 0.4);
  }

  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    margin-top: 15px;
    color: #F5F1E9;
    text-shadow: 0 1px 3px rgba(75, 59, 43, 0.7);
  }

  .new-chat-button {
    width: 100%;
    margin-top: 30px;
    background-color: #8B6D5C;
    color: white;
    font-weight: 600;
    border-radius: 25px;
    box-shadow: 0 4px 8px rgba(139, 109, 92, 0.4);
  }

  .new-chat-button:hover {
    background-color: #7A5A47;
    box-shadow: 0 6px 12px rgba(122, 90, 71, 0.6);
  }
}
</style>