---
layout: default
title: "Horizon Summary: 2026-06-16 (ZH)"
description: "From 37 items, 30 important content pieces were selected"
date: 2026-06-16
lang: zh
---

> From 37 items, 30 important content pieces were selected

---

1. [LinkedIn 岗位职位包含隐藏后门](#item-1) ⭐️ 9.0/10
2. [哪吒监控探针存在严重未授权路径穿越漏洞](#item-2) ⭐️ 9.0/10
3. [黑客在 Wi-Fi 智能灯泡中创建禁书图书馆](#item-3) ⭐️ 8.0/10
4. [Iroh 1.0：一个新的应用层网络解决方案](#item-4) ⭐️ 8.0/10
5. [用户分享使用本地模型替代大型语言模型的经验](#item-5) ⭐️ 8.0/10
6. [作者对计算机和人工智能的爱](#item-6) ⭐️ 8.0/10
7. [作者分享个人 AI 开发平台设置和工作流程](#item-7) ⭐️ 8.0/10
8. [铜运输药物恢复记忆并清除有毒的阿尔茨海默病蛋白](#item-8) ⭐️ 8.0/10
9. [美国电池制造产量持续创下新高](#item-9) ⭐️ 8.0/10
10. [Fable 5 出口控制被批评损害美国网络防御](#item-10) ⭐️ 8.0/10
11. [ Anthropic 的模型因性格冲突而下线](#item-11) ⭐️ 8.0/10
12. [美国政府限制 Anthropic 的 Mythos 和 Fable 模型访问](#item-12) ⭐️ 8.0/10
13. [热捧的开源模型 Rio 3.5 被证实为套壳中国开源模型](#item-13) ⭐️ 8.0/10
14. [消费者起诉 Anthropic，称其高端 AI 计划使用限额不实](#item-14) ⭐️ 8.0/10
15. [Qwen 发布机器人套件：三个基础模型覆盖导航、操作与世界建模](#item-15) ⭐️ 8.0/10
16. [TinyWind：一个具有真实风物理学的像素海盗航行游戏](#item-16) ⭐️ 7.0/10
17. [Hetzner 云服务器价格调整](#item-17) ⭐️ 7.0/10
18. [Salesforce 收购 Fin 3.6 亿美元，扩大客户支持 AI 能力](#item-18) ⭐️ 7.0/10
19. [福克斯公司有望收购流媒体设备制造商 Roku](#item-19) ⭐️ 6.0/10
20. [Commander Keen 游戏引擎分析](#item-20) ⭐️ 6.0/10
21. [Cloudflare CAPTCHA：如何忽略简单的搜索 URL](#item-21) ⭐️ 6.0/10
22. [小红书据称准备月底在港秘密提交 IPO 申请](#item-22) ⭐️ 6.0/10
23. [华为否认鸿蒙是安卓套壳系统](#item-23) ⭐️ 6.0/10
24. [蚂蚁集团正在测试 AI 版支付宝，改进用户交互](#item-24) ⭐️ 6.0/10
25. [Fable AI 模型展示其网络防御能力](#item-25) ⭐️ 5.0/10
26. [datasette-agent 0.3a0：添加用户批准功能](#item-26) ⭐️ 5.0/10
27. [Kimi 推出 K2.7 Code 高速模式，编程任务提速 6 倍](#item-27) ⭐️ 5.0/10
28. [苹果将统一「登录苹果」与「隐藏邮件」域名](#item-28) ⭐️ 5.0/10
29. [火山引擎公布 Seedance2.0 计费](#item-29) ⭐️ 5.0/10
30. [谷歌地球网页版上线免费飞行模拟器](#item-30) ⭐️ 5.0/10

---

<a id="item-1"></a>
## [LinkedIn 岗位职位包含隐藏后门](https://roman.pt/posts/linkedin-backdoor/) ⭐️ 9.0/10

LinkedIn 岗位职位包含一个隐藏后门，当依赖项安装时可以执行恶意代码。 这是一个重要的发现，因为它突出了假冒职位的潜在风险和验证工作机会真实性的重要性。 后门被隐藏在 GitHub 仓库中，当安装依赖项时触发，这是软件开发中常见的做法。

hackernews · lwhsiao · Jun 15, 20:00 · [社区讨论](https://news.ycombinator.com/item?id=48546294)

**背景**: 假冒职位已成为技术行业的增长关注点，攻击者使用它们来窃取敏感信息或在受害者机器上安装恶意软件。这一发现强调了开发人员在申请工作时应谨慎，并验证工作机会的真实性。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://roman.pt/posts/linkedin-backdoor/">A backdoor in a LinkedIn job offer - Roman Imankulov</a></li>
<li><a href="https://blog.salaam.dev/posts/malicious-job-offers-how-one-suspicious-gig-revealed-a-hidden-backdoor/">Malicious Job Offers ; How One Suspicious Gig Revealed a Hidden ...</a></li>
<li><a href="https://www.jovweb.dev/blog/rental-platform-malware-part-2">They Tried Again: Dissecting a Second Fake Job Malware Attack | Blog</a></li>

</ul>
</details>

**社区讨论**: 社区讨论围绕该问题的严重性展开，部分用户表达了对 LinkedIn 和 GitHub 未移除后门的沮丧之情，尽管已被报告。

**标签**: `#cybersecurity`, `#backdoor`, `#job offer`, `#linkedin`

---

<a id="item-2"></a>
## [哪吒监控探针存在严重未授权路径穿越漏洞](https://github.com/nezhahq/nezha/security/advisories/GHSA-5c25-7vpj-9mqh) ⭐️ 9.0/10

哪吒监控（Nezha）v2.0.13 以下版本存在严重未授权路径穿越漏洞，编号 CVE-2026-53519，CVSS 评分为 9.1 属于高危级别。 该漏洞使攻击者能够读取配置文件并获取 JWT 密钥，造成对受影响系统的重大安全风险。 该漏洞可以通过构造 GET 请求（如/dashboar../data/config.yaml）来利用，攻击者可以读取服务器上的任意文件。

telegram · zaihuapd · Jun 15, 09:25

**背景**: 公共漏洞评分系统（CVSS）是一种开放的框架，用于评估计算机系统的安全漏洞严重性。CVSS 评分范围从 0 到 10，10 表示最严重。路径穿越漏洞发生在应用程序未能正确验证或清洗用户提供的文件名时，攻击者可以访问未经授权的文件。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/CVSS">CVSS</a></li>
<li><a href="https://en.wikipedia.org/wiki/Path_traversal_vulnerability">Path traversal vulnerability</a></li>

</ul>
</details>

**标签**: `#security`, `#vulnerability`, `#path-traversal`, `#CVE-2026-53519`, `#Nezha`

---

<a id="item-3"></a>
## [黑客在 Wi-Fi 智能灯泡中创建禁书图书馆](https://www.richardosgood.com/posts/banned-book-library/) ⭐️ 8.0/10

黑客使用 Wi-Fi 智能灯泡建立的网状网络，托管禁书图书馆，突出了信息自由与文化敏感性的紧张关系。 这种利用 Wi-Fi 智能灯泡作为网状网络的创新的方法，引发了人们对审查、信息自由和文化敏感性的讨论。 网状网络使用每个智能灯泡作为节点来传递信息，使得系统更加分散和容错。

hackernews · sohkamyung · Jun 15, 22:37 · [社区讨论](https://news.ycombinator.com/item?id=48547985)

**背景**: 网状网络是一种网络拓扑结构，节点直接连接，实现高效的数据路由和容错。Wi-Fi 智能灯泡使用网状技术提供稳定和可靠的连接。该项目中使用网状网络，突出了分散和社区驱动的信息共享的潜力。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Mesh_networking">Mesh networking</a></li>
<li><a href="https://www.pcmag.com/picks/the-best-wi-fi-mesh-network-systems">The Best Wi-Fi Mesh Network Systems for 2026 - PCMag</a></li>
<li><a href="https://www.nytimes.com/wirecutter/reviews/best-smart-led-light-bulbs/">The 4 Best Smart LED Light Bulbs of 2026 | Reviews by Wirecutter</a></li>

</ul>
</details>

**社区讨论**: The community discussion revolves around the tension between freedom of information and cultural sensitivity, with some users expressing concerns about the potential for misuse and others praising the innovative use of technology.

**标签**: `#censorship`, `#mesh-network`, `#hacking`, `#freedom-of-information`

---

<a id="item-4"></a>
## [Iroh 1.0：一个新的应用层网络解决方案](https://www.iroh.computer/blog/v1) ⭐️ 8.0/10

Iroh 1.0 是一个新的应用层网络解决方案，允许开发人员将安全的网络功能直接嵌入到他们的应用程序中。它使应用程序之间的安全、对等通信成为可能。 Iroh 1.0 很重要，因为它为应用程序之间的安全和灵活通信提供了一个解决方案，而不依赖于传统的网络层解决方案，如 Tailscale。 Iroh 1.0 目前支持 IPv4、IPv6 和中继传输，但开发人员也可以使用提供的 API 实现自定义传输。该解决方案旨在安全灵活，注重零信任架构。

hackernews · chadfowler · Jun 15, 15:13 · [社区讨论](https://news.ycombinator.com/item?id=48542480)

**背景**: 应用层网络解决方案，如 Iroh 1.0，位于 OSI 模型的最高层，允许直接交互应用程序和网络。这一方法与传统的网络层解决方案，如 Tailscale，区别在于后者位于 OSI 模型的较低层。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Application_layer">Application layer - Wikipedia</a></li>
<li><a href="https://www.geeksforgeeks.org/computer-networks/application-layer-in-osi-model/">Application Layer in OSI Model - GeeksforGeeks</a></li>
<li><a href="https://www.geeksforgeeks.org/computer-networks/protocols-application-layer/">Protocols in Application Layer - GeeksforGeeks</a></li>
<li><a href="https://en.wikipedia.org/wiki/Zero_trust_architecture">Zero trust architecture</a></li>
<li><a href="https://grokipedia.com/page/zero_trust_architecture">Zero trust architecture</a></li>
<li><a href="https://www.linkedin.com/pulse/zero-trust-architecture-practice-from-theory-access-harshil-uttaradhi-ox9dc">Zero Trust Architecture in Practice: From Theory to Real-Time...</a></li>

</ul>
</details>

**社区讨论**: 围绕 Iroh 1.0 的社区讨论热烈，开发人员和用户分享了他们对解决方案的益处和局限性的看法。有些人质疑了新的应用层网络解决方案的必要性，而其他人则赞扬了 Iroh 1.0 的灵活性和安全功能。

**标签**: `#Networking`, `#Security`, `#Application-Layer`, `#Tailscale`, `#Zero-Trust`

---

<a id="item-5"></a>
## [用户分享使用本地模型替代大型语言模型的经验](https://news.ycombinator.com/item?id=48542100) ⭐️ 8.0/10

用户分享使用本地模型替代 Claude/GPT 等大型语言模型的日常编程经验，社区成员分享了他们的设置和性能指标 这次讨论突出了对数据隐私的增长兴趣和使用本地模型进行编程的可行性，这可能对人工智能的未来发展和部署有重大影响 用户使用 Pi 编码器和容器化/沙盒化本地模型，如 Qwen3.6 35b 和 Gemma 4 26b，实现性能指标，如 150 tok/s

hackernews · cloudking · Jun 15, 14:46

**背景**: 大型语言模型（LLMs）是基于语言数据训练的基础模型，使用本地模型被探索为解决数据隐私问题的潜在替代方案。Tokens per second（tok/s）是评估 LLMs 推理速度的关键性能指标

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Large_language_model">Large language model - Wikipedia</a></li>
<li><a href="https://www.ibm.com/think/topics/large-language-models">What Are Large Language Models ( LLMs )? | IBM</a></li>
<li><a href="https://www.geeksforgeeks.org/artificial-intelligence/large-language-model-llm/">Large Language Model (LLM) - GeeksforGeeks</a></li>
<li><a href="https://grokipedia.com/page/Tokens_per_second">Tokens per second — Grokipedia</a></li>
<li><a href="https://ibo.org/programmes/diploma-programme/curriculum/dp-core/theory-of-knowledge/what-is-tok/">What is the Theory of Knowledge - International Baccalaureate®</a></li>

</ul>
</details>

**社区讨论**: 社区成员分享了他们的经验和设置，有些人表达了不使用最新和最好的模型的机会成本的担忧

**标签**: `#Large Language Models`, `#Local Models`, `#Coding`, `#Data Privacy`, `#LLMs`

---

<a id="item-6"></a>
## [作者对计算机和人工智能的爱](https://michaelenger.com/blog/i-love-the-computer/) ⭐️ 8.0/10

作者分享了他们对计算机的个人爱好，并反思了行业和人工智能，强调了两者的乐趣和挑战。 这个个人反思提供了作者对计算机行业和人工智能的独特视角，激发了对他们的重要性和影响的讨论。 作者讨论了行业的'酷'因素下降和人工智能的兴起，强调了这些发展的利弊。

hackernews · speckx · Jun 15, 20:14 · [社区讨论](https://news.ycombinator.com/item?id=48546441)

**背景**: 作者反思了他们与计算机和行业的个人经历，提出了他们对计算机的爱和面临的挑战之间的相似之处。

**社区讨论**: 社区成员分享了他们对计算机和人工智能的个人经历和观点，强调了使用这些技术的乐趣和挑战。

**标签**: `#computers`, `#AI`, `#industry`, `#software engineering`, `#personal reflection`

---

<a id="item-7"></a>
## [作者分享个人 AI 开发平台设置和工作流程](https://rsgm.dev/post/ai-dev-platform/) ⭐️ 8.0/10

作者分享了他们的个人 AI 开发平台设置，包括用于自动化开发和测试的工具和工作流程。 这分享个人 AI 开发平台设置和工作流程为社区提供了宝贵的见解和多样化的观点。 作者使用 Forgejo、Agentic Rube Goldberg 等工具来自动化开发和测试过程。

hackernews · rsgm · Jun 15, 15:09 · [社区讨论](https://news.ycombinator.com/item?id=48542433)

**背景**: Agentic Rube Goldberg 指的是一个复杂的自动化过程系统，而 Forgejo 是一个用于管理 Git 仓库和问题跟踪的自主软件 forge。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Rube_Goldberg_machine">Rube Goldberg machine - Wikipedia</a></li>
<li><a href="https://en.wikipedia.org/wiki/Forgejo">Forgejo</a></li>
<li><a href="https://forgejo.org/">Forgejo – Beyond coding. We forge.</a></li>

</ul>
</details>

**社区讨论**: 社区成员分享了他们相似的经验和方法来建立 AI 开发平台，某些用户提供了额外的见解和资源。

**标签**: `#AI`, `#DevOps`, `#Automated Development`, `#Agentic Rube Goldberg`, `#Forgejo`

---

<a id="item-8"></a>
## [铜运输药物恢复记忆并清除有毒的阿尔茨海默病蛋白](https://www.monash.edu/news/articles/copper-drug-restores-memory-and-clears-toxic-alzheimers-proteins) ⭐️ 8.0/10

一款铜运输药物在小鼠体内恢复了记忆并清除有毒的阿尔茨海默病蛋白。该药物已经对其他疾病进行了安全性评估。 这一突破对阿尔茨海默病的治疗具有重大意义，这是一种常见的神经退行性疾病。该药物迅速进入临床试验的潜力为患者带来了新的希望。 该药物通过目标铜运输机制来清除有毒的阿尔茨海默病蛋白。研究结果表明，该药物可能比阿尔茨海默病蛋白直接治疗更有效。

hackernews · bookofjoe · Jun 15, 14:48 · [社区讨论](https://news.ycombinator.com/item?id=48542132)

**背景**: 阿尔茨海默病是一种复杂的神经退行性疾病，其特征是脑中积累的阿尔茨海默病蛋白。目前阿尔茨海默病的治疗方法往往无效，并且有严重的副作用。研究人员正在探索治疗疾病的替代方法，包括目标铜运输机制。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2863355/">Human copper transporters: mechanism, role in human diseases and therapeutic potential - PMC</a></li>
<li><a href="https://www.nature.com/articles/s41467-024-47001-4">Diverse roles of the metal binding domains and transport mechanism of copper transporting P-type ATPases | Nature Communications</a></li>
<li><a href="https://pubs.acs.org/doi/10.1021/ar500300n">Copper Transport and Trafficking at the Host–Bacterial Pathogen Interface | Accounts of Chemical Research</a></li>

</ul>
</details>

**社区讨论**: 一些评论者对研究结果表示怀疑，而其他人则对铜运输药物的潜力感到乐观。有一个评论者指出，该药物已经对其他疾病进行了安全性评估，这可能会加快其进入临床试验的速度。

**标签**: `#Alzheimer's Disease`, `#Copper Transport`, `#Neurodegenerative Disorder`, `#Medical Research`, `#Pharmacology`

---

<a id="item-9"></a>
## [美国电池制造产量持续创下新高](https://fred.stlouisfed.org/series/IPG33591S) ⭐️ 8.0/10

美国电池制造产量持续创下新高，但美国仍落后于中国在产量能力方面 这很重要，因为它突出了美国需要赶上中国产量能力的需求，这对于电动汽车和能量存储的发展至关重要 美国目前的电池生产能力为 70GWh，中国为 1755GWh，欧盟为 252GWh

hackernews · epistasis · Jun 15, 20:28 · [社区讨论](https://news.ycombinator.com/item?id=48546616)

**背景**: 能量存储是捕获产生的能量并在以后使用以减少能量需求和能量生产之间的不平衡。能量存储系统提供了各种技术方法来管理我们的电力供应以创建更可靠的能源基础设施。电动汽车和能量存储的发展需要电池制造能力的重大进步

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Energy_storage">Energy storage - Wikipedia</a></li>
<li><a href="https://cleanpower.org/facts/clean-energy-storage/energy-storage-technologies/">Energy storage technologies | ACP</a></li>
<li><a href="https://www.sciencedirect.com/topics/engineering/energy-storage-technology">Energy Storage Technology - an overview | ScienceDirect Topics</a></li>
<li><a href="https://qoblex.com/blog/production-planning-complete-guide-to-optimizing-manufacturing-operations/">Production Planning: Complete Guide to Optimizing Manufacturing Operations | Qoblex</a></li>
<li><a href="https://www.tandfonline.com/doi/abs/10.1080/03052159408941349">A NONLINEAR MODEL FOR CAPACITY ALLOCATION AND THROUGHPUT DETERMINATION IN CELLULAR MANUFACTURING SYSTEMS: Engineering Optimization: Vol 23, No 2</a></li>
<li><a href="https://www.machinemetrics.com/blog/process-optimization-manufacturing">Production and Process Optimization in Manufacturing | MachineMetrics</a></li>

</ul>
</details>

**社区讨论**: 社区成员正在讨论美国需要赶上中国产量能力的需求以及电池制造能力的进步对于电动汽车和能量存储的发展的重要性

**标签**: `#battery-manufacturing`, `#electric-vehicles`, `#energy-storage`, `#us-economy`, `#china-economy`

---

<a id="item-10"></a>
## [Fable 5 出口控制被批评损害美国网络防御](https://simonwillison.net/2026/Jun/16/fable-5-export-controls/#atom-everything) ⭐️ 8.0/10

Fable 5 出口控制被批评限制了模型修复安全漏洞的能力，这对于美国网络防御至关重要。 这很重要，因为它突出了过度监管人工智能模型的潜在后果，这可能会阻碍它们在安全领域的帮助。 出口控制限制了模型修复代码的能力，这对于安全工作至关重要，并被批评过于宽泛。

rss · Simon Willison · Jun 16, 05:20

**背景**: Fable 5 是 Anthropic 开发的大型语言模型，所讨论的出口控制是美国政府试图监管人工智能技术出口的一部分。模型的修复代码的能力对于安全工作至关重要，因为它允许防御者要求模型识别并修复代码中的安全漏洞。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/CVESD">CVESD</a></li>

</ul>
</details>

**社区讨论**: 社区讨论正在进行中，有些用户表达了对过度监管人工智能模型的潜在后果的担忧，而其他人则认为出口控制是必要的，以防止人工智能技术的滥用。

**标签**: `#AI`, `#ML`, `#Security`, `#Export Controls`, `#Fable 5`

---

<a id="item-11"></a>
## [ Anthropic 的模型因性格冲突而下线](https://simonwillison.net/2026/Jun/15/axios-clashes-anthropics/#atom-everything) ⭐️ 8.0/10

美国政府官员与 Anthropic 团队之间的性格冲突导致公司模型的访问被暂停。 这次事件凸显了人工智能安全性和可访问性的平衡困境，以及出口控制指令的潜在后果。 暂停的原因据称是由于潜在的狭窄、非普遍的破坏性攻击， Anthropic 团队正在与商务部讨论此事。

rss · Simon Willison · Jun 15, 14:57

**背景**: 出口控制指令规范出口商品和技术的出口，包括人工智能模型，以防止其用于恶意目的。 Anthropic 的模型，如 Claude Fable 5 和 Claude Mythos 5，受这些规定的约束。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Export_control">Export control</a></li>
<li><a href="https://www.anthropic.com/news/claude-fable-5-mythos-5">Claude Fable 5 and Claude Mythos 5 \ Anthropic</a></li>
<li><a href="https://fortune.com/2025/09/04/anthropic-red-team-pushes-ai-models-into-the-danger-zone-and-burnishes-companys-reputation-for-safety/">Anthropic’s ‘ Red Team ’ pushes its AI models into the danger... | Fortune</a></li>

</ul>
</details>

**社区讨论**: 社区讨论围绕出口控制指令对人工智能研究和开发的影响展开，部分人表达了对其潜在影响的担忧。

**标签**: `#Anthropic`, `#Export Control`, `#US Government`, `#AI Models`

---

<a id="item-12"></a>
## [美国政府限制 Anthropic 的 Mythos 和 Fable 模型访问](https://t.me/zaihuapd/41960) ⭐️ 8.0/10

美国政府以国家安全为由限制了对 Anthropic 的 Mythos 5 和 Fable 5 模型的访问，Anthropic 已关闭这两款模型对所有客户的访问 这一限制对 AI/ML 行业产生了重大影响，可能限制对先进 AI 模型的访问，影响研究和开发 这一限制适用于 Mythos 5 和 Fable 5 模型，而其他 Claude 模型不受影响，Anthropic 正在努力尽快恢复访问

telegram · zaihuapd · Jun 15, 08:55

**背景**: Anthropic 的 Mythos 和 Fable 模型是该公司开发的先进 AI 模型。出口管制是限制出口某些技术，包括 AI 模型，以防止国家安全风险的规定

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Claude_(language_model)">Claude (language model ) - Wikipedia</a></li>
<li><a href="https://www.illumio.com/what-is-mythos">What Is Mythos AI ? Complete Technical Guide | Illumio</a></li>
<li><a href="https://fortune.com/2026/06/13/anthropic-disables-fable-mythos-export-controls-national-security-threat/">Anthropic disables Fable and Mythos AI models following... | Fortune</a></li>

</ul>
</details>

**社区讨论**: 社区担心这一限制对 AI 研究和开发的潜在影响，并对出口管制在防止国家安全风险方面的有效性表示疑问

**标签**: `#AI`, `#ML`, `#Anthropic`, `#Model Access`, `#National Security`

---

<a id="item-13"></a>
## [热捧的开源模型 Rio 3.5 被证实为套壳中国开源模型](https://mp.weixin.qq.com/s/0oYevRBT8PPxG5hudOXxug) ⭐️ 8.0/10

开源社区热捧的 Rio 3.5 模型被证实为套壳中国开源模型，引发争议。 这次争议凸显了开源社区中模型透明度和真实性的重要性，可能对模型信任度和采用度产生影响。 模型被发现有 79% 的概率自称为 Nex，并能复述 Nex 独有的机构介绍，混合比例约为 0.57:0.43，共线性超过 0.98。

telegram · zaihuapd · Jun 15, 12:39

**背景**: Rio 3.5 是一个热捧的开源模型，实现了自然语言处理任务的 state-of-the-art (SOTA) 表现。模型蒸馏（model distillation）技术被用于开发 Rio 3.5。HuggingFace 是一个分享和展示机器学习模型的平台，托管了 Rio 3.5。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Hugging_Face">Hugging Face</a></li>
<li><a href="https://developer.volcengine.com/articles/7501163741166174259">一文读懂到底什么是“模型 蒸 馏 （ Model Distillation ...”</a></li>

</ul>
</details>

**社区讨论**: No comments were provided in the content.

**标签**: `#open-source`, `#machine-learning`, `#model-controversy`, `#deep-learning`, `#natural-language-processing`

---

<a id="item-14"></a>
## [消费者起诉 Anthropic，称其高端 AI 计划使用限额不实](https://t.me/zaihuapd/41975) ⭐️ 8.0/10

华盛顿特区消费者 Karl Kahn 对 Anthropic 提起集体诉讼，指控其“Max 5x”和“Max 20x”订阅计划的实际使用上限远低于宣传。 这起诉讼突出了 AI 订阅成本和透明度不足的重要性，这对于依赖这些服务的消费者和企业来说至关重要。 Max 5x 和 Max 20x 计划，价格分别为 100 美元和 200 美元，分别被指控使用限额远低于宣传。

telegram · zaihuapd · Jun 16, 02:30

**背景**: Anthropic 的高端 AI 计划，包括 Max 5x 和 Max 20x，提供比标准 Pro 计划更高的使用限额。然而，用户反映出难以确定实际使用限额，导致透明度不足的担忧。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan">Using Claude Code with your Pro or Max Plan | Anthropic Help Center</a></li>

</ul>
</details>

**标签**: `#AI`, `#Anthropic`, `#Lawsuit`, `#Subscription Costs`, `#Transparency`

---

<a id="item-15"></a>
## [Qwen 发布机器人套件：三个基础模型覆盖导航、操作与世界建模](https://qwen.ai/blog?id=qwen-robotsuite) ⭐️ 8.0/10

Qwen 团队发布机器人套件，包含三个基础模型：Qwen-RobotNav、Qwen-RobotManip 和 Qwen-RobotWorld，覆盖导航、操作与世界建模。 这项发布展示了机器人和人工智能领域的进展，实现更高效和有效的导航、操作和世界建模。 三个模型采用语言无关接口，可以与通用大模型组合成物理智能体系统。

telegram · zaihuapd · Jun 16, 05:02

**背景**: Qwen-RobotNav 统一五大导航任务，包括语言指引导航、物体搜索和自主驾驶。Qwen-RobotManip 使用统一表示训练跨形态机器人数据，取得多个基准上的领先成绩。Qwen-RobotWorld 使用自然语言动作接口学习世界模型，覆盖 20 多种机器人形态。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.datacamp.com/tr/blog/qwen3-7-max">Qwen3.7-Max: Features, Benchmarks and Agent Capabilities | DataCamp</a></li>
<li><a href="https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154">Qwen3.7: The Agent Frontier - Alibaba Cloud Community</a></li>
<li><a href="https://news.futunn.com/en/post/74640237/triple-launch-alibaba-releases-the-embodied-large-model-qwen-robot">Triple launch! Alibaba releases the embodied large model Qwen-Robot series - 富途资讯</a></li>

</ul>
</details>

**标签**: `#Robotics`, `#Artificial Intelligence`, `#Machine Learning`, `#Natural Language Processing`, `#Autonomous Systems`

---

<a id="item-16"></a>
## [TinyWind：一个具有真实风物理学的像素海盗航行游戏](https://tinywind.io/) ⭐️ 7.0/10

TinyWind 是一个像素海盗航行游戏，具有真实风物理学，玩家可以航行超过 380,000 公里。 这个游戏在航行游戏中展示了真实风物理学，提供了更沉浸的游戏体验 游戏的风物理学引擎是一种智能近似，给玩家一种真实风的感觉，而不会降低性能

hackernews · tinywind · Jun 15, 16:15 · [社区讨论](https://news.ycombinator.com/item?id=48543475)

**背景**: 在游戏中，风物理学可以增加真实感和沉浸感，但实现这一点可能会面临挑战，TinyWind 使用智能近似来模拟风对物体和粒子的影响

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.linkedin.com/advice/0/how-can-you-realistically-implement-wind-physics-game-jg7oe">How to Simulate Realistic Wind Physics in a Game</a></li>
<li><a href="https://schneidersurgical.com/2025/08/23/how-wind-mechanics-inspire-modern-game-design/">How Wind Mechanics Inspire Modern Game Design – Schneider...</a></li>
<li><a href="https://dev.to/kelvin_kariuki_20f4bec616/developer-take-on-tinywind-a-pixel-pirate-sailing-game-with-real-wind-physics-380k-kms-sailed-2947">TinyWind: A pixel pirate sailing game with real wind physics ...</a></li>

</ul>
</details>

**社区讨论**: 社区为该游戏提供了建设性的反馈，建议改进，如更清晰的风方向指示器和更真实的航行机制

**标签**: `#gaming`, `#game-development`, `#physics-engine`, `#sailing-game`

---

<a id="item-17"></a>
## [Hetzner 云服务器价格调整](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/#cloud-servers) ⭐️ 7.0/10

Hetzner 公布了对其云服务器的价格调整，价格上涨了三倍。 此价格调整对云计算行业产生了重大影响，影响了依赖 Hetzner 服务的企业和个人。 新价格已在 Hetzner 文档网站上发布，旧价格存档供比较。

hackernews · tuhtah · Jun 15, 13:19 · [社区讨论](https://news.ycombinator.com/item?id=48540844)

**背景**: 服务器产品标准化已成为行业趋势，旨在提高效率并降低成本。然而，这次价格调整表明硬件成本正在上涨，这可能会影响行业的动态。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.servertech.com/blog/server-tech-cx-and-data-center-standardization">Servertech Cx and Data Center Standardization</a></li>
<li><a href="https://community.intel.com/t5/Blogs/Thought-Leadership/Big-Ideas/Modularity-and-Standardization-Transforming-Server-Architecture/post/1428908">Modularity and Standardization Transforming Server Architecture - Intel Community</a></li>
<li><a href="https://www.iso.org/home.html">ISO - International Organization for Standardization</a></li>

</ul>
</details>

**社区讨论**: 社区成员对价格上涨表示担忧，质疑其合理性和对行业的潜在影响。

**标签**: `#cloud-computing`, `#infrastructure`, `#pricing`, `#hardware-costs`, `#industry-trends`

---

<a id="item-18"></a>
## [Salesforce 收购 Fin 3.6 亿美元，扩大客户支持 AI 能力](https://www.salesforce.com/news/press-releases/2026/06/15/salesforce-signs-definitive-agreement-to-acquire-fin/?bc=HL) ⭐️ 7.0/10

Salesforce 收购了 Fin，客户支持 AI 代理公司，3.6 亿美元，这是该行业的一个重大发展。 这次收购凸显了客户支持中的 AI 的日益重要性，以及 Salesforce 在该领域扩大能力的努力。 Fin 的 AI 代理技术旨在处理复杂的客户问题并提供更高质量的答案，具有 100 万美元的保证金。

hackernews · colesantiago · Jun 15, 12:08 · [社区讨论](https://news.ycombinator.com/item?id=48540126)

**背景**: Fin 曾被称为 Intercom，客户消息平台，推出了 AI 代理技术来处理客户支持。收购被视为 Salesforce 在客户支持 AI 方面扩大能力的战略举措。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://fin.ai/">Fin . The #1 AI Agent for customer service</a></li>
<li><a href="https://www.intercom.com/help/en/articles/7120684-fin-ai-agent-explained">Fin AI Agent explained | Intercom Help</a></li>

</ul>
</details>

**社区讨论**: 社区讨论集中在收购对客户支持 AI 市场的潜在影响以及 Salesforce 和其他玩家如 Sierra 之间的竞争上。

**标签**: `#Salesforce`, `#AI`, `#Customer Support`, `#Mergers and Acquisitions`

---

<a id="item-19"></a>
## [福克斯公司有望收购流媒体设备制造商 Roku](https://www.wsj.com/business/deals/fox-roku-deal-f6e564f9) ⭐️ 6.0/10

福克斯公司正在与流媒体设备制造商 Roku 进行谈判，可能会对用户体验和数据隐私产生影响 这次收购可能会导致用户体验和数据隐私的变化，并对流媒体行业产生影响 这次收购可能会对 Roku 的服务中立架构和用户体验产生影响，并引发数据隐私的担忧

hackernews · thm · Jun 15, 12:50 · [社区讨论](https://news.ycombinator.com/item?id=48540499)

**背景**: Roku 是一家流媒体设备制造商，提供了多种流媒体设备和服务。近年来，该公司一直在扩大其产品线，包括推出自己的流媒体服务。另一方面，福克斯公司是一家大型媒体公司，正在寻求扩大其在流媒体行业的存在

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.pcworld.com/article/582754/best-media-streaming-device.html">Best streaming devices 2026: Apple TV, Roku, Fire TV... | PCWorld</a></li>
<li><a href="https://funny-smart.com/about-us/">DataMax - Professional Streaming Device Manufacturer Since 2013</a></li>
<li><a href="https://www.sztomato.com/">Android TV Box | Smart TV Box | Set Top Box | Streaming Media Player</a></li>

</ul>
</details>

**社区讨论**: 社区成员正在表达对潜在影响的担忧，包括用户体验和数据隐私，并推荐了替代设备和服务

**标签**: `#Roku`, `#Fox`, `#Streaming`, `#Acquisition`, `#Media`

---

<a id="item-20"></a>
## [Commander Keen 游戏引擎分析](https://forgottenbytes.net/commander_keen.html) ⭐️ 6.0/10

Commander Keen 游戏引擎的历史分析已发布，讨论了其技术创新和局限性。 这项分析为早期 PC 游戏的开发提供了见解，并讨论了 Commander Keen 成为一个具有里程碑意义的游戏的创新。 分析重点关注游戏引擎的架构和如何使用它来创建平滑滚动，这在当时是一项具有里程碑意义的功能。

hackernews · mfiguiere · Jun 15, 17:52 · [社区讨论](https://news.ycombinator.com/item?id=48544781)

**背景**: Commander Keen 系列由 id Software 开发，这家公司因其对 3D 游戏开发的贡献而闻名。该系列最初于 1980 年代末发布，共有三个章节。Commander Keen 中使用的游戏引擎在当时是一项重大创新，允许平滑滚动和其他早期游戏引擎无法实现的功能。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Commander_Keen">Commander Keen - Wikipedia</a></li>
<li><a href="https://www.howtogeek.com/704727/30-years-of-vorticons-how-commander-keen-changed-pc-gaming/">30 Years of Vorticons: How Commander Keen Changed PC Gaming</a></li>
<li><a href="https://store.steampowered.com/app/9180/Commander_Keen/">Commander Keen on Steam</a></li>

</ul>
</details>

**社区讨论**: 围绕分析的社区讨论是多样的，有些用户批评了作者使用 ChatGPT 和从另一作者复制内容的行为，而其他人提供了宝贵的见解和进一步背景的建议。

**标签**: `#game_engine`, `#history_of_computing`, `#id_software`, `#commander_keen`, `#retro_games`

---

<a id="item-21"></a>
## [Cloudflare CAPTCHA：如何忽略简单的搜索 URL](https://simonwillison.net/2026/Jun/16/captcha-on-at-least-one-ampersand/#atom-everything) ⭐️ 6.0/10

作者发现了一个方法，可以让 Cloudflare CAPTCHA 只在包含至少一个 ampersand 的搜索 URL 时触发。 这对于网站所有者来说很重要，他们想阻止爬虫过度爬取他们的搜索引擎，同时仍允许简单的搜索工作。 解决方案涉及使用 Claude Code 创建一个自定义规则，检查搜索 URL 的查询字符串中是否存在 ampersand。

rss · Simon Willison · Jun 16, 00:21

**背景**: Cloudflare 的 CAPTCHA，也称为 Managed Challenge，是一个安全功能，可以用来保护网站免受过度爬取的侵害。Cloudflare 的 Web 应用防火墙（WAF）中的自定义规则允许用户创建特定的规则来评估 incoming 请求。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://developers.cloudflare.com/waf/managed-rules/">Managed Rules · Cloudflare Web Application Firewall (WAF) docs</a></li>
<li><a href="https://rankmath.com/kb/whitelist-rank-math-in-cloudflare/">How to Whitelist Rank Math in Cloudflare » Rank Math</a></li>
<li><a href="https://www.playwire.com/blog/using-cloudflare-to-block-ai-crawlers-setup-and-configuration-guide">Using Cloudflare to Block AI Crawlers: Setup and Configuration Guide</a></li>

</ul>
</details>

**社区讨论**: 该帖子没有引起太多讨论，但解决方案已被一些用户发现有用。

**标签**: `#Cloudflare`, `#CAPTCHA`, `#Custom Rules`, `#Web Application Firewall`

---

<a id="item-22"></a>
## [小红书据称准备月底在港秘密提交 IPO 申请](https://www.bloomberg.com/news/articles/2026-06-15/xiaohongshu-is-said-to-ready-hong-kong-ipo-filing-this-month) ⭐️ 6.0/10

小红书正筹备在 6 月底前向香港交易所秘密提交 IPO 申请 若推进可能成为近年港交所最大上市交易之一，对中国科技业影响重大 公司 2024 年融资时估值约 1700 亿美元，预计 2025 年利润约 300 亿美元

telegram · zaihuapd · Jun 15, 11:03

**背景**: 小红书是中国的一家流行电商平台，常被称为中国版 Instagram。它正在快速增长，并成为中国社交电商市场的重要玩家

**标签**: `#ipo`, `#xiaohongshu`, `#e-commerce`, `#hong-kong-stock-exchange`, `#china-tech`

---

<a id="item-23"></a>
## [华为否认鸿蒙是安卓套壳系统](https://www.ithome.com/0/964/596.htm) ⭐️ 6.0/10

华为高管否认鸿蒙套壳安卓的说法，指出鸿蒙已通过国家安全可靠Ⅱ级评测认证。 这一否认很重要，因为它解决了鸿蒙安全性和与安卓关系的关注问题。 鸿蒙桌面操作系统获得了国家安全可靠Ⅱ级认证，是首个突破Ⅰ级的操作系统。

telegram · zaihuapd · Jun 16, 01:20

**背景**: 鸿蒙是华为开发的中国操作系统，正在为取代安卓在某些市场中的地位而争取关注。国家安全可靠Ⅱ级认证是中国操作系统可信度的一个关键因素。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.cisecurity.org/">CIS Center for Internet Security</a></li>
<li><a href="https://www.nist.gov/cyberframework">Cybersecurity Framework | NIST - National Institute of Standards and Technology</a></li>

</ul>
</details>

**标签**: `#HarmonyOS`, `#Huawei`, `#Android`, `#Operating System`, `#Security Certification`

---

<a id="item-24"></a>
## [蚂蚁集团正在测试 AI 版支付宝，改进用户交互](https://t.me/zaihuapd/41976) ⭐️ 6.0/10

蚂蚁集团正在测试 AI 版支付宝，改进用户交互和智能服务管理 这项发展可能会提高用户体验和支付系统的效率，可能会为 AI 功能的金融服务设定新标准 新版本将允许用户以单击进入原生 AI 界面，并为用户提供更智能的服务和资金管理

telegram · zaihuapd · Jun 16, 03:15

**背景**:  AI 功能的用户交互和智能服务管理在支付系统中越来越重要，能够提供更高效和个性化的体验。 AI 功能的聊天机器人和虚拟助手可以理解自然语言，学习从交互中，根据用户行为和偏好提供个性化的响应。智能服务管理涉及自动化任务，预测问题，优化工作流来提高服务质量和降低成本

<details><summary>参考链接</summary>
<ul>
<li><a href="https://doable.sh/blogs/enhancing-user-engagement-with-ai-powered-agents-for-saas-platforms">Enhancing User Engagement with AI - Powered Agents for... | doable.sh</a></li>
<li><a href="https://medium.com/@offport_34753/elevating-sales-success-the-role-of-user-interaction-in-closing-deals-with-ai-automation-10018e0d3cdb">Elevating Sales Success: The Role of User Interaction in... | Medium</a></li>
<li><a href="https://www.paddle.com/">Paddle - Subscriptions, Payments & Tax Compliance for SaaS...</a></li>

</ul>
</details>

**标签**: `#Alipay`, `#AI`, `#Payment Systems`, `#China Tech`

---

<a id="item-25"></a>
## [Fable AI 模型展示其网络防御能力](https://simonwillison.net/2026/Jun/16/matteo-wong-the-atlantic/#atom-everything) ⭐️ 5.0/10

马特奥·翁（Matteo Wong）分享了一个关于 Fable AI 模型在网络防御方面的故事， cybersecurity 专家凯蒂·穆苏里斯（Katie Moussouris）描述了这一点。 这一见解突出了 Fable AI 模型在网络防御中的潜力，这将对人工智能和网络安全领域产生重大影响。 Fable AI 模型表明其能够识别并修复故意不安全的代码中的安全问题，穆苏里斯（Moussouris）描述了这一点。

rss · Simon Willison · Jun 16, 03:07

**背景**: Fable AI 模型是 Anthropic 开发的 Mythos 级模型，旨在进行自治知识工作和编码。凯蒂·穆苏里斯（Katie Moussouris）是一名网络安全专家和 Luta Security 公司的首席执行官，该公司提供安全战略指导。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.anthropic.com/claude/fable">Claude Fable \ Anthropic</a></li>
<li><a href="https://overchat.ai/models/claude/claude-fable-5">Claude Fable 5: Anthropic's Mythos-Class Model</a></li>
<li><a href="https://openrouter.ai/anthropic/claude-fable-5">Claude Fable 5 - API Pricing & Benchmarks | OpenRouter</a></li>

</ul>
</details>

**标签**: `#AI`, `#Cybersecurity`, `#Fable`, `#Anthropic`

---

<a id="item-26"></a>
## [datasette-agent 0.3a0：添加用户批准功能](https://simonwillison.net/2026/Jun/15/datasette-agent/#atom-everything) ⭐️ 5.0/10

datasette-agent 0.3a0 引入了一个名为 execute_write_sql 的新工具，它在写入数据库之前会询问用户批准。这一功能增强了 datasette agent chat 终端模式以支持批准。 这一更新很重要，因为它为用户在写入数据库时提供了额外的安全性和控制，确保他们意识到并批准任何更改。 execute_write_sql 工具可以对可变数据库执行一系列有序的写 SQL 语句，用户可以为 datasette agent chat CLI 提供纯文本替代品以供显示。

rss · Simon Willison · Jun 15, 17:19

**背景**: datasette-agent 是一个用于探索和发布数据的工具，它使用 SQL 与数据库进行交互。execute_write_sql 工具是 datasette agent chat 终端模式增强功能之一，支持批准。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://datasette.io/">Datasette: An open source multi-tool for exploring and publishing data</a></li>

</ul>
</details>

**标签**: `#datasette`, `#datasette-agent`, `#database`, `#sql`

---

<a id="item-27"></a>
## [Kimi 推出 K2.7 Code 高速模式，编程任务提速 6 倍](https://x.com/i/status/2066467110960959833) ⭐️ 5.0/10

Kimi 发布了开源多模态编程模型 K2.7 Code 的高速版本 K2.7 Code HighSpeed，编程任务速度提升最高约 6 倍。 这个高速模式对需要快速代码生成的开发者来说很重要，但价格是普通版的两倍。 高速模式最高可达 260 tok/s 的短上下文任务和 180 tok/s 的中位数长度输入。

telegram · zaihuapd · Jun 15, 13:43

**背景**: Kimi 的 K2.7 Code 模型是一种多模态编程模型，支持最高 128,000 个令牌的上下文。这款高速版是为了加速代码生成任务而设计的，但价格是普通版的两倍。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://segmentfault.com/a/1190000047731218">人工智能 - 多 模 态 （Multimodal... - SegmentFault 思否</a></li>
<li><a href="https://www.cnblogs.com/lightsong/p/18403642">transformer-> 多 模 态 - lightsong - 博客园</a></li>
<li><a href="https://blog.csdn.net/asfagwffweww/article/details/152463013">课代表带你梳理【RAG 课 程 13&14...</a></li>
<li><a href="https://en.wikipedia.org/wiki/Sandi_Toksvig">Sandi Toksvig</a></li>
<li><a href="https://grokipedia.com/page/Tokens_per_second">Tokens per second</a></li>
<li><a href="https://markaicode.com/benchmarks/open-webui-deepseek-benchmark/">Open WebUI DeepSeek Benchmarks: 42 tok / s on RTX... | Markaicode</a></li>
<li><a href="https://en.wikipedia.org/wiki/Kimi_(chatbot)">Kimi (chatbot) - Wikipedia</a></li>
<li><a href="https://www.kimi.com/code">Kimi Code - Next-Gen AI Code Agent | Automated Programming & CLI</a></li>
<li><a href="https://www.youtube.com/watch?v=Cg9aNrdIzeg">Free Kimi K2.6 + OpenCode = The Ultimate FREE AI Coding Setup...</a></li>

</ul>
</details>

**标签**: `#Kimi`, `#K2.7 Code`, `#High-Speed Mode`, `#AI Models`, `#NLP`

---

<a id="item-28"></a>
## [苹果将统一「登录苹果」与「隐藏邮件」域名](http://private.icloud.com/) ⭐️ 5.0/10

苹果宣布，今年夏天晚些时候，“登录苹果”和 iCloud+“隐藏邮件”将统一使用 private.icloud.com 域名。 这项变化将简化苹果服务使用的电子邮件域名，但开发者需要更新他们的应用程序和网站。 新域名将用于 Sign in with Apple 和 Hide My Email 生成的新电子邮件地址，而现有的地址将继续有效。

telegram · zaihuapd · Jun 16, 02:14

**背景**: Sign in with Apple 是一个功能，允许用户使用他们的 Apple ID 登录第三方应用和网站，而 Hide My Email 是一个功能，生成每个应用或网站用户注册时的唯一电子邮件地址。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://developer.apple.com/news/?id=sus6t6ab">New domain for Sign in with Apple and iCloud + Hide... - Apple Developer</a></li>
<li><a href="https://www.jornalemdestaque.com/tecnologia/faca-login-com-a-apple-e-hide-my-email-para-obter-um-novo-dominio-de-email-compartilhado/590468/">Faça login com a Apple e Hide My Email para obter um novo domínio...</a></li>
<li><a href="https://support.sleepcycle.com/hc/en-us/articles/16317236461852-What-is-the-email-ending-with-privaterelay-appleid-com">What is the email ending with "@ privaterelay . appleid . com "?</a></li>

</ul>
</details>

**标签**: `#Apple`, `#iCloud`, `#Domain Name Change`, `#Software Update`

---

<a id="item-29"></a>
## [火山引擎公布 Seedance2.0 计费](https://t.me/zaihuapd/41977) ⭐️ 5.0/10

火山引擎公布了 Seedance2.0 的价格，一个视频生成模型，估计每秒约 1 元 这个价格更新对于使用 Seedance2.0 的内容创作者来说很重要，因为它为生成视频的成本提供了更清晰的理解 价格模型有两个档次：一个带有视频输入，一个不带，有成本范围从 28 到 46 元每百万令牌

telegram · zaihuapd · Jun 16, 04:02

**背景**: Seedance2.0 是一个由 Higgsfield AI 提供支持的视频生成模型，可以产生高质量的视频具有流动的运动。令牌是 AI 中的基本单位，代表计算资源处理信息的数量

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Token_Binding">Token Binding</a></li>
<li><a href="https://grokipedia.com/page/Meta_tokens_in_AI_image_prompts">Meta tokens in AI image prompts</a></li>
<li><a href="https://blogs.nvidia.com/blog/ai-tokens-explained/">What Are AI Tokens ? The Language and Currency... | NVIDIA Blog</a></li>
<li><a href="https://www.linkedin.com/posts/prisans_just-55-seconds-seedance-20-powered-activity-7426893069809033216-E8zc">Just 55 seconds... Seedance 2.0, powered by Higgsfield AI... The video shows fire-and-ice fantasy scenes set on snowy ground...and everything holds together. Here's what stood out …</a></li>
<li><a href="https://www.mindstudio.ai/blog/sora-vs-seedance-2-video-model-comparison-2026">Sora vs Seedance 2.0: Which AI Video Model Should You Use in 2026? | MindStudio</a></li>
<li><a href="https://www.tiktok.com/@envato/video/7628869705868102928">Seedance 2.0: AI Video Model with Fluid Motion | TikTok</a></li>

</ul>
</details>

**标签**: `#Fire Engine`, `#Seedance2.0`, `#Pricing`, `#AI`, `#Video Generation`

---

<a id="item-30"></a>
## [谷歌地球网页版上线免费飞行模拟器](https://finance.sina.com.cn/tech/digi/2026-06-15/doc-inicmsvf5181034.shtml) ⭐️ 5.0/10

谷歌地球网页版中悄悄加入了“飞行模拟器”模式，免费向所有用户开放。 这项新功能可能会吸引那些正在寻找一种新方式与谷歌地球平台互动的用户。 飞行模拟器模式使用实时生成的 3D 建筑和地景，使其比早期版本更具沉浸感。

telegram · zaihuapd · Jun 16, 05:18

**背景**: 谷歌地球已经存在了十几年，网页版也已经有了一段时间了。飞行模拟器模式最初是 PC 客户端中的一个隐藏功能，但现在已经可以直接在浏览器中使用。这项功能使用 WebGL 技术来实时渲染 3D 图形。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.appinn.com/3d-scanner-app-for-ipad/">3 d Scanner App™ - 利用 iPad Pro LIDAR... | 小众软件</a></li>
<li><a href="https://segmentfault.com/a/1190000042928481">javascript... - SegmentFault 思否</a></li>

</ul>
</details>

**社区讨论**: 遗憾的是，没有任何评论可供参考。

**标签**: `#Google Earth`, `#Flight Simulator`, `#Web Development`

---