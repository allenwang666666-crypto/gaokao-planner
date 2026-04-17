"use client";

import { Button } from "@/components/ui/button";
import { RecommendationItem } from "@/lib/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportButtons({ items }: { items: RecommendationItem[] }) {
  const rows = items.map((i, idx) => ({ 顺序: idx + 1, 学校: i.universityName, 专业: i.majorName, 城市: `${i.province}${i.city}`, 风险: i.riskLabel, 匹配度: i.matchScore, 说明: i.recommendReason[0], 备注: i.riskTips[0] }));
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => { const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "志愿表"); XLSX.writeFile(wb, "志愿表-安徽版.xlsx"); }}>导出 Excel</Button>
      <Button variant="outline" onClick={() => { const doc = new jsPDF(); doc.text("高考志愿建议表（安徽版）", 14, 12); autoTable(doc, { head: [["顺序", "学校", "专业", "城市", "风险", "匹配度", "说明"]], body: rows.map((r) => [r.顺序, r.学校, r.专业, r.城市, r.风险, r.匹配度, r.说明]) }); doc.save("志愿表-安徽版.pdf"); }}>导出 PDF</Button>
    </div>
  );
}
