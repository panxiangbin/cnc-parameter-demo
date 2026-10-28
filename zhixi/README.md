# 智铣 AI — PowerMill 实战接单平台 V0.5

公网体验地址：https://githubraw.com/panxiangbin/cnc-parameter-demo/main/zhixi/index.html

源文件：本目录的 `index.html`。该页面为单文件静态站，已内嵌所需的 CSS、JavaScript 和示例模型。无需单独服务器、数据库或会员登录；上传的照片/模型目前只在当前浏览器端处理，暂不保存到云端。

主要入口：客户只有实物、已有二维图纸、已有三维模型、已有刀路要修改。核心能力：登记实物来件，输出测量任务单，查看模型，生成精光候选轨迹/诊断参考等。

安全说明：网站产生的方案和候选轨迹不能直接作为机床可执行 NC 程序使用；必须在 PowerMill 实机计算、检查干涉及过切、核实后处理和机床工况，并经过人工审核。

维护方法：如需更新公网体验版，更新同目录 `index.html` 并提交到 main 分支，第三方 HTML 代理可能存在短暂缓存。

正式 Pages 域名启用：仓库 Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save，成功后可访问 https://panxiangbin.github.io/cnc-parameter-demo/zhixi/ 。注意：只有该 URL 实测返回正常页面后，才可宣布 Pages 站点上线；第三方预览服务不等于正式 GitHub Pages。
