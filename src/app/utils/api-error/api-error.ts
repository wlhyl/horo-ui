/**
 * API 错误处理工具
 * 提供统一的错误消息提取逻辑，可复用于所有组件
 */

/**
 * 从 HTTP 错误响应中提取用户友好的错误消息
 *
 * @param error - HttpErrorResponse 或类似的错误对象
 * @returns 用户友好的错误消息字符串
 *
 * 错误场景处理：
 * 1. 网络不可达 (error.status === 0)
 * 2. error.error 是 JSON 对象 { error: "xxx" }
 * 3. error.error 是字符串
 * 4. error.error 是 undefined
 */
export function getApiErrorMessage(error: any): string {
  if (error.status === 0 || error.status === null) {
    return '网络连接失败，请检查网络或服务器状态';
  }

  const errorBody = error.error;

  if (!errorBody) {
    if (error.message && typeof error.message === 'string') {
      if (error.message.includes('HttpErrorResponse')) {
        return '请求失败，请稍后重试';
      }
      return error.message;
    }
    return `请求失败 (HTTP ${error.status})`;
  }

  if (typeof errorBody === 'string') {
    return errorBody || '请求失败';
  }

  if (errorBody.error && typeof errorBody.error === 'string') {
    return errorBody.error;
  }

  // errorBody 存在但不是 {error: "xxx"} 格式，返回其内容
  return String(errorBody);
}