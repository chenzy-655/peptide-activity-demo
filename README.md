# Peptide Atlas · 多肽活性分析演示

**网站 / Website:** https://chenzy-655.github.io/peptide-activity-demo/

提供中文与English切换、七种研究方向、逐肽理化特征与规则依据，以及筛选结果CSV下载。
This bilingual explorer presents seven research directions, peptide descriptors, feature-based explanations and filtered CSV exports.

## 数据与方法 / Data and methods

12条人工指定的示例序列。描述符与0–100规则优先级由本地程序预计算；分数用于候选排序，活性效应由对应实验评价。完整来源指纹随示例JSON提供。
The 12 illustrative sequences have precomputed molecular descriptors and rule-based priorities. Scores organize research candidates; corresponding experiments establish activity effects. Source fingerprints accompany the example JSON.

本仓库包含静态界面及演示数据；核心Python实现、模型权重和实验数据保留私有。
This repository contains the static interface and example data. The core Python implementation, model weights and experimental data remain private.

## 校徽 / Emblem

桂林医科大学校徽取自学校官网“校徽校旗”，保留原图比例。来源与SHA见assets/logo-provenance.json。本网站是研究项目演示。
The Guilin Medical University emblem comes from the official university emblem page and retains its original proportions. Provenance is recorded in assets/logo-provenance.json. This website is a research-project demonstration.

## 发布 / Publication

GitHub Pages从默认分支根目录发布，.nojekyll启用普通静态文件服务。后续更新网页后自动发布。
GitHub Pages serves static files from the root of the default branch. Site updates publish automatically after a commit.
