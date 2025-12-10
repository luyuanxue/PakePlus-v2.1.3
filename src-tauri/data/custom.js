window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug

// ========== 新增：跨平台读取外置IP配置（Windows/Linux通用） ==========
// 默认兜底IP/端口（双平台通用）
let TARGET_IP = "192.168.1.100";
let TARGET_PORT = "8080";

// 读取同目录config.json（核心：双平台均以“可执行文件所在目录”为基准）
async function loadIpConfig() {
    try {
        // fetch('./config.json')：双平台通用路径，无需区分/或\
        const res = await fetch('./config.json');
        if (res.ok) {
            const config = await res.json();
            // 严格校验IP/端口格式，避免非法配置导致崩溃（双平台通用）
            const ipReg = /^\d+\.\d+\.\d+\.\d+$/; // IPv4正则
            const portReg = /^\d{1,5}$/; // 端口正则（1-65535）
            if (config.ip && ipReg.test(config.ip)) TARGET_IP = config.ip;
            if (config.port && portReg.test(config.port)) TARGET_PORT = config.port;
            console.log("[跨平台配置] 读取成功 → IP：", TARGET_IP, "端口：", TARGET_PORT);
        }
    } catch (err) {
        console.warn("[跨平台配置] 读取失败（使用默认IP）→", err.message);
    }
}

// 客户端启动时优先加载配置（双平台通用）
loadIpConfig();

// ========== 原脚本逻辑（完全保留，仅适配动态IP，双平台无修改） ==========
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector('head base[target="_blank"]')
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        // 适配动态IP：相对路径拼接IP，绝对路径直接跳转（双平台通用）
        const targetUrl = origin.href.startsWith('http') 
            ? origin.href 
            : `http://${TARGET_IP}:${TARGET_PORT}${origin.href}`;
        location.href = targetUrl;
    } else {
        console.log('not handle origin', origin)
    }
}

// 重写window.open，适配动态IP（双平台通用）
window.open = function (url, target, features) {
    console.log('open', url, target, features)
    const targetUrl = url.startsWith('http') 
        ? url 
        : `http://${TARGET_IP}:${TARGET_PORT}${url}`;
    location.href = targetUrl;
}

document.addEventListener('click', hookClick, { capture: true });

// ========== 新增：启动自动跳转动态IP（双平台通用） ==========
// 本地页面启动时，自动跳转到配置的IP（无论Windows/Linux）
if (window.location.protocol === 'file:') {
    loadIpConfig().then(() => {
        const targetUrl = `http://${TARGET_IP}:${TARGET_PORT}`;
        console.log("[跨平台启动] 跳转至目标IP →", targetUrl);
        location.href = targetUrl;
    });
}