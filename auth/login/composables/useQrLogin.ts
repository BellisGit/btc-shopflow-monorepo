import { ref } from 'vue';
import loginQrImage from '/@/assets/images/login_qr.png';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

export function useQrLogin() {
  const { t } = useI18n();

  // QR码URL
  const qrUrl = ref('');

  // 生成QR码
  const generateQrCode = () => {
    // 使用实际的二维码图片，添加时间戳防止缓存
    const timestamp = Date.now();
    qrUrl.value = `${loginQrImage}?t=${timestamp}`;
  };

  // 刷新QR码
  const refreshQrCode = () => {
    generateQrCode();
    ElMessage.info(t('二维码已刷新'));
  };

  // 初始化
  generateQrCode();

  return {
    qrUrl,
    generateQrCode,
    refreshQrCode,
    t
  };
}
