/** 转化页展示用：部署时在环境变量中配置真实微信号与二维码图路径 */

export const WECHAT_DISPLAY_NAME = "志愿规划顾问";

export const WECHAT_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WECHAT_ID
    ? process.env.NEXT_PUBLIC_WECHAT_ID
    : "请配置 NEXT_PUBLIC_WECHAT_ID";

/** 将二维码图片放在 public/ 下，例如 /wechat-qr.png，再通过环境变量指向 */
export const WECHAT_QR_IMAGE_SRC =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WECHAT_QR
    ? process.env.NEXT_PUBLIC_WECHAT_QR
    : "";
