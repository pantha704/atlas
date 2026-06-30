---
layout: default
title: "Horizon Summary: 2026-06-30 (ZH)"
description: "From 30 items, 20 important content pieces were selected"
date: 2026-06-30
lang: zh
---

> From 30 items, 20 important content pieces were selected

---

1. [Ornith-1.0: 自我支撑的 LLM 用于编码](#item-1) ⭐️ 9.0/10
2. [Qwen 3.6 27B 本地开发的局限性](#item-2) ⭐️ 8.0/10
3. [.self: 一种新的顶级域名，专为自托管服务](#item-3) ⭐️ 8.0/10
4. [美国最高法院裁定政府须凭搜查令获取手机位置数据](#item-4) ⭐️ 8.0/10
5. [韩国计划投资 1 万亿美元扩大内存芯片生产和人形机器人开发](#item-5) ⭐️ 8.0/10
6. [WATaBoy：将游戏机指令编译为 WASM，超越了本机解释器](#item-6) ⭐️ 8.0/10
7. [CUDA 内核执行机制解析](#item-7) ⭐️ 8.0/10
8. [马克斯·普朗克两篇论文疑遭算法误判，被期刊当成“违规文章”删除](#item-8) ⭐️ 8.0/10
9. [长鑫存储与腾讯签署价值近 200 亿元人民币的长期 DRAM 内存芯片供应协议](#item-9) ⭐️ 8.0/10
10. [特斯拉推送 FSD v14 Lite，HW3 车型获 HW4 级智驾与自动泊车能力](#item-10) ⭐️ 8.0/10
11. [vLLM 项目发布 v0.24.0，带来模型改进](#item-11) ⭐️ 7.0/10
12. [罗克特实验室收购爱立信，在历史性的交易中](#item-12) ⭐️ 7.0/10
13. [调查显示美国人对 AI 客服的不满正在加剧](#item-13) ⭐️ 7.0/10
14. [HTML 表格提取器工具发布](#item-14) ⭐️ 6.0/10
15. [SSH 图形外壳方案引发安全问题](#item-15) ⭐️ 5.0/10
16. [使用 AppleScript 计算 Safari 标签数量](#item-16) ⭐️ 5.0/10
17. [LINE 应用程序将于 8 月适配 iOS 26：部分主题菜单图标暂时恢复默认样式](#item-17) ⭐️ 5.0/10
18. [OpenAI Codex 额度异常消耗并重置上限](#item-18) ⭐️ 5.0/10
19. [驾驶手动挡汽车可激活前额叶皮层，延缓大脑衰老](#item-19) ⭐️ 5.0/10
20. [OpenAI 与 Work Louder 合作推出 Codex 专属宏键盘](#item-20) ⭐️ 5.0/10

---

<a id="item-1"></a>
## [Ornith-1.0: 自我支撑的 LLM 用于编码](https://simonwillison.net/2026/Jun/29/ornith/#atom-everything) ⭐️ 9.0/10

DeepReinforce 发布了 Ornith-1.0，一个自我支撑的 LLM 模型用于编码，具有与可比大小的开源模型相似的最佳性能 此发布意义重大，因为它展示了一个新的 LLM 开发方法，允许模型学习并改进自己，并在编码基准测试中实现了最佳性能 Ornith-1.0 基于预训练的 Gemma 4 和 Qwen 3.5，实现了编码基准测试中的最佳性能，具有 9B Dense、31B Dense、35B MoE 和 397B MoE 等变体

rss · Simon Willison · Jun 29, 16:17

**背景**: Ornith-1.0 是一个自我支撑的 LLM 模型，它可以学习生成解决方案的回滚和特定任务的架构，从而使其能够发现更好的搜索轨迹并生成更高质量的解决方案。自我支撑是 Ornith-1.0 背后的关键创新，使得模型可以学习和改进自己。Gemma 4 和 Qwen 3.5 是开源的 LLM 模型，用于 Ornith-1.0 的基础

<details><summary>参考链接</summary>
<ul>
<li><a href="https://deep-reinforce.com/ornith_1_0.html">Ornith-1.0: Self-Scaffolding LLMs for Agentic Coding | DeepReinforce Blog | Jun. 2026</a></li>
<li><a href="https://medium.com/data-science-in-your-pocket/ornith-1-0-self-learning-llm-for-coding-318c9a830bfc">Ornith 1.0 : Self Learning LLM for Coding | by Mehul Gupta | Data Science in Your Pocket | Jun, 2026 | Medium</a></li>
<li><a href="https://www.mindstudio.ai/blog/self-scaffolding-ai-models-ornith-1-0">Self-Scaffolding AI Models: How Ornith 1.0 Writes Its Own Agent Harness | MindStudio</a></li>

</ul>
</details>

**社区讨论**: 一些用户对 Ornith-1.0 的表现持有异议，某些人认为它在某些任务中表现不佳，而其他人则对模型生成编码问题的创造性解决方案的能力表示赞赏

**标签**: `#LLM`, `#DeepLearning`, `#NaturalLanguageProcessing`, `#OpenSource`, `#ModelRelease`

---

<a id="item-2"></a>
## [Qwen 3.6 27B 本地开发的局限性](https://quesma.com/blog/qwen-36-is-awesome/) ⭐️ 8.0/10

Qwen 3.6 27B 模型不适合严肃的本地开发，因为它需要大量的资源，需要一个强大的机器才能高效运行。 这个讨论强调了在本地运行大型语言模型如 Qwen 3.6 27B 的实际局限性，使得考虑替代方案如云服务变得至关重要。 该模型的性能受到机器的配置影响，MacBook Pro M5 128GB RAM 不足以处理繁重的任务。

hackernews · stared · Jun 29, 17:05 · [社区讨论](https://news.ycombinator.com/item?id=48721903)

**背景**: Qwen 3.6 27B 是一个大型语言模型，需要大量的计算资源才能高效运行。使用这种模型进行本地开发会面临挑战，因为需要强大的机器。

**社区讨论**: 社区成员分享了他们对 Qwen 3.6 27B 在本地运行的可行性的经验和观点，有些人建议使用云服务作为替代方案。

**标签**: `#Qwen`, `#LLMs`, `#Local Development`, `#MacBook Pro`, `#Machine Learning`

---

<a id="item-3"></a>
## [.self: 一种新的顶级域名，专为自托管服务](https://hccf.onmy.cloud/2026/06/21/reclaiming-our-digital-selves-hccfs-vision-for-a-human-centered-top-level-domain/) ⭐️ 8.0/10

.self 是一种新的顶级域名，专为自托管服务，提供给个人一个单独的域名。 这种新的顶级域名有潜力简化自托管和在线身份管理，但也引发了关于抢注和域名管理的担忧。 .self 域名旨在为个人提供一个单独的域名，不允许停车、抢注或重新出售域名，并且有一个挑战未激活域名的机制。

hackernews · HumanCCF · Jun 29, 19:49 · [社区讨论](https://news.ycombinator.com/item?id=48724230)

**背景**: 自托管涉及使用自己的私有服务器运行和维护一个网站或在线服务。顶级域名由特定的组织管理，如 ICANN，它运营着 Internet Assigned Numbers Authority (IANA)。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Top-level_domain">Top-level domain</a></li>
<li><a href="https://grokipedia.com/page/Self-hosting_network">Self-hosting (network)</a></li>
<li><a href="https://www.linkedin.com/posts/dragos-stancu_github-awesome-selfhostedawesome-selfhosted-activity-7443651253349470208-HiqE">Self - hosting alternatives to SaaS providers | Dragos Stancu... | LinkedIn</a></li>

</ul>
</details>

**社区讨论**: 社区成员提出了关于抢注、域名管理和不收取注册费收入的顶级域名运营成本的担忧。一些人提出了替代方案，如微软的 Vega 项目。

**标签**: `#self-hosting`, `#top-level-domain`, `#identity-management`, `#online-privacy`, `#internet-governance`

---

<a id="item-4"></a>
## [美国最高法院裁定政府须凭搜查令获取手机位置数据](https://www.theguardian.com/us-news/2026/jun/29/supreme-court-geofence-warrants-case-decision) ⭐️ 8.0/10

美国最高法院裁定政府须凭搜查令获取手机位置数据，限制执法部门获取位置数据的能力。这一裁决是在案件中发生的，案件中警方使用了地图围栏令追踪了一名武装银行劫匪。 这一裁决对隐私和执法部门有重大影响，因为它确立了地图围栏令须凭搜查令获取。这种裁决将对隐私权和执法部门实践产生广泛影响。 法院认为，地图围栏令获取的敏感数据属于第四修正案的搜索，提供了个人有合理隐私期望，即使他们可能没有直接被目标。

hackernews · cdrnsf · Jun 29, 15:54 · [社区讨论](https://news.ycombinator.com/item?id=48720924)

**背景**: 地图围栏令是一种搜索令，允许执法部门搜索数据库以查找特定地理围栏区域内的所有活动移动设备。这种令曾经用于从谷歌的 Sensorvault 数据库中获取信息。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.theguardian.com/us-news/2026/jun/29/supreme-court-geofence-warrants-case-decision">US supreme court rules geofence warrants require constitutional privacy ...</a></li>
<li><a href="https://en.wikipedia.org/wiki/Geofence_warrant">Geofence warrant</a></li>
<li><a href="https://www.scotusblog.com/2026/06/court-rules-that-law-enforcements-use-of-geofence-warrant-was-a-search/">Court rules that law enforcement's use of "geofence warrant" was a ...</a></li>

</ul>
</details>

**社区讨论**: 黑客新闻社区讨论仍在进行中，许多用户对这一裁决的影响及其对执法部门实践的潜在影响发表了评论。

**标签**: `#privacy`, `#law-enforcement`, `#supreme-court`, `#geofence-warrants`, `#constitutional-protections`

---

<a id="item-5"></a>
## [韩国计划投资 1 万亿美元扩大内存芯片生产和人形机器人开发](https://arstechnica.com/ai/2026/06/south-korea-to-spend-1t-on-more-memory-chip-production-and-humanoid-robots/) ⭐️ 8.0/10

韩国计划投资 1 万亿美元扩大内存芯片生产和开发人形机器人。 这项投资可能会对全球内存芯片市场和机器人行业产生重大影响，可能在多个领域应用。 投资将重点扩大内存芯片生产和开发具有先进人工智能能力的人形机器人。

hackernews · jnord · Jun 29, 22:21 · [社区讨论](https://news.ycombinator.com/item?id=48726102)

**背景**: 人形机器人是模仿人类身体的设计，应用于医疗保健、制造业和服务业等领域。内存芯片是电子设备的关键组成部分，对全球半导体市场产生了重大影响。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Humanoid_robot">Humanoid robot</a></li>
<li><a href="https://grokipedia.com/page/Motor_control_integrated_circuits_for_humanoid_robots">Motor control integrated circuits for humanoid robots</a></li>
<li><a href="https://humanoidroboticstechnology.com/articles/top-12-humanoid-robots-of-2026/">Top 12 Humanoid Robots of 2026 - Humanoid Robotics Technology</a></li>
<li><a href="https://semiconductorinsight.com/report/memory-chip-market/">Memory Chip Market 2025</a></li>
<li><a href="https://www.imarcgroup.com/memory-chip-market">Memory Chip Market Size, Share & Trends Forecast to 2034</a></li>
<li><a href="https://mundobytes.com/en/Who-makes-RAM-memory-chips/">RAM Chip Manufacturers of Major Brands (2024)</a></li>

</ul>
</details>

**社区讨论**: 社区成员对人形机器人投资表示怀疑，质疑其实际应用和价值。一些人还 wondered 为什么韩国要投资人形机器人，而不是其他形式的机器人可能更有效。

**标签**: `#AI`, `#Robotics`, `#Semiconductors`, `#South Korea`, `#Investment`

---

<a id="item-6"></a>
## [WATaBoy：将游戏机指令编译为 WASM，超越了本机解释器](https://humphri.es/blog/WATaBoy/) ⭐️ 8.0/10

WATaBoy 项目展示了一个将游戏机指令编译为 WebAssembly 的 JIT 编译器，超越了本机解释器的性能。 这项成就表明了 WebAssembly 在游戏开发中的潜力，并展示了 JIT 编译的新方法。 该 JIT 编译器使用 WebAssembly 作为中间表示，允许动态编译和优化。

hackernews · energeticbark · Jun 29, 15:02 · [社区讨论](https://news.ycombinator.com/item?id=48720190)

**背景**: JIT 编译是一种在运行时编译代码的技术，通过避免解释器的开销来提高性能。WebAssembly 是一种二进制格式，允许将代码编译为本机机器码，从而在各种平台上实现高效执行。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/JIT_compilation">JIT compilation</a></li>
<li><a href="https://www.ibm.com/docs/en/sdk-java-technology/8?topic=reference-jit-compiler">The JIT compiler - IBM Documentation</a></li>
<li><a href="https://moldstud.com/articles/p-essential-compile-time-tools-and-techniques-for-webassembly-developers-a-comprehensive-analysis">Compile Time Tools and Techniques for WebAssembly Developers | MoldStud</a></li>

</ul>
</details>

**社区讨论**: 社区成员对该项目的成就表示赞赏，某些人注意到 WebAssembly 在游戏开发中的潜力，而其他人讨论了 JIT 编译的好处。

**标签**: `#JIT compilation`, `#WebAssembly`, `#Game Boy`, `#compilation techniques`

---

<a id="item-7"></a>
## [CUDA 内核执行机制解析](https://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/) ⭐️ 8.0/10

CUDA 内核执行机制的详细解释，包括 warp、信号量和 QMD 格式。 该文章提供了 CUDA 内核执行机制的宝贵见解，帮助开发者优化他们的代码并了解硬件底层。 该文章涵盖了 CUDA 的隐式同步、 warp 合格性和 QMD 格式，提供了内核执行的全面理解。

hackernews · mezark · Jun 29, 13:11 · [社区讨论](https://news.ycombinator.com/item?id=48718863)

**背景**: CUDA 是 NVIDIA 开发的一款并行计算平台和编程模型。它允许开发者利用 GPU 的计算能力进行通用计算。CUDA 内核是一种函数，它在 GPU 上运行，并由数千到数百万个线程并行执行。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://modal.com/gpu-glossary/device-software/kernel">What is a CUDA Kernel ? | GPU Glossary</a></li>
<li><a href="https://llm-stats.com/blog/research/what-is-a-cuda-kernel">What Is a CUDA Kernel ? A Visual Explainer | LLM Stats</a></li>

</ul>
</details>

**社区讨论**: 社区讨论强调了理解 CUDA 内核执行机制的重要性和隐式同步的好处。一些评论者提到了硬件的可用开源文档和优化内核执行的开源库的潜力。

**标签**: `#CUDA`, `#GPU`, `#Parallel Computing`, `#HPC`, `#Computer Architecture`

---

<a id="item-8"></a>
## [马克斯·普朗克两篇论文疑遭算法误判，被期刊当成“违规文章”删除](https://arstechnica.com/science/2026/06/why-did-this-journal-retract-two-1940s-papers-by-max-planck/) ⭐️ 8.0/10

马克斯·普朗克两篇发表于 20 世纪 40 年代的论文，近日被期刊《自然科学》撤稿并彻底删除。 这次事件凸显了算法错误在学术出版中的潜在风险以及人工复核的重要性。 期刊现任主编表示，自己此前并不知情，推测可能是自动检测系统误判，相关处理应当纠正。

telegram · zaihuapd · Jun 29, 08:46

**背景**: 学术出版已经开始采用机器学习和自动检测系统来提高效率并减少人为错误。但是，这些系统也可能会出现错误，尤其是在处理历史或依赖于背景的内容时。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.mdpi.com/journal/algorithms/special_issues/3817362QCF">Algorithmic Bias and Fairness in Academic Publishing: Detection ... - MDPI</a></li>
<li><a href="https://www.sciencedirect.com/science/article/abs/pii/S106037432600055X">"When the Editor Detected AI — But the 'AI' Was Me": Algorithmic ...</a></li>
<li><a href="https://publicationethics.org/topic-discussions/emerging-ai-dilemmas-scholarly-publishing">Emerging AI dilemmas in scholarly publishing</a></li>

</ul>
</details>

**社区讨论**: 社区表达了对算法错误在学术出版中的潜在后果以及人工复核的必要性的担忧。

**标签**: `#academic-publishing`, `#algorithmic-errors`, `#scientific-history`, `#research-methodology`, `#machine-learning`

---

<a id="item-9"></a>
## [长鑫存储与腾讯签署价值近 200 亿元人民币的长期 DRAM 内存芯片供应协议](https://www.reuters.com/world/china/chinas-cxmt-wins-3-billion-memory-supply-deal-with-tencent-sources-say-2026-06-29/) ⭐️ 8.0/10

长鑫存储与腾讯签署一项价值超 200 亿元人民币的长期 DRAM 内存芯片供应协议，覆盖数年服务器供货。 这项协议表明 DRAM 市场正在发生重大变化，可能对全球供应链产生影响。 这项协议覆盖数年服务器供货，据称价值超过 29.4 亿美元。

telegram · zaihuapd · Jun 29, 09:31

**背景**: 长鑫存储是一家专注于 DRAM 内存芯片生产的中国半导体集成电路制造商。该公司近年来在扩大产能和生产能力方面取得了进展。DRAM 市场高度集中，三家公司控制了大约 95% 的供应。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/CXMT">CXMT</a></li>
<li><a href="https://www.mheducation.com/highered/blog/2026/03/how-the-ram-shortage-is-reshaping-the-global-supply-chain.html">How the RAM Shortage Is Reshaping the Global Supply Chain</a></li>

</ul>
</details>

**标签**: `#memory-chips`, `#DRAM`, `#semiconductor-industry`, `#tech-deals`, `#China-tech`

---

<a id="item-10"></a>
## [特斯拉推送 FSD v14 Lite，HW3 车型获 HW4 级智驾与自动泊车能力](https://x.com/Tesla_AI/status/2071592820889260101) ⭐️ 8.0/10

特斯拉发布 FSD v14 Lite，将 HW4 版 V14 的智能提炼至 HW3 硬件，使 HW3 车辆可直接学习 HW4 的处理方式，从而解锁强化学习与离线模型等此前 HW4 独占的能力。 此更新意义重大，因为它解锁了 HW3 车辆的 HW4 级功能，改善了其自动驾驶能力，并引入了新的停车和导航功能。 此更新包括改进的导航处理、各种场景下的主动和被动响应增强，以及减少错误减速和优化转向平顺性的表现。

telegram · zaihuapd · Jun 30, 02:26

**背景**: FSD v14 Lite 将 AI4 的 V14 系列驾驶行为提炼至 AI3 的摄像头和计算配置，使 HW3 车辆能够访问 HW4 级功能。HW4 摄像头相比 HW3 摄像头有着改进的视频质量。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.notateslaapp.com/news/4369/tesla-launches-fsd-v14-lite-first-impressions">Tesla Launches FSD V14-Lite: First Impressions - Not a Tesla App</a></li>
<li><a href="https://electrek.co/2026/06/29/tesla-fsd-v14-lite-hw3-rollout/">Tesla starts FSD v14 'Lite' rollout to HW3 cars | Electrek</a></li>
<li><a href="https://www.reddit.com/r/teslamotors/comments/1uikt6m/fsd_v14_lite_hw3_released/">r/teslamotors on Reddit: FSD v14 Lite HW3 released</a></li>

</ul>
</details>

**社区讨论**: 用户普遍对此更新感到兴奋，但有一些用户在询问更多关于此更新的细节以及如何影响他们车辆的信息。

**标签**: `#Tesla`, `#Autonomous Driving`, `#FSD`, `#AI`

---

<a id="item-11"></a>
## [vLLM 项目发布 v0.24.0，带来模型改进](https://github.com/vllm-project/vllm/releases/tag/v0.24.0) ⭐️ 7.0/10

vLLM 项目发布 v0.24.0，共有 571 次提交和 MiniMax-M3 和 DeepSeek-V4 模型的改进。 此发布对于 vLLM 社区来说很重要，因为它带来了多个模型的改进和优化，表明了社区的高价值。 值得注意的改进包括对 MiniMax-M3 和 DeepSeek-V4 模型的支持，以及对模型运行器 V2 和流式解析引擎的优化。

github · khluu · Jun 29, 19:41

**背景**: vLLM 项目是一个开源项目，旨在为大语言模型提供统一的框架。近期，该项目发展迅速，出现了多个模型的改进和优化。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://github.com/MiniMax-AI/MSA">GitHub - MiniMax-AI/MSA</a></li>
<li><a href="https://docs.modular.com/max/api/kernels/builtin_kernels/msa/">msa - Modular</a></li>

</ul>
</details>

**社区讨论**: 社区讨论是中等水平的，有些技术细节被提供，但缺乏整体分析或评论。

**标签**: `#vLLM`, `#DeepLearning`, `#ModelOptimization`, `#MachineLearning`

---

<a id="item-12"></a>
## [罗克特实验室收购爱立信，在历史性的交易中](https://investors.rocketlabcorp.com/news-releases/news-release-details/rocket-lab-acquire-iridium-historic-deal-creating-fully) ⭐️ 7.0/10

罗克特实验室收购了爱立信，获得了其频谱和盈利性的卫星业务。 此次收购在卫星行业具有重要意义，因为它使罗克特实验室能够扩大其能力并确保稳定的收入来源。 此次收购包括爱立信的频谱和卫星星座，这将使罗克特实验室能够提供各种服务，包括语音和数据通信。

hackernews · everfrustrated · Jun 29, 14:09 · [社区讨论](https://news.ycombinator.com/item?id=48719485)

**背景**: 爱立信的卫星星座提供全球覆盖，共有 66 颗低轨道卫星。该星座用于语音和数据通信，是卫星行业的一个重要玩家。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Orbit_spectrum">Orbit spectrum - Wikipedia</a></li>
<li><a href="https://www.esa.int/Applications/Connectivity_and_Secure_Communications/Satellite_frequency_bands">ESA - Satellite frequency bands</a></li>
<li><a href="https://en.wikipedia.org/wiki/Iridium_satellite_constellation">Iridium satellite constellation</a></li>

</ul>
</details>

**社区讨论**: 一些社区成员担心增加的卫星发射对空间垃圾的影响，而其他人认为此次收购是为了确保稳定的收入来源而采取的战略措施。

**标签**: `#Rocket Lab`, `#Iridium`, `#Satellite Industry`, `#Mergers and Acquisitions`, `#Space Technology`

---

<a id="item-13"></a>
## [调查显示美国人对 AI 客服的不满正在加剧](https://cybernews.com/ai-news/americans-war-on-ai-agents-customer-service/) ⭐️ 7.0/10

一项调查显示，超过四成美国人会对着手机大喊“转人工”，部分用户会向聊天机器人爆粗口 这种对 AI 客服的不满直接影响了用户的决策，34.9% 的受访者因一次差劲的客服互动更换品牌，44.1% 当场取消订阅 调查显示，超过半数用户（55.5%）表示，若自动系统在三分钟内无法解决问题就会放弃，18.1% 的人甚至撑不到一分钟

telegram · zaihuapd · Jun 29, 11:32

**背景**: Parloa 是一家专门致力于客服 AI 代理和联系中心自动化的公司，调查是为了了解消费者对 AI 客服的不满

**社区讨论**: Unfortunately, there are no comments available for this article.

**标签**: `#AI`, `#Customer Service`, `#User Experience`, `#Automation`, `#Survey Results`

---

<a id="item-14"></a>
## [HTML 表格提取器工具发布](https://simonwillison.net/2026/Jun/29/html-table-extractor/#atom-everything) ⭐️ 6.0/10

Simon Willison 发布了一个基于 Web 的工具，用于提取和转换 HTML 表格，包括 HTML、Markdown、CSV、TSV 和 JSON 等格式。 这个工具对于提取和转换 HTML 表格非常有用，可以应用于各种数据处理任务。 这个工具接受浏览器中的富文本粘贴，并支持转换为多个格式，包括 CSV、TSV 和 JSON。

rss · Simon Willison · Jun 29, 23:38

**背景**: HTML 表格在 Web 开发和数据处理任务中非常常用。这个工具提供了一种方便的方式来提取和转换 HTML 表格为各种格式。

**标签**: `#HTML`, `#Table Extraction`, `#Data Processing`, `#Web Development`, `#Tools`

---

<a id="item-15"></a>
## [SSH 图形外壳方案引发安全问题](https://probablymarcus.com/blocks/2026/06/28/native-graphical-shell-for-SSH.html) ⭐️ 5.0/10

马库斯·刘易斯(Marcus Lewis)提出了一个 SSH 图形外壳的方案，旨在为 Unix 应用程序提供一个 web-native 界面。然而，社区讨论中提出了潜在的安全问题和对该方案的新颖性质疑 该图形外壳方案可能会影响用户与 Unix 应用程序的交互方式，但安全问题和缺乏新颖性可能会限制其采用 该图形外壳方案使用 Outer Shell，一个开源的 Outer Loop 概念的实现。然而，社区讨论中提出了关于暴露 Unix 应用程序给 web 的安全性问题

hackernews · mrcslws · Jun 29, 15:42 · [社区讨论](https://news.ycombinator.com/item?id=48720758)

**背景**: SSH(安全外壳)是一种用于安全远程访问 Unix-like 系统的协议。一个 SSH 图形外壳将允许用户使用 web-native 界面远程交互 Unix 应用程序

<details><summary>参考链接</summary>
<ul>
<li><a href="https://www.reddit.com/r/gnome/comments/w9i76q/guide_creating_native_applications_for_webapps_on/">r/gnome on Reddit: [GUIDE] Creating native applications for web-apps on Linux</a></li>
<li><a href="https://www.infoworld.com/article/4045998/native-ui-vs-web-ui-how-to-choose.html">Native UI vs. web UI: How to choose | InfoWorld</a></li>
<li><a href="https://www.baeldung.com/linux/forward-x-over-ssh">Forward X Over SSH to Run Programs Remotely | Baeldung on Linux</a></li>

</ul>
</details>

**社区讨论**: 社区讨论是多元的，有些用户质疑了该方案的新颖性，而其他人则提出了安全问题

**标签**: `#SSH`, `#Web Development`, `#Graphical Shell`, `#Unix`, `#Security`

---

<a id="item-16"></a>
## [使用 AppleScript 计算 Safari 标签数量](https://simonwillison.net/2026/Jun/29/safari-tab-count/#atom-everything) ⭐️ 5.0/10

使用 AppleScript 可以轻松计算 Safari 打开的标签数量。命令是 'osascript -e 'tell application "Safari" to count tabs of every window' '。 这个技巧对于需要快速检查 Safari 打开标签数量的 Mac 用户很有用，尤其是那些打开了大量标签的用户。 命令使用 AppleScript 中的 'tell application' 命令来目标 Safari 并计算其标签。结果显示在终端。

rss · Simon Willison · Jun 29, 18:36

**背景**: AppleScript 是苹果开发的脚本语言，允许用户自动化任务并与其他应用程序交互。 'osascript' 命令用于从终端执行 AppleScript 命令。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/AppleScript">AppleScript - Wikipedia</a></li>
<li><a href="https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html">Introduction to AppleScript Language Guide</a></li>
<li><a href="https://forrestcli.com/tools/osascript">Important commands for the CLI tool " osascript " | Forrest</a></li>

</ul>
</details>

**标签**: `#safari`, `#applescript`, `#til`, `#macos`, `#productivity`

---

<a id="item-17"></a>
## [LINE 应用程序将于 8 月适配 iOS 26：部分主题菜单图标暂时恢复默认样式](https://store.line.me/notice/100026633/) ⭐️ 5.0/10

LINE 将于 8 月更新其应用程序以适配 iOS 26，部分主题菜单图标暂时恢复默认样式。 此更新对于使用 LINE 应用程序的用户来说很重要，他们将能够使用 iOS 26，但可能会经历一些暂时的设计变化。 此更新仅影响运行 iOS 26 且 LINE 版本号不低于 26.12 的用户，更新将逐步推送。

telegram · zaihuapd · Jun 29, 12:16

**背景**: iOS 26 是苹果 iOS 操作系统的第十九个主要版本，于 2025 年世界开发者大会 (WWDC) 公布。它引入了液态玻璃设计语言和各种功能，例如增强版登机牌和 Apple Intelligence 更新。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/IOS_26">IOS 26</a></li>
<li><a href="https://www.klaviyo.com/blog/ios-26">iOS 26 Explained: SMS, RCS & Inbox Filtering – Klaviyo - Klaviyo</a></li>

</ul>
</details>

**标签**: `#LINE`, `#iOS 26`, `#Mobile App Updates`, `#Software Updates`, `#Design Changes`

---

<a id="item-18"></a>
## [OpenAI Codex 额度异常消耗并重置上限](https://www.ithome.com/0/970/200.htm) ⭐️ 5.0/10

OpenAI 正调查 Codex 用户额度异常快速消耗问题，并已重置所有用户的额度上限。状态页面显示，部分用户的 Codex 额度“消耗速度超出预期”，根源是平台防滥用、反欺诈风控系统错误地对部分账户限流。 这次事件强调了在 AI 服务中，强大的防滥用系统的重要性，确保公平的使用和防止潜在的用户操纵。 防滥用系统错误地对部分账户限流，导致 Codex 额度异常快速消耗。OpenAI 已重置所有用户的额度上限。

telegram · zaihuapd · Jun 29, 14:29

**背景**: OpenAI 的 Codex 是一个强大的编程工具，具有使用限制以防止滥用。防滥用系统对于 AI 服务来说至关重要，可以检测并防止欺诈活动。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://research.google/research-areas/anti-abuse/">Anti abuse</a></li>
<li><a href="https://apidog.com/blog/codex-usage-limits/">Is There a Quota or Rate Limit for Codex Usage ?</a></li>

</ul>
</details>

**标签**: `#OpenAI`, `#Codex`, `#AI`, `#Limitation`, `#ServiceUpdate`

---

<a id="item-19"></a>
## [驾驶手动挡汽车可激活前额叶皮层，延缓大脑衰老](https://chejiahao.autohome.com.cn/info/25829480?isfrom=m) ⭐️ 5.0/10

研究发现，驾驶手动挡汽车能激活前额叶皮层，有助于保持记忆、注意力和决策等认知功能。 这一发现可能对保持认知功能和延缓大脑衰老在老年人群有重要意义。 研究发现，手动挡驾驶可以刺激前额叶皮层，这一区域负责执行功能，如计划和决策等。

telegram · zaihuapd · Jun 29, 16:21

**背景**: 前额叶皮层是大脑中负责执行功能的区域，如计划、决策和工作记忆等。它还参与保持认知功能和延缓大脑衰老。手动挡驾驶需要协调和控制，这可能会刺激前额叶皮层。

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Prefrontal_cortex">Prefrontal cortex</a></li>
<li><a href="https://grokipedia.com/page/Prefrontal_cortex">Prefrontal cortex</a></li>
<li><a href="https://my.clevelandclinic.org/health/body/prefrontal-cortex">Prefrontal Cortex: What It Is, Function, Location & Damage</a></li>

</ul>
</details>

**社区讨论**: 讨论质量较低，由于存在纠正通知和缺乏深入的评论。

**标签**: `#cognitive-function`, `#brain-aging`, `#manual-transmission`, `#driving`

---

<a id="item-20"></a>
## [OpenAI 与 Work Louder 合作推出 Codex 专属宏键盘](https://www.theverge.com/ai-artificial-intelligence/959174/openai-codex-hardware-work-louder) ⭐️ 5.0/10

OpenAI 和 Work Louder 将于 7 月 15 日发布 Codex 专属宏键盘 这次合作可能会提高 Codex 用户的使用体验，但其对更广泛的 AI 生态系统的影响尚不明确 这款定制键盘旨在与 Codex 无缝集成，配备 13 个机械开关、触摸传感器和旋转编码器

telegram · zaihuapd · Jun 30, 02:48

**背景**: Codex 是 OpenAI 的编码合作伙伴，旨在加速真正的工程工作，而 Work Louder 是一家机械键盘制造商，知名于其 Creator Micro 2 键盘

<details><summary>参考链接</summary>
<ul>
<li><a href="https://en.wikipedia.org/wiki/Codex">Codex</a></li>
<li><a href="https://worklouder.cc/creator-micro-2">Creator Micro 2</a></li>

</ul>
</details>

**标签**: `#OpenAI`, `#Codex`, `#Work Louder`, `#Keyboard`, `#AI`

---