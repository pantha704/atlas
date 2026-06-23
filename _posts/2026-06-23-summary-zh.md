---
layout: default
title: "Horizon Summary: 2026-06-23 (ZH)"
description: "From 21 items, 17 important content pieces were selected"
date: 2026-06-23
lang: zh
---

> From 21 items, 17 important content pieces were selected

---

1. [GLM-5.2 本地运行：利弊](#item-1) ⭐️ 8.0/10
2. [Moebius: 0.2B 图像填充模型，性能与 10B 级模型相当](#item-2) ⭐️ 8.0/10
3. [Show HN: Oak - 一个为代理人设计的 Git 替代品](#item-3) ⭐️ 8.0/10
4. [警长使用 Flock 技术跟踪女性引发关注](#item-4) ⭐️ 8.0/10
5. [研究人员提出使用提示注入作为角色混淆的新方法](#item-5) ⭐️ 8.0/10
6. [研究人员发现 AI 模型易受提示注入攻击](#item-6) ⭐️ 8.0/10
7. [黄仁勋：轻视华为、轻视中国制造的人极其天真，英伟达将全力向华为学习](#item-7) ⭐️ 8.0/10
8. [OpenAI 启动修补地球计划 用 AI 帮开源软件找漏洞](#item-8) ⭐️ 8.0/10
9. [Steam Machine 今天正式上市，采用预约系统和用户定制](#item-9) ⭐️ 7.0/10
10. [用户创建了一个无广告的逻辑谜题网站](#item-10) ⭐️ 7.0/10
11. [《置身团内》前美团到餐产品发文](#item-11) ⭐️ 7.0/10
12. [48 位中国开发者举报苹果涉嫌垄断，称费率承诺未兑现](#item-12) ⭐️ 7.0/10
13. [LG 智能电视应用被检出住宅代理 SDK](#item-13) ⭐️ 7.0/10
14. [阿里巴巴发布视频生成模型 HappyHorse 1.1](#item-14) ⭐️ 6.0/10
15. [加拿大计划在 2040 年前建造 10 个核反应堆](#item-15) ⭐️ 5.0/10
16. [微软认错：将重新允许用户调整 Windows 11 任务栏位置](#item-16) ⭐️ 5.0/10
17. [OpenAI 推 AI 动画电影《Critterz》](#item-17) ⭐️ 5.0/10

---

<a id="item-1"></a>
## [GLM-5.2 本地运行：利弊](https://unsloth.ai/docs/models/glm-5.2) ⭐️ 8.0/10

这篇文章解释了如何在本地运行 GLM-5.2 模型，强调了其潜在的利弊。 在本地运行大型语言模型可以避免 API 限制和加密，但也引发了可用性和性能的担忧。 GLM-5.2 模型需要 24GB 的 VRAM 和 256GB 的 RAM 进行 MoE 分发，用户使用不同的硬件配置报告了不同的成功水平。

hackernews · TechTechTech · Jun 22, 21:21 · [社区讨论](https://news.ycombinator.com/item?id=48636377)

**背景**: 像 GLM-5.2 这样的大型语言模型通常在云基础设施上训练，需要大量的计算资源。量化是一种技术，用于减小这些模型的大小，使它们更适合本地计算。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Quantization_(image_processing)">Quantization (image processing)</a></li>
<li><a href="https://www.cloudflare.com/learning/ai/what-is-quantization/">What is quantization in machine learning?</a></li>
<li><a href="https://github.com/di37/running-llms-locally">Running Local LLMs - GitHub</a></li>

</ul>
</details>

**社区讨论**: 用户在本地运行 GLM-5.2 的成功程度各不相同，一些用户使用高端硬件可以达到 11tk/sec 的速度。

**标签**: `#large-language-models`, `#quantization`, `#local-computation`, `#AI-research`

---

<a id="item-2"></a>
## [Moebius: 0.2B 图像填充模型，性能与 10B 级模型相当](https://hustvl.github.io/Moebius/) ⭐️ 8.0/10

研究人员推出了 Moebius，一个 0.2B 图像填充模型，其性能与 10B 级模型相当。 这项成就意义重大，因为它表明了较小模型可以匹配较大模型性能的潜力，这可能导致图像填充技术的更高效和实用性部署。 Moebius 使用高度优化的任务特定专家架构和知识蒸馏来实现其性能，并已在各种图像填充任务上进行了演示。

hackernews · DSemba · Jun 22, 13:53 · [社区讨论](https://news.ycombinator.com/item?id=48630171)

**背景**: 图像填充是一种用于填充图像中缺失或受损区域的技术，广泛应用于计算机视觉、图形学和摄影等领域。传统的图像填充方法通常需要大量的计算资源，并且速度慢且效率低。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://arxiv.org/abs/2606.19195">[2606.19195] Moebius: 0.2B Lightweight Image Inpainting ...</a></li>
<li><a href="https://hustvl.github.io/Moebius/">Moebius: 0.2B Lightweight Image Inpainting Framework with 10B-Level ...</a></li>
<li><a href="https://huggingface.co/papers/2606.19195">Paper page - Moebius: 0.2B Lightweight Image Inpainting ...</a></li>

</ul>
</details>

**社区讨论**: 围绕 Moebius 的社区讨论热烈，有些用户对其性能表示怀疑，而其他人则分享了他们自己的体验和结果。

**标签**: `#Deep Learning`, `#Computer Vision`, `#AI Models`, `#Image Inpainting`, `#Hugging Face`

---

<a id="item-3"></a>
## [Show HN: Oak - 一个为代理人设计的 Git 替代品](https://oak.space/oak/oak) ⭐️ 8.0/10

Oak 是一个为代理人设计的版本控制系统，旨在改善严肃项目的速度和上下文。它使用虚拟挂载来允许代理人在不需要整个仓库副本的情况下并行工作多个任务。 Oak 为代理人的设计可能会改善生产力并减少严肃项目的版本控制复杂性。它还突出了传统版本控制系统如 Git 的局限性。 Oak 使用虚拟挂载来减少代理人和仓库之间需要传输的数据量。它还缺乏 Git 中可用的 CI、问题和评论等功能。

hackernews · zdgeier · Jun 22, 15:37 · [社区讨论](https://news.ycombinator.com/item?id=48631726)

**背景**: 版本控制系统如 Git 在软件开发中广泛使用，以管理代码的变化和与他人协作。然而，对于大型项目，它们可能会很复杂和慢。Oak 目的在于通过为代理人提供更高效和流畅的版本控制体验来解决这些问题。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://docs.docker.com/engine/storage/bind-mounts/">Bind mounts | Docker Docs</a></li>
<li><a href="https://docs.rubrik.com/en-us/9.1/ug/cdm/creating_live_mount_of_vm.html">Creating a Live Mount of a virtual machine or VM template</a></li>
<li><a href="https://patents.google.com/patent/US20100114825">US20100114825A1 - Version control environment for virtual machines - Google Patents</a></li>

</ul>
</details>

**社区讨论**: 社区讨论突出了 Oak 的潜在优势和局限性，某些用户对其改善生产力的能力表示怀疑，而其他人则赞扬了它对版本控制的创新方法。

**标签**: `#Version Control`, `#Git Alternative`, `#Agents`, `#Software Development`

---

<a id="item-4"></a>
## [警长使用 Flock 技术跟踪女性引发关注](https://ipvm.com/reports/police-chiefs-track) ⭐️ 8.0/10

一份报告揭露了一些警长使用 Flock 技术跟踪女性，这引发了对权力滥用和个人隐私的关注。 这引发了对监视技术滥用的潜在风险和保护个人隐私的需要的关注 Flock 技术使用自动车牌识别和视频监控跟踪个人，这可以用于合法和非法目的

hackernews · jhonovich · Jun 22, 19:13 · [社区讨论](https://news.ycombinator.com/item?id=48634694)

**背景**: Flock Safety 是一家提供安全硬件和软件的公司，包括自动车牌识别和视频监控系统。该公司的技术已被警方使用来跟踪个人，这引发了对滥用的潜在风险的关注。警方使用监视技术的趋势正在增长，许多专家认为这会侵犯个人隐私权

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Flock_Safety">Flock Safety - Wikipedia</a></li>
<li><a href="https://www.aclu.org/news/privacy-technology/flock-roundup">Flock’s Aggressive Expansions Go Far Beyond Simple Driver Surveillance | American Civil Liberties Union</a></li>
<li><a href="https://www.flocksafety.com/">Flock Safety</a></li>

</ul>
</details>

**社区讨论**: 社区成员对监视技术滥用的潜在风险和保护个人隐私的需要感到关心。一些人认为，警方使用监视技术是为了预防犯罪，而其他人认为这会侵犯个人权利

**标签**: `#surveillance`, `#law-enforcement`, `#privacy`, `#abuse-of-power`

---

<a id="item-5"></a>
## [研究人员提出使用提示注入作为角色混淆的新方法](https://role-confusion.github.io/) ⭐️ 8.0/10

研究人员提出使用提示注入作为大型语言模型绕过防护措施的新方法。这一技术利用模型如何解释提示来产生意想不到或有害的输出。 这一突破具有重大意义，突出了大型语言模型对提示注入攻击的脆弱性，对人工智能安全和安全性有重要影响。 研究人员提出使用提示注入绕过大型语言模型的防护措施，这可能导致意想不到或有害的输出。他们还讨论了当前模型在检测提示注入攻击方面的局限性。

hackernews · x312 · Jun 22, 15:48 · [社区讨论](https://news.ycombinator.com/item?id=48631888)

**背景**: 防护措施是一种用于过滤大型语言模型输入或输出的安全保障技术。提示注入是一种人工智能安全风险，攻击者通过操纵输入来影响语言模型的响应方式。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.aitrainingplus.com/post/when-ai-exposes-role-confusion-in-the-organization">When AI Exposes Role Confusion in the Organization</a></li>
<li><a href="https://arxiv.org/abs/2402.01822">[2402.01822] Building Guardrails for Large Language Models</a></li>

</ul>
</details>

**社区讨论**: 社区讨论强调了提示注入攻击的复杂性以及需要更强大的检测机制。一些评论者指出，当前模型在检测提示注入攻击方面并不有效。

**标签**: `#Natural Language Processing`, `#Large Language Models`, `#Security`, `#AI Safety`

---

<a id="item-6"></a>
## [研究人员发现 AI 模型易受提示注入攻击](https://simonwillison.net/2026/Jun/22/prompt-injection-as-role-confusion/#atom-everything) ⭐️ 8.0/10

研究人员发现 AI 模型可以通过提示注入攻击被“破坏”，这突出了当前 AI 技术的局限性。 这项突破对 AI 模型的开发和部署具有重大影响，因为它突出了提示注入的潜在风险和需要更强大的安全措施。 研究人员发现“去样式化”（重写文本以使其看起来与预期格式不同）对模型分类文本的方式产生了重大影响，并且这一漏洞可以被利用来绕过安全措施。

rss · Simon Willison · Jun 22, 23:59

**背景**: 提示注入是一种利用对抗性提示工程来操纵 AI 模型的代码注入攻击。这一漏洞被认为是解决当前模型提示注入的关键挑战。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Prompt_injection">Prompt injection - Wikipedia</a></li>
<li><a href="https://www.ibm.com/think/topics/prompt-injection">What Is a Prompt Injection Attack? | IBM</a></li>
<li><a href="https://openai.com/index/prompt-injections/">Understanding prompt injections: a frontier security challenge | OpenAI</a></li>

</ul>
</details>

**社区讨论**: 评论部分很有见解，作者表达了他们对可读性学术写作的热情和提示注入的潜在风险。

**标签**: `#AI`, `#Machine Learning`, `#Natural Language Processing`, `#Prompt Injection`, `#Role Confusion`

---

<a id="item-7"></a>
## [黄仁勋：轻视华为、轻视中国制造的人极其天真，英伟达将全力向华为学习](https://t.me/zaihuapd/42107) ⭐️ 8.0/10

英伟达创始人黄仁勋在北京的媒体会上表扬华为的实力和芯片设计能力，表示英伟达将从华为学习。 这个声明挑战了华为可以轻易被超越的观点，并强调了华为在半导体行业的能力的重要性。 黄仁勋强调了华为在系统工程、网络工程和云服务方面的优势，以及他们出色的芯片设计能力。

telegram · zaihuapd · Jun 22, 09:05

**背景**: 系统工程是一门跨学科领域，关注设计、集成和管理复杂系统。华为通过其成功的系统工程项目展示了其在这一领域的能力。网络工程也是华为业务的关键方面，强调设计和实施可靠和可扩展的计算机网络。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Systems_engineering">Systems engineering</a></li>
<li><a href="https://www.systemsengineering.com/">Systems Engineering</a></li>
<li><a href="https://www.thepaper.cn/newsDetail_forward_26532005">人工智能与生态学的协同未来_澎湃号·湃客_澎湃新闻-The Paper</a></li>

</ul>
</details>

**标签**: `#NVIDIA`, `#Huawei`, `#Artificial Intelligence`, `#Machine Learning`, `#Semiconductor`

---

<a id="item-8"></a>
## [OpenAI 启动修补地球计划 用 AI 帮开源软件找漏洞](https://openai.com/index/patch-the-planet/) ⭐️ 8.0/10

OpenAI 宣布启动修补地球计划，利用 AI 模型协助开源项目修复漏洞。目前已覆盖 cURL、Go、Python 等 30 多个项目，发现数百安全问题 这项倡议重要，因为它有潜力显著改善开源软件的安全性，开源软件在各行各业广泛使用。它也表明 OpenAI 致力于利用 AI 做好事 这项倡议利用 AI 模型协助识别和修复开源软件中的漏洞，已经覆盖了 30 多个项目。这些 AI 模型在大量代码的训练数据上训练，能够识别潜在的安全问题

telegram · zaihuapd · Jun 23, 01:01

**背景**: OpenAI 一直在积极推进 AI 驱动的网络安全倡议，包括 Daybreak 和 Trusted Access for Cyber。这些倡议旨在利用 AI 改善软件和系统的安全性

<details><summary>参考链接</summary>
<ul>
<li><a href="https://openai.com/daybreak/">Daybreak | OpenAI for cybersecurity</a></li>
<li><a href="https://openai.com/index/gpt-5-5-with-trusted-access-for-cyber/">Scaling Trusted Access for Cyber with GPT-5.5 and ... - OpenAI</a></li>

</ul>
</details>

**标签**: `#AI`, `#Security`, `#OpenAI`, `#Patch-the-Planet`, `#Cybersecurity`

---

<a id="item-9"></a>
## [Steam Machine 今天正式上市，采用预约系统和用户定制](https://store.steampowered.com/news/group/45479024/view/685257114654870245) ⭐️ 7.0/10

Steam Machine 新款游戏机今日正式上市，采用预约系统并允许用户自定义 此次上市意义重大，因为它标志着 Steam Machine 进入了新时代，用户可以更灵活地控制自己的游戏体验 Steam Machine 采用预约系统来减少抢购和机器人购买，并允许用户自定义机器的各个组件

hackernews · theschwa · Jun 22, 17:09 · [社区讨论](https://news.ycombinator.com/item?id=48632884)

**背景**: Steam Machine 是由 Valve 开发的专为家庭游戏机设计的游戏机，旨在为用户提供无缝的游戏体验。该公司已经在开发该项目多年，这次上市标志着一个重要里程碑

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.gadgetmatch.com/steam-machine-valve-price-availability/">Steam Machine price, reservation system revealed - GadgetMatch</a></li>
<li><a href="https://www.studioglobal.ai/discover/answers/search-fact-check-with-cited-sources-for-6a397fa56df44d1ca8602dce">Valve Steam Machine Price, Reservation System, and Launch ...</a></li>
<li><a href="https://resellcalendar.com/news/news/valve-steam-machine-preorder-guide-reservation-price-shipping-date/">How Valve's Steam Machine Preorder System Works</a></li>

</ul>
</details>

**社区讨论**: 用户对此次上市普遍持积极态度，称赞了对用户自定义的开放性和预约系统的减少抢购

**标签**: `#Steam Machine`, `#Gaming PC`, `#Hardware`, `#Gaming`

---

<a id="item-10"></a>
## [用户创建了一个无广告的逻辑谜题网站](https://puzzlelair.com/) ⭐️ 7.0/10

用户分享了他们创建逻辑谜题网站避免广告的经历，并分享了他们的新网站，PuzzleLair。 这很重要，因为它展示了用户为创建无广告的谜题体验而付出的努力，这可能会吸引那些寻求无干扰环境的人。 用户创建了一个逻辑谜题网站，包含各种谜题，包括 Nonogram 和 Sudoku，并分享了他们开发网站的经历。

hackernews · HaxleRose · Jun 22, 12:23 · [社区讨论](https://news.ycombinator.com/item?id=48629213)

**背景**: 逻辑谜题网站是一种在线游戏，要求玩家使用逻辑和推理来解决谜题。创建这样的网站需要对游戏开发和谜题设计有很好的理解。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://mind-matrixx.com/">Mind Matrix - Professional Puzzle Game Development Services</a></li>
<li><a href="https://sunstrikestudios.com/en/blog/puzzle_game_development/">How to Make a Puzzle Game: Step-by-Step Guide (2026)</a></li>
<li><a href="https://project.joshhills.dev/logic-puzzle-generator/">Logic Grid Puzzle Generator</a></li>

</ul>
</details>

**社区讨论**: 社区用户分享了他们自己的经历和逻辑谜题网站的推荐，包括 PuzzleParlor 和 Simon Tatham 的谜题集合。

**标签**: `#logic-puzzles`, `#ad-free`, `#puzzle-site`, `#game-development`

---

<a id="item-11"></a>
## [《置身团内》前美团到餐产品发文](https://t.me/zaihuapd/42110) ⭐️ 7.0/10

一位自称曾任职美团到餐业务的基层产品经理在社交媒体发文，指出美团存在三大组织问题：产品岗位沦为传话筒，员工被要求猜测上级意图而非独立判断；坐拥海量本地生活交易数据，但业务决策仍依赖人肉和经验，未能形成有效数据资产；AI 项目被包装成万能药，实际只是用模型替代人肉填坑，没有重新定义问题。 这位前产品经理的发文指出了美团存在的组织问题，包括过于依赖人肉判断和 AI 采用不够有效，这些问题可能会阻碍创新和业务增长。 前产品经理认为，美团早期靠极致的执行力和成本控制赢得百团大战，但如今业务方向不再确定，路径依赖正成为创新障碍。

telegram · zaihuapd · Jun 22, 11:40

**背景**: 美团是中国领先的食品配送和在线点餐平台。公司被批评存在组织问题，包括过于依赖人肉判断和 AI 采用不够有效。路径依赖是指组织由于历史原因继续使用已有的实践和技术的趋势。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.tandfonline.com/doi/full/10.1080/09537325.2025.2489133">A path dependency view of innovation ecosystems: a systematic ...</a></li>
<li><a href="https://www.sciencedirect.com/science/article/pii/S0048733321001281">Re-examining path dependence in the digital age: The ...</a></li>
<li><a href="https://www.investopedia.com/terms/p/path-dependency.asp">What Is Path Dependency? Definition, Effects, and Example</a></li>
<li><a href="https://committee.iso.org/files/live/sites/tc251/files/guidance/ISO+TC251+ISO55013+Rev3.pdf">Guidance on the Management of Data Assets</a></li>
<li><a href="https://www.mdpi.com/1099-4300/28/4/377">Human-in-the-Loop Artificial Intelligence: A Systematic ...</a></li>
<li><a href="https://www.linkedin.com/pulse/keeping-humans-loop-strategic-approach-ai-stephanie-barnes-gmuzc/">Keeping Humans in the Loop: A Strategic Approach to AI ...</a></li>

</ul>
</details>

**社区讨论**: 这篇文章引发了关于 AI 采用和业务决策中的数据资产管理的讨论。

**标签**: `#Meituan`, `#product management`, `#AI adoption`, `#organizational issues`

---

<a id="item-12"></a>
## [48 位中国开发者举报苹果涉嫌垄断，称费率承诺未兑现](https://m.nbd.com.cn/articles/2026-06-22/4433380.html) ⭐️ 7.0/10

48 位中国 iOS 开发者向国家市场监督管理总局提交举报信，指控苹果公司滥用中国市场垄断地位，未兑现‘中国市场 App Store 费率不高于其他市场整体水平’的承诺。 此举报表明了苹果在中国市场的垄断地位和对中国开发者的潜在影响。 举报信特别指出苹果未兑现‘中国市场 App Store 费率不高于其他市场整体水平’的承诺。

telegram · zaihuapd · Jun 22, 14:57

**背景**: 苹果因市场垄断和对开发者的待遇而受到批评。在中国，开发者一直抱怨 App Store 的高费用。这项举报是对苹果商业行为的更广泛审查的一部分。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://zh.wikipedia.org/wiki/壟斷">壟斷 - 维基百科，自由的百科全书</a></li>
<li><a href="https://www.guozunlaw.com/news-76471.html">【国樽律所】垄断地位与垄断行为辨析，维护公平竞争市场环境的法律解...</a></li>
<li><a href="https://www.zhihu.com/question/608984990">看到过一个说法「垄断本身不违法，滥用垄断地位搞不正当竞争才违法」...</a></li>

</ul>
</details>

**社区讨论**: 遗憾的是，这篇文章没有评论。

**标签**: `#Apple`, `#Monopolistic Practices`, `#China`, `#Tech Industry`

---

<a id="item-13"></a>
## [LG 智能电视应用被检出住宅代理 SDK](https://spur.us/blog/smart-tv-apps-residential-proxy-sdks) ⭐️ 7.0/10

一项针对 LG 和三星智能电视应用的扫描显示，在抽样的 6038 款应用中，有 2058 款检出住宅代理 SDK，其中 LG 平台占比接近一半。 这项问题揭示了 LG 智能电视用户面临的重大安全风险，因为他们的家庭 IP 地址可以被第三方无需同意就访问。 住宅代理 SDK 可以将智能电视连接到住宅代理网络，使第三方能够访问家庭 IP 地址。亚马逊和罗库已经限制了类似的 SDK。

telegram · zaihuapd · Jun 23, 02:26

**背景**: 住宅代理 SDK 用于访问家庭 IP 地址，如果不恰当管理，会造成安全风险。这一问题与智能电视应用中使用住宅代理的相关。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://spur.us/blog/smart-tv-apps-residential-proxy-sdks">Nearly Half of LG Smart TV Apps Contain Residential Proxy SDKs</a></li>
<li><a href="https://www.fbi.gov/investigate/cyber/alerts/2026/evading-residential-proxy-networks-protecting-your-devices-from-becoming-a-tool-for-criminals">Evading Residential Proxy Networks: Protecting Your Devices ...</a></li>
<li><a href="https://github.com/Iploop/proxyclaw">GitHub - Iploop/proxyclaw: Residential proxy SDK for Python ... List of companies providing residential proxies or related ... Free Apps on Samsung and LG Smart TVs Secretly Turning Your ... Internet Crime Complaint Center (IC3) | Evading Residential ... iploop-sdk · PyPI</a></li>

</ul>
</details>

**社区讨论**: 遗憾的是，没有可用的评论。

**标签**: `#LG`, `#Smart TV`, `#Security`, `#Proxy SDK`

---

<a id="item-14"></a>
## [阿里巴巴发布视频生成模型 HappyHorse 1.1](https://tech.ifeng.com/c/8uAHJ0kXXTD) ⭐️ 6.0/10

阿里巴巴发布了视频生成模型 HappyHorse 1.1 的更新版本，带来了性能和功能的提升。 此更新很重要，因为它增强了 HappyHorse 模型的功能，这是一个开源的 AI 视频生成模型。 新版本保持了 HappyHorse 1.0 的相同技术规范，生成时间为 3-15 秒，支持 720p、1080p 和自由宽高比。

telegram · zaihuapd · Jun 22, 09:45

**背景**: HappyHorse 是一个 AI 大模型，用于将文本提示或图像转换为视频。它在 2026 年 4 月初首次出现，并在 AI 社区中广泛讨论。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://grokipedia.com/page/HappyHorse_text-to-video_model">HappyHorse (text-to-video model)</a></li>
<li><a href="https://happyhorse-model.com/en">HappyHorse-1.0 — The #1 Open Source AI Video Model</a></li>
<li><a href="https://happyhourse.com/">Happy Horse 1.0 & 2.0 | Open-Source AI Video Model & Generator</a></li>

</ul>
</details>

**标签**: `#video-generation`, `#AI-models`, `#Alibaba`, `#machine-learning`

---

<a id="item-15"></a>
## [加拿大计划在 2040 年前建造 10 个核反应堆](https://www.cbc.ca/news/politics/federal-nuclear-strategy-9.7244509) ⭐️ 5.0/10

加拿大计划在 2040 年前建造 10 个核反应堆，作为核能复兴的一部分 这个计划很重要，因为它旨在增加核能生产，减少加拿大的对化石燃料的依赖，并缓解气候变化 这个计划包括在 2035 年前建造两座大型核反应堆，到 2040 年前建造五座

hackernews · geox · Jun 22, 19:06 · [社区讨论](https://news.ycombinator.com/item?id=48634585)

**背景**: 核能复兴是指核能工业复兴，受益于化石燃料价格上涨和减少二氧化碳排放的新关注。小型模块核反应堆（SMRs）是高碳排放低能量的先进核反应堆，可以产生 300MW 的电力

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Nuclear_renaissance">Nuclear renaissance</a></li>
<li><a href="https://www.energy.gov/ne/articles/one-year-after-executive-orders-us-nuclear-energy-renaissance-full-swing">One Year After Executive Orders, U.S. Nuclear Energy ...</a></li>
<li><a href="https://www.iaea.org/newscenter/news/what-are-small-modular-reactors-smrs">What are Small Modular Reactors (SMRs)? | IAEA</a></li>

</ul>
</details>

**社区讨论**: 一些评论者称赞这个计划，指出加拿大有丰富的铀矿资源和核设计和建设的经验。其他人表示怀疑，质疑这个计划的时间表和可行性

**标签**: `#nuclear-energy`, `#sustainability`, `#environmental-impact`, `#energy-policy`, `#canada`

---

<a id="item-16"></a>
## [微软认错：将重新允许用户调整 Windows 11 任务栏位置](https://t.me/zaihuapd/42123) ⭐️ 5.0/10

微软将允许用户调整 Windows 11 任务栏位置，并提供更灵活的更新选项。 这一变化很重要，因为它解决了用户的抱怨，并为 Windows 11 提供了更大的控制权。 用户将能够在初始设备设置期间调整任务栏位置，并选择跳过更新或重启或关机而不是安装待更新包。

telegram · zaihuapd · Jun 23, 01:41

**背景**: Windows 11 在 2021 年发布时，任务栏位置固定，这引起了用户的批评。微软现在承认了错误，并正在进行更改以解决用户反馈。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Microsoft_Copilot">Microsoft Copilot - Wikipedia</a></li>
<li><a href="https://zh.wikipedia.org/zh-hans/Microsoft_Copilot">Microsoft Copilot - 维基百科，自由的百科全书</a></li>

</ul>
</details>

**标签**: `#Windows 11`, `#Microsoft`, `#Operating System Updates`

---

<a id="item-17"></a>
## [OpenAI 推 AI 动画电影《Critterz》](https://t.me/zaihuapd/42125) ⭐️ 5.0/10

OpenAI 正在制作一部名为《Critterz》的动画长片，成本不到 3000 万美元，制作周期仅为 9 个月。 这个项目展示了 OpenAI 在 AI 动画电影制作方面的能力，展示了 AI 在电影业的革命性潜力。 这部电影将主要使用 OpenAI 自家的 AI 工具（包括 GPT-5），并计划在 2026 年在戛纳电影节首映。

telegram · zaihuapd · Jun 23, 03:11

**背景**: OpenAI 开发了一系列 AI 工具，包括 GPT-5，可以用于写作、研究和编码等任务。该公司还正在探索 AI 在电影制作中的应用，目标是降低成本和提高效率。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/GPT-5">GPT-5</a></li>
<li><a href="https://openai.com/gpt-5/">GPT‑5 is here - OpenAI</a></li>
<li><a href="https://www.deepfiction.ai/blog/ai-filmmaking-pipeline-script-to-screen-2026">The Complete AI Filmmaking Pipeline: From Script to Screen in ...</a></li>

</ul>
</details>

**标签**: `#AI`, `#Animation`, `#OpenAI`, `#Movie Production`, `#GPT-5`

---