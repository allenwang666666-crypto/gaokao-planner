import type { UserProfile } from "@/lib/types";

/**
 * 仅用于结果页「免费可见摘要」的展示文案，不参与推荐算法。
 * 分数与批次对应为示意区间，正式填报以当年省控线为准。
 */
export function getCurrentLevelSummary(profile: UserProfile): string {
  const { score, rank } = profile;
  const hasScore = score > 0;
  const hasRank = rank > 0;

  if (!hasScore && !hasRank) {
    return "请先完成信息采集并填写有效高考/模考分数或位次，以便判断大致批次区间。";
  }

  if (hasScore) {
    if (score >= 530) {
      return "当前大致处于：一本批次可重点布局区间（示意，以当年安徽省控线为准）。";
    }
    if (score >= 470) {
      return "当前大致处于：二本 / 本科批次主战场（示意，以当年安徽省控线为准）。";
    }
    return "当前分数接近或低于近年本科线示意区间，建议结合当年批次线与位次复核，并加强保底志愿。";
  }

  // 仅有位次时的示意分层（不参与推荐算法）
  if (rank <= 3500) {
    return "按当前位次示意：处于较前列，可重点布局高层次院校与热门专业方向（示意，以当年投档位次为准）。";
  }
  if (rank <= 12000) {
    return "按当前位次示意：处于中上位次区间，一本与优质本科批次可组合布局（示意，以当年投档位次为准）。";
  }
  if (rank <= 35000) {
    return "按当前位次示意：处于本科批次主竞争区间，建议冲稳保拉开梯度（示意，以当年投档位次为准）。";
  }
  return "按当前位次示意：位次相对偏后，建议以稳妥志愿为主并加强保底（示意，以当年投档位次为准）。";
}

export function getSlideRiskSummary(profile: UserProfile): string {
  const { score, rank } = profile;
  const hasScore = score > 0;
  const hasRank = rank > 0;

  if (!hasScore && !hasRank) {
    return "风险提示：缺少分数与位次时，无法评估滑档风险，请先完善画像。";
  }

  if (hasRank && rank > 40000) {
    return "滑档风险提示：位次相对偏后，若冲高志愿过多，建议拉长保底梯度并核对往年投档最低位次。";
  }
  if (hasScore && score >= 500 && score <= 535) {
    return "滑档风险提示：分数处于临界带，院校与专业线波动时易出现退档/滑档，建议「冲稳保」拉开层次。";
  }
  if (!hasScore && hasRank) {
    return "滑档风险提示：仅依据位次示意，志愿填报仍需结合当年分数线与专业热度；建议保留足够稳妥志愿。";
  }
  return "滑档风险提示：整体风险可控范围内仍需关注专业线、计划数变化；务必保留足够稳妥志愿。";
}
