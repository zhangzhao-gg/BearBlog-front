// 这里的vm，就是我们在vue文件里面的this，所以我们能在这里获取vuex的变量，比如存放在里面的token
// 同时，我们也可以在此使用getApp().globalData，如果你把token放在getApp().globalData的话，也是可以使用的


// 为前端项目配置HTTP请求和响应拦截器,在请求发出之前添加必要的请求头,如Token,还能在相应返回之后对响应数据进行统一处理

// const install = (Vue, vm) => {} 定义了一个名为 install 的函数，该函数接收 Vue 构造函数和 vm（通常是 Vue 实例的 this）作为参数，在函数内部完成了 HTTP 请求和响应拦截器的配置工作。最后通过 export default { install } 将 install 函数导出，以便在其他文件中引入并使用。
const install = (Vue, vm) => {
	Vue.prototype.$u.http.setConfig({
		
		baseUrl: vm.baseUrl,
		// 如果将此值设置为true，拦截回调中将会返回服务端返回的所有数据response，而不是response.data
		// 设置为true后，就需要在this.$u.http.interceptor.response进行多一次的判断，请打印查看具体值
		originalData: true, 
		// 设置自定义头部content-type
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		}
	});
	// 请求拦截，配置Token等参数
	Vue.prototype.$u.http.interceptor.request = (config) => {
		var tokenName = uni.getStorageSync('tokenName');
		var tokenValue = uni.getStorageSync('tokenValue');
		// console.log("拦截后添加的tokenName:"+tokenName);
		// console.log("拦截后添加的tokenValue:"+tokenValue);
		if (tokenName) {
			config.header[tokenName] = tokenValue;
		}

		// 方式一，存放在vuex的token，假设使用了uView封装的vuex方式，见：https://uviewui.com/components/globalVariable.html
		// config.header.token = vm.token;

		// 方式二，如果没有使用uView封装的vuex方法，那么需要使用$store.state获取
		// config.header.token = vm.$store.state.token;

		// 方式三，如果token放在了globalData，通过getApp().globalData获取
		// config.header.token = getApp().globalData.username;

		// 方式四，如果token放在了Storage本地存储中，拦截是每次请求都执行的，所以哪怕您重新登录修改了Storage，下一次的请求将会是最新值
		// const token = uni.getStorageSync('token');
		// config.header.token = token;

		return config;
	}


	// 响应拦截，判断状态码是否通过
	Vue.prototype.$u.http.interceptor.response = (res) => {
		// 如果把originalData设置为了true，这里得到将会是服务器返回的所有的原始数据
		// 判断可能变成了res.statueCode，或者res.data.code之类的，请打印查看结果
		
		console.log('HTTP响应拦截器收到的数据:', res);
		
		// 处理网络错误或无效响应
		if (!res) {
			console.error('响应对象为空');
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
			return Promise.reject(new Error('Response is null'));
		}
		
		// 处理网络连接错误（如ERR_CONNECTION_REFUSED）
		if (res.errMsg && res.errMsg.includes('fail')) {
			console.error('网络连接失败:', res.errMsg);
			uni.showToast({
				title: '无法连接到服务器，请检查网络',
				icon: 'none'
			});
			return Promise.reject(new Error('Network Connection Failed'));
		}
		
		// 检查是否有data属性
		if (!res.data) {
			console.error('响应数据为空:', res);
			uni.showToast({
				title: '服务器响应异常',
				icon: 'none'
			});
			return Promise.reject(new Error('Response data is null'));
		}
		
		// 检查响应数据结构
		if (typeof res.data !== 'object') {
			console.error('响应数据格式错误:', res.data);
			uni.showToast({
				title: '服务器响应格式错误',
				icon: 'none'
			});
			return Promise.reject(new Error('Invalid response format'));
		}
		
		// 正常业务逻辑处理
		if (res.data.code == 200) {
			// 如果把originalData设置为了true，这里return回什么，this.$u.post的then回调中就会得到什么
			return res.data;
		} else {
			const errorMsg = res.data.msg || res.data.message || '请求失败';
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			});
			
			// 处理token过期
			if (res.data.code == 999) {
				uni.removeStorageSync('tokenName');
				uni.removeStorageSync('tokenValue');
				setTimeout(() => {
					uni.reLaunch({
						url: "/pages/login/login"
					});
				}, 2000);
			}
			
			return Promise.reject(res.data);
		}
	}
}

//使用 ES6 模块语法将 install 函数作为默认导出项,
//这样其他文件就可以通过 import 语句来引入并使用这个 install 函数。

export default {
	install
}
