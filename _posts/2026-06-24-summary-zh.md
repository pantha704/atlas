---
layout: default
title: "Horizon Summary: 2026-06-24 (ZH)"
description: "From 30 items, 17 important content pieces were selected"
date: 2026-06-24
lang: zh
---

> From 30 items, 17 important content pieces were selected

---

1. [循环即将到来：软件开发中依赖 AI/ML 的风险](#item-1) ⭐️ 9.0/10
2. [FFmpeg 严重漏洞曝光，播放或存储恶意视频可致系统被控](#item-2) ⭐️ 9.0/10
3. [对 Microsoft Word 中红绿波浪线的创造者 Charles Simonyi 的致敬](#item-3) ⭐️ 8.0/10
4. [Swift 包管理器索引加入苹果](#item-4) ⭐️ 8.0/10
5. [TikZ 编辑器：LaTeX 图形的 WYSIWYG 编辑器](#item-5) ⭐️ 8.0/10
6. [三星发布 UFS 5.0：面向端侧 AI，带宽高达 10.8 GB/s，计划四季度量产](#item-6) ⭐️ 8.0/10
7. [美国宇航局确认 SpaceX 猎鹰重型火箭将发射欧洲火星车](#item-7) ⭐️ 8.0/10
8. [FUTO Swipe 推出全新的滑动输入模型](#item-8) ⭐️ 7.0/10
9. [Google 因未经授权发布 Google Workspace CLI 而解雇员工](#item-9) ⭐️ 7.0/10
10. [datasette 1.0a35 发布：添加创建表格界面和修改表格操作](#item-10) ⭐️ 7.0/10
11. [数学家发现：普通人随机切牌时需约 14 次洗牌才够随机](#item-11) ⭐️ 7.0/10
12. [特朗普不再视 Anthropic 为国安威胁](#item-12) ⭐️ 7.0/10
13. [杰里地图：一个长达几十年的创作项目](#item-13) ⭐️ 6.0/10
14. [维生素 D 研究批判：揭露研究的局限性和炒作](#item-14) ⭐️ 6.0/10
15. [OPFS + Pyodide 测试 Harness 保存 SQLite 文件](#item-15) ⭐️ 6.0/10
16. [iOS 27 Beta 2 引入 Write with Siri 写作工具](#item-16) ⭐️ 6.0/10
17. [豆包专业版付费订阅灰度测试启动，最高年费 5088 元](#item-17) ⭐️ 5.0/10

---

<a id="item-1"></a>
## [循环即将到来：软件开发中依赖 AI/ML 的风险](https://lucumr.pocoo.org/2026/6/23/the-coming-loop/) ⭐️ 9.0/10

作者讨论了依赖 AI/ML 增强软件开发的潜在后果，可能导致人类理解力和维护技能的丧失。 这很重要，因为它突出了依赖 AI/ML 在软件开发中的潜在风险，这可能导致人类技能和理解力的丧失。 作者指出，依赖 AI/ML 可能导致人类理解力和维护技能的丧失，以及人类创造力和问题解决能力的潜在丧失。

hackernews · ingve · Jun 23, 11:06 · [社区讨论](https://news.ycombinator.com/item?id=48643180)

**背景**: 软件开发越来越依赖 AI/ML 增强开发过程，工具如 LLM 和模型驱动软件工程 (MDSE) 变得更加普遍。然而，这一转变引发了人们对人类技能和理解力的潜在丧失的担忧。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://arxiv.org/html/2409.18048v3">Augmenting software engineering with AI and developing it further towards AI-assisted model-driven software engineering</a></li>
<li><a href="https://www.sei.cmu.edu/ai-augmented-software-engineering/">AI-Augmented Software Engineering | CMU Software Engineering Institute</a></li>
<li><a href="https://www.splunk.com/en_us/blog/learn/ai-augmented-software-engineering.html">AI-Augmented Software Engineering | Splunk</a></li>
<li><a href="https://online.hbs.edu/blog/post/human-skills-ai-cant-replace">The Most Important Human Skills AI Can't Replace</a></li>
<li><a href="https://ai.plainenglish.io/the-ai-maintenance-crisis-why-your-automated-systems-need-more-humans-than-ever-18621032e355">The AI Maintenance Crisis: Why Your "Automated" Systems Need More ...</a></li>
<li><a href="https://www.justthink.ai/blog/ai-paradox-are-we-losing-our-human-skills">AI Paradox: Are We Losing Our Human Skills? - justthink.ai</a></li>

</ul>
</details>

**社区讨论**: 社区成员讨论了依赖 AI/ML 在软件开发中的潜在风险，有些人指出，这可能导致人类理解力和维护技能的丧失。

**标签**: `#AI`, `#ML`, `#Software Development`, `#Maintenance`, `#Human Understanding`

---

<a id="item-2"></a>
## [FFmpeg 严重漏洞曝光，播放或存储恶意视频可致系统被控](https://cybernews.com/security/critical-ffmpeg-vulnerability-enables-complete-compromise/) ⭐️ 9.0/10

FFmpeg 被曝高危漏洞 CVE-2026-8461（PixelSmash），攻击者通过构造恶意视频文件，可触发远程代码执行并完全控制系统。 此漏洞对系统安全有重大影响，攻击者可以通过播放或存储恶意视频，潜在导致系统完全被控。 漏洞位于 MagicYUV 解码器，CVSS 评分 8.8，影响桌面、服务器及 NAS、智能电视等 IoT 设备。

telegram · zaihuapd · Jun 23, 15:00

**背景**: FFmpeg 是一个广泛使用的开源多媒体框架，支持各种音频和视频格式。MagicYUV 是一个高性能视频编码器，是 FFmpeg 项目的一部分。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.magicyuv.com/">MagicYUV – Lossless video codec</a></li>
<li><a href="https://www.videohelp.com/software/MagicYUV">MagicYUV 2.4.2 / 1.2 Free Download Free - VideoHelp</a></li>

</ul>
</details>

**标签**: `#FFmpeg`, `#Vulnerability`, `#Security`, `#CVE-2026-8461`, `#MagicYUV`

---

<a id="item-3"></a>
## [对 Microsoft Word 中红绿波浪线的创造者 Charles Simonyi 的致敬](https://devblogs.microsoft.com/oldnewthing/20260622-00/?p=112451) ⭐️ 8.0/10

Charles Simonyi, Microsoft Word 中红绿波浪线的创造者,正在被人们记住和致敬。 这篇致敬文章凸显了一个人的决定对软件开发的影响以及人机交互的重要性。 红绿波浪线是 Charles Simonyi 做出的一个设计决定,对人们与 Microsoft Word 的交互方式产生了持久的影响。

hackernews · saikatsg · Jun 23, 18:10 · [社区讨论](https://news.ycombinator.com/item?id=48648959)

**背景**: Charles Simonyi 是一位知名的计算机科学家和工程师,曾在 Microsoft 工作,在 Microsoft Word 的开发中做出了重要贡献。红绿波浪线是他引入的功能,用来帮助用户识别语言和语法错误。人机交互是研究人们与计算机交互的领域,Microsoft Word 的界面设计是这个领域的一个关键方面。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Human-computer_interaction">Human-computer interaction</a></li>
<li><a href="https://en.wikipedia.org/wiki/Syntax_highlighting">Syntax highlighting</a></li>

</ul>
</details>

**社区讨论**: 社区讨论强调了红绿波浪线对用户体验的影响以及在多语言环境中考虑语言波浪线的局限性的重要性。

**标签**: `#software development`, `#Microsoft Word`, `#history of technology`, `#programming`, `#human-computer interaction`

---

<a id="item-4"></a>
## [Swift 包管理器索引加入苹果](https://swiftpackageindex.com/blog/swift-package-index-joins-apple) ⭐️ 8.0/10

Swift 包管理器索引已加入苹果，这可能会对 Swift 包管理和开源开发造成重大影响。 这次收购可能会影响 Swift 包管理和开源开发的方向，可能对开发者和整个生态系统产生影响。 Swift 包管理器索引是一家社区运营的包搜索引擎，具有强大的过滤功能，其被苹果收购可能会导致其功能和治理结构发生变化。

hackernews · JDevlieghere · Jun 23, 18:00 · [社区讨论](https://news.ycombinator.com/item?id=48648779)

**背景**: Swift 包管理器索引是一家社区运营的包搜索引擎，索引了 11,162 个包的元数据。它是 Swift 包的开源索引，支持 Swift 包管理器。Swift 包管理器是一种用于管理源代码分发的工具，旨在使代码共享和代码重用变得容易。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.swift.org/packages/">Packages | Swift.org</a></li>
<li><a href="https://github.com/SwiftPackageIndex">Swift Package Index · GitHub</a></li>

</ul>
</details>

**社区讨论**: 社区成员对收购持有不同看法，一些人乐观，而其他人则担心苹果在开源开发和开发者服务方面的记录。

**标签**: `#Swift`, `#Package Management`, `#Apple`, `#Open Source`, `#Developer Services`

---

<a id="item-5"></a>
## [TikZ 编辑器：LaTeX 图形的 WYSIWYG 编辑器](https://tikz.dev/editor/) ⭐️ 8.0/10

TikZ 编辑器允许用户在同步源代码的同时，使用 WYSIWYG 方式创建和编辑 LaTeX 图形。 这对频繁创建复杂图形的学者和研究人员来说很重要，因为它提供了一种更容易和高效的创建和编辑图形的方式。 编辑器通过解析 TikZ 代码和跟踪每个对象的源位置来实现视觉和源代码视图之间的实时同步。

hackernews · DominikPeters · Jun 23, 14:24 · [社区讨论](https://news.ycombinator.com/item?id=48645437)

**背景**: TikZ 是一种广泛使用的 LaTeX 包，用于在论文中绘制图形，但创建和编辑它们可能很繁琐和耗时。TikZ 的 WYSIWYG 编辑器将为创建和编辑图形提供一种更高效的方式。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/PGF/TikZ">PGF/TikZ - Wikipedia</a></li>
<li><a href="https://tikz.dev/">PGF/TikZ Manual - Complete Online Documentation</a></li>
<li><a href="https://ctan.org/pkg/pgf">CTAN: Package pgf</a></li>

</ul>
</details>

**社区讨论**: 用户称赞了编辑器的 UI 和创建复杂图形的潜力，但一些用户注意到生成的 TikZ 代码可能不是最佳选择。

**标签**: `#LaTeX`, `#TikZ`, `#WYSIWYG Editor`, `#Open-Source`, `#Graphics`

---

<a id="item-6"></a>
## [三星发布 UFS 5.0：面向端侧 AI，带宽高达 10.8 GB/s，计划四季度量产](https://news.samsung.com/global/samsung-unveils-industrys-fastest-ufs-5-0-solution-for-next-gen-on-device-ai-applications) ⭐️ 8.0/10

三星电子宣布已开发面向下一代端侧 AI 应用的 UFS 5.0 闪存存储解决方案，称其为目前业界速度最快的 UFS 产品。 该方案计划于今年第四季度量产，容量最高达 1 TB，应用范围涵盖旗舰手机、XR 头显和 AI 可穿戴设备。 该方案基于 JEDEC 最新嵌入式存储接口标准，顺序读取速度最高 10.8 GB/s，顺序写入速度最高 9.5 GB/s，较 UFS 4.1 标准提升超过一倍；功耗效率较三星 UFS 4.1 方案提升超过 40%，封装尺寸缩小 16.7%。

telegram · zaihuapd · Jun 23, 09:17

**背景**: UFS (通用闪存存储) 是一种广泛用于移动设备和其他应用的存储解决方案。JEDEC (联合电子设备工程委员会) 是一个全球性的组织，开发微电子行业的标准。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://news.samsung.com/global/samsung-unveils-industrys-fastest-ufs-5-0-solution-for-next-gen-on-device-ai-applications">Samsung Unveils Industry’s Fastest UFS 5.0 Solution for Next-Gen On-Device AI Applications</a></li>
<li><a href="https://semiconductor.samsung.com/estorage/ufs/ufs-5-0/">UFS 5.0 | Universal Flash Storage | Samsung Semiconductor Global</a></li>
<li><a href="https://www.jedec.org/standards-documents">Standards & Documents Search | JEDEC</a></li>

</ul>
</details>

**标签**: `#Samsung`, `#UFS 5.0`, `#AI`, `#Storage Solutions`

---

<a id="item-7"></a>
## [美国宇航局确认 SpaceX 猎鹰重型火箭将发射欧洲火星车](https://t.me/zaihuapd/42133) ⭐️ 8.0/10

美国宇航局确认，SpaceX 的猎鹰重型火箭将于 2028 年发射欧洲火星车罗莎琳德·富兰克林号，任务旨在寻找火星地表下可能存在的生命迹象。 这次美国宇航局和 SpaceX 的合作标志着太空探索领域的一项重大进展，可能推进我们对火星及其适宜性了解的进步。 罗莎琳德·富兰克林火星车将配备摄像机和其他仪器，研究火星表面和地下的情况。任务将于 2028 年从肯尼迪航天中心发射。

telegram · zaihuapd · Jun 23, 10:47

**背景**: 欧洲航天局的 ExoMars 计划旨在寻找火星上的生命迹象。罗莎琳德·富兰克林火星车是该计划的一部分，该计划包括一系列任务，以研究火星表面和地下的情况。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.reddit.com/r/Damnthatsinteresting/comments/1udrfh0/telescope_footage_of_falcon_heavy_upper_stage/">Telescope footage of Falcon Heavy upper stage depressurizing - Reddit</a></li>
<li><a href="https://en.wikipedia.org/wiki/Rosalind_Franklin_(rover)">Rosalind Franklin (rover) - Wikipedia</a></li>
<li><a href="https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/ExoMars/ExoMars_rover">ESA - ExoMars rover</a></li>

</ul>
</details>

**标签**: `#SpaceX`, `#NASA`, `#Mars Rover`, `#Space Exploration`

---

<a id="item-8"></a>
## [FUTO Swipe 推出全新的滑动输入模型](https://swipe.futo.tech/) ⭐️ 7.0/10

FUTO Swipe 是一款全新的滑动输入模型，旨在减少词语重叠并提高输入速度。它与 FUTO 键盘紧密结合，旨在提供传统滑动输入方法的更好替代品。 这项创新有潜力提高输入效率和用户体验，尤其是那些依赖滑动输入的人。它也凸显了自然语言处理和键盘输入技术的持续发展。 该模型旨在通过学习用户输入数据并适应个人输入习惯来减少词语重叠。它还包含了一个涵盖了大量词语的词典，包括一些带有强烈语言的词语。

hackernews · futohq · Jun 23, 17:50 · [社区讨论](https://news.ycombinator.com/item?id=48648619)

**背景**: 滑动输入是移动设备上的流行输入方法，但它经常会遇到词语重叠和准确性的问题。研究人员一直在探索各种方法来改善滑动输入，包括自然语言处理和机器学习算法。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://jcomputers.us/vol13/jcp1312-03.pdf">Optimizing Overlap Reductions of Feature Regions for</a></li>
<li><a href="https://arxiv.org/pdf/1709.06429">Neural Networks for Text Correction and Completion in ...</a></li>

</ul>
</details>

**社区讨论**: 用户对新滑动输入模型的反馈普遍为正面，称其提高了输入速度和准确性。然而，一些用户报告了大小写问题和上下文感知建议的问题。

**标签**: `#swipe-typing`, `#keyboard-layout`, `#natural-language-processing`, `#input-methods`, `#mobile-keyboards`

---

<a id="item-9"></a>
## [Google 因未经授权发布 Google Workspace CLI 而解雇员工](https://twitter.com/JPoehnelt/status/2069482265953087602) ⭐️ 7.0/10

Google 因未经授权发布 Google Workspace CLI 而解雇员工 这次事件凸显了遵循公司程序和获得必要批准之前发布公司相关项目的重要性 Google Workspace CLI 是一个命令行工具，提供了一个统一的接口来与 Google Workspace 服务进行交互

hackernews · justinwp · Jun 23, 18:13 · [社区讨论](https://news.ycombinator.com/item?id=48649011)

**背景**: Google Workspace CLI 是一个工具，允许用户与 Google Workspace 服务（如 Gmail、Drive、Calendar、Docs、Sheets 等）进行交互。未知的是，员工为什么未经官方批准就发布了 CLI

<details><summary>参考链接</summary>
<ul>
<li><a href="https://grokipedia.com/page/Google_Workspace_CLI">Google Workspace CLI</a></li>
<li><a href="https://clime.sh/cli/gws">Google Workspace CLI Commands | clime</a></li>
<li><a href="https://www.linkedin.com/posts/jean-pierre-palomba-marin-14508b162_github-googleworkspacecli-google-workspace-activity-7435590438192877568-8S1q">GitHub - googleworkspace/ cli : Google Workspace CLI — one...</a></li>

</ul>
</details>

**社区讨论**: 社区成员表达了混合的意见，有些同情被解雇的员工，有些则批评他们的行为

**标签**: `#Google`, `#Software Engineering`, `#Bureaucracy`, `#Open Source`, `#Employment`

---

<a id="item-10"></a>
## [datasette 1.0a35 发布：添加创建表格界面和修改表格操作](https://simonwillison.net/2026/Jun/23/datasette/#atom-everything) ⭐️ 7.0/10

datasette 1.0a35 中引入了创建表格界面和修改表格操作 该发布意义重大，因为它为 datasette 添加了基本的数据库管理功能，使其更适合用户使用 创建表格界面允许用户定义列、主键和外键，而修改表格操作使用户可以修改现有表格

rss · Simon Willison · Jun 23, 21:34

**背景**: datasette 是一个免费、开源且可扩展的工具，用于探索和发布数据。它支持各种数据源，包括 SQLite 数据库，并提供 JSON API 进行与数据的交互

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/JSONP">JSONP</a></li>
<li><a href="https://jsonapi.org/">JSON:API — A specification for building APIs in JSON</a></li>
<li><a href="https://docs.oracle.com/database/apex-5.1/AEEUG/about-the-actions-menu.htm">3.7.1 About the Actions Menu</a></li>

</ul>
</details>

**社区讨论**: 目前没有对此帖子的评论

**标签**: `#datasette`, `#database`, `#json-api`

---

<a id="item-11"></a>
## [数学家发现：普通人随机切牌时需约 14 次洗牌才够随机](https://www.quantamagazine.org/seven-perfect-shuffles-randomize-a-deck-of-cards-but-how-many-sloppy-ones-20260617/) ⭐️ 7.0/10

一项最新研究发现，一副牌大约需要 14 次洗牌才能充分随机化，尤其是当牌被普通人随手切牌时。 这项发现对我们理解随机性和牌洗牌的概念有重要影响，也可能对游戏设计师和牌迷有所帮助。 该研究使用二进制'条形码'系统跟踪单张牌的移动，并发现一副牌在 14 次洗牌后才能充分随机化。

telegram · zaihuapd · Jun 23, 16:04

**背景**: 该研究基于 1992 年的结论，即 7 次标准鸽尾式洗牌足以打乱一副牌，但该结果假设每次切牌都近乎精准对半分。最新研究将条件放宽到更现实的场景：如果普通人随手切牌、切牌位置随机，一副 52 张牌大约需要 14 次洗牌才能充分随机化。

<details><summary>参考链接</summary>
<ul>
<li><a href="http://apemaker.com/NewsDetail/846834.html">条 形 码 中的数学奥秘—— 二 进 制</a></li>
<li><a href="https://www.lunlunapp.com/newsDetails/da55d1f2e818eb61f6e30453153d557f">这所院校又添新作：随机量子电路的截止现象和熵不确定性-论论</a></li>

</ul>
</details>

**标签**: `#mathematics`, `#probability`, `#randomness`, `#card shuffling`, `#research`

---

<a id="item-12"></a>
## [特朗普不再视 Anthropic 为国安威胁](https://t.me/zaihuapd/42148) ⭐️ 7.0/10

特朗普表示不再将人工智能公司 Anthropic 视为国家安全威胁，可能放松对其 AI 模型的限制。 这一态度转变对 Anthropic 的 AI 模型，特别是 Fable 5 和 Mythos 5，具有重大影响，它们用于高级推理和网络安全工作。 Fable 5 和 Mythos 5 是 Anthropic 开发的 AI 模型，Fable 5 是一个受限版本，Mythos 5 用于网络安全工作。

telegram · zaihuapd · Jun 24, 03:45

**背景**: Anthropic 是一个公共利益公司，致力于确保 AI 的利益并减少风险。该公司的 AI 模型，包括 Fable 5 和 Mythos 5，用于各种任务，如高级推理、视觉分析和代码生成。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.anthropic.com/">Home \ Anthropic</a></li>
<li><a href="https://builtin.com/articles/anthropic">What Is Anthropic ? | Built In</a></li>
<li><a href="https://www.coursera.org/articles/anthropic-vs-openai">Anthropic vs. OpenAI: What's the Difference? | Coursera</a></li>

</ul>
</details>

**标签**: `#AI`, `#National Security`, `#Anthropic`, `#Trump`, `#Fable 5`, `#Mythos 5`

---

<a id="item-13"></a>
## [杰里地图：一个长达几十年的创作项目](http://www.jerrysmap.com/the-map) ⭐️ 6.0/10

杰里地图是一个长达几十年的项目，艺术家通过从特殊牌堆中抽取指令来绘制一个想象的土地地图。 这个项目展示了艺术和技术的交叉点，突出了生成艺术的潜力及其与人工智能/机器学习的关系。 整个过程由艺术家创造的特殊牌堆中的指令牌来驱动。

hackernews · turtleyacht · Jun 23, 18:40 · [社区讨论](https://news.ycombinator.com/item?id=48649435)

**背景**: 杰里地图是一种生成艺术，它使用算法或其他自动化系统来创作艺术。这一项目可以被视为一种地理信息系统（GIS），艺术家创造了一个想象的土地地图。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Geographic_Information_Systems_(GIS)">Geographic Information Systems (GIS)</a></li>
<li><a href="https://en.wikipedia.org/wiki/Generative_art">Generative art</a></li>
<li><a href="https://openart.ai/">AI Art Generator: Free AI Image, Video & Audio Generator</a></li>

</ul>
</details>

**社区讨论**: 社区成员分享了与之相关的项目和视频链接，强调了生成艺术的潜力及其与人工智能/机器学习的关系。

**标签**: `#creative-process`, `#artificial-intelligence`, `#machine-learning`, `#geographic-information-systems`, `#generative-art`

---

<a id="item-14"></a>
## [维生素 D 研究批判：揭露研究的局限性和炒作](https://dynomight.net/vitamin-d/) ⭐️ 6.0/10

一篇 refreshingly 的分析文章指出维生素 D 研究存在严重的局限性，并且炒作了维生素 D 的益处。 这篇批判性文章很重要，因为它揭露了维生素 D 研究的缺陷，这可能导致人们做出错误的健康决策并浪费资源。 这篇文章批判了维生素 D 研究中使用的调查方法，强调了数据收集和分析的问题。

hackernews · surprisetalk · Jun 23, 16:30 · [社区讨论](https://news.ycombinator.com/item?id=48647486)

**背景**: 维生素 D 研究近年来一直是人们关注的热点，很多研究声称其对健康有益。但是，批评者认为这些研究经常存在缺陷，并且基于不完整的数据。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://brainly.com/question/59290447">[FREE] Select all the correct answers. When doing medical research ...</a></li>
<li><a href="https://brainly.com/question/48499684">[FREE] What constraints exist in the field of medical research , and...</a></li>
<li><a href="https://www.semanticscholar.org/paper/Research-Limitations-and-the-Necessity-of-Reporting-Price-Murnan/6be5d92ad5f151ccbeb366c5e0f9ade3aa0c3f70">Research Limitations and the Necessity of... | Semantic Scholar</a></li>

</ul>
</details>

**社区讨论**: 社区讨论热烈，用户分享了他们对维生素 D 的个人经历，并讨论了研究的局限性。

**标签**: `#Vitamin D`, `#Nutrition`, `#Health`, `#Science`, `#Medical Research`

---

<a id="item-15"></a>
## [OPFS + Pyodide 测试 Harness 保存 SQLite 文件](https://simonwillison.net/2026/Jun/23/opfs-pyodide/#atom-everything) ⭐️ 6.0/10

Simon Willison 分享了 OPFS + Pyodide 测试 Harness，用于在浏览器中编辑持久的 SQLite 文件。 这个测试 Harness 展示了在浏览器中编辑持久 SQLite 文件的新颖方法，这可能对需要数据库访问的 Web 应用程序有重大影响。 测试 Harness 使用 OPFS 和 Pyodide 为编辑 SQLite 文件提供一个沙盒式文件系统，可以在页面重新加载时持久化。

rss · Simon Willison · Jun 23, 18:58

**背景**: OPFS 是一个本机浏览器存储 API，提供一个私有的、沙盒式的文件系统用于 Web 应用程序，而 Pyodide 是一个使用 WebAssembly 在浏览器中运行的 Python 实现。 Datasette Lite 是一个使用 WebAssembly 在浏览器中运行的 Datasette 版本。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system">Origin private file system - Web APIs | MDN</a></li>
<li><a href="https://web.dev/articles/origin-private-file-system">The origin private file system | Articles | web.dev</a></li>
<li><a href="https://rxdb.info/rx-storage-opfs.html">Supercharged OPFS Database with RxDB | RxDB - JavaScript Database</a></li>
<li><a href="https://github.com/simonw/til/blob/main/python/sqlite-in-pyodide.md">til/python/sqlite-in-pyodide.md at main · simonw/til · GitHub</a></li>
<li><a href="https://pyodide.org/en/stable/usage/file-system.html">Dealing with the file system — Version 314.0.0 - Pyodide</a></li>
<li><a href="https://til.simonwillison.net/python/sqlite-in-pyodide">Using the sqlite3 Python module in Pyodide - Simon Willison</a></li>

</ul>
</details>

**社区讨论**: 没有社区讨论。

**标签**: `#pyodide`, `#datasette-lite`, `#browsers`, `#sqlite`

---

<a id="item-16"></a>
## [iOS 27 Beta 2 引入 Write with Siri 写作工具](https://9to5mac.com/2026/06/22/ios-27-beta-write-with-siri/) ⭐️ 6.0/10

iOS 27 Beta 2 引入了 Write with Siri，一个新写作工具，取代了旧版 Apple Intelligence Writing Tools。 这个更新将 Siri 直接引入键盘，方便在 Notes 和其他支持的文本字段中进行输入，提高写作体验。 Write with Siri 允许用户使用自然语言请求来生成新文本、校对、重写等功能。

telegram · zaihuapd · Jun 23, 10:02

**背景**: Apple Intelligence Writing Tools 在 iOS 18 中首次引入，提供了校对、重写和摘要文本的功能。这个更新取代了旧版 Writing Tools 面板，采用 Write with Siri。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://9to5mac.com/2026/06/22/ios-27-beta-write-with-siri/">iOS 27 beta 2 includes Write with Siri, the new version of Apple Intelligence writing tools - 9to5Mac</a></li>
<li><a href="https://support.apple.com/en-us/121582">How to use Writing Tools with Apple Intelligence</a></li>
<li><a href="https://www.igeeksblog.com/how-to-use-writing-tools-on-iphone-ipad/">How to Use Apple Intelligence Writing Tools on iPhone or iPad Top Stories iOS 27 beta 2 includes Write with Siri, the new version of ... How to use Apple Intelligence Writing Tools - Cult of Mac How to Use Apple Intelligence's Writing Tools to Spot Typos ... Writing Tools is one of Apple Intelligence's most useful ...</a></li>

</ul>
</details>

**社区讨论**: Telegram 社区讨论有限，部分用户对新功能表示兴趣，但缺乏深入分析或技术细节。

**标签**: `#iOS`, `#Apple`, `#Siri`, `#WritingTools`, `#MobileOS`

---

<a id="item-17"></a>
## [豆包专业版付费订阅灰度测试启动，最高年费 5088 元](https://t.me/zaihuapd/42145) ⭐️ 5.0/10

豆包专业版付费订阅灰度测试启动，最高年费 5088 元，预计 6 月下旬全面上线。 这是一个重要的消息，因为它允许专业用户和企业访问高级功能和能力，可能会提高生产力和效率。 付费订阅服务分为标准版、加强版和高级专业版三档，价格从 68 到 5088 元不等。

telegram · zaihuapd · Jun 24, 01:45

**背景**: 豆包是字节跳动开发的 AI 应用，其专业版面向专业用户和企业。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://zh.wikipedia.org/zh-hans/灰度測試">灰度测试- 维基百科，自由的百科全书</a></li>
<li><a href="https://developer.aliyun.com/article/710854">灰度测试是什么及其实现方法与核心价值-开发者社区-阿里云</a></li>

</ul>
</details>

**标签**: `#Doubao`, `#paid-subscription`, `#software-development`, `#artificial-intelligence`, `#machine-learning`

---