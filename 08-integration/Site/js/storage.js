/**
 * 统一的 localStorage 封装
 * 所有页面（报名、外拍登记、作品管理）都通过它读写，
 * 好处：① 异常处理只写一次；② key 统一加前缀，避免与其它站点冲突；
 *       ③ 数据损坏（手动改坏 JSON）时不会让页面白屏，而是回退到默认值。
 */
const Store = (function () {
  const PREFIX = 'photoclub:';

  /**
   * 读取
   * @param {string} key
   * @param {*} fallback 读取失败或不存在时返回的默认值
   */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      // 期望是数组却读到了别的类型（被篡改），也视为损坏
      if (Array.isArray(fallback) && !Array.isArray(parsed)) throw new Error('数据结构不匹配');
      return parsed;
    } catch (e) {
      console.error(`[Store] 读取 ${key} 失败，已使用默认值：`, e);
      return fallback;
    }
  }

  /**
   * 保存
   * @returns {{ok: boolean, message: string}}
   */
  function save(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return { ok: true, message: '' };
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        return { ok: false, message: '存储空间已满，请先导出并清理数据！' };
      }
      return { ok: false, message: '数据保存失败：' + e.message };
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  /** 将任意数据导出为 JSON 文件下载 */
  function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** 生成唯一 id（时间戳 + 随机数，避免同一毫秒内重复） */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  return { load, save, remove, exportJSON, uid };
})();
