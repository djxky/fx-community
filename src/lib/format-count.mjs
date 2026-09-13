// 大数字展示：不足 1 万显示完整数字（带千分位），满 1 万显示「x.x万」，满 1 亿显示「x.x亿」。
// 与 FeedCard 的 formatCount 保持同一取整规则（保留一位小数，去掉末尾 .0）。
// 接受数字或 '46,200' 这类字符串；无法解析的值（如已格式化的 '2.4万'）原样返回。
export function formatCount(value) {
  const raw = String(value ?? '').trim()
  const num = Number(raw.replace(/,/g, ''))
  if (raw === '' || !Number.isFinite(num)) return raw

  const compact = (n, unit) => `${n.toFixed(1).replace(/\.0$/, '')}${unit}`
  if (Math.abs(num) >= 1e8) return compact(num / 1e8, '亿')
  if (Math.abs(num) >= 1e4) return compact(num / 1e4, '万')
  return num.toLocaleString('en-US')
}
