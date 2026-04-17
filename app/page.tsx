import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_VERSION } from "@/lib/version";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-sky-500 p-10 text-primary-foreground shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            安徽新高考 · 决策引擎 V{APP_VERSION}
          </Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          你的分数只能决定“能上什么学校”，
          <br />
          但志愿填报决定你未来去哪座城市、做什么工作
        </h1>
        <p className="mt-4 max-w-3xl text-primary-foreground/90">
          基于安徽考生 + 城市/专业/就业/成本多维分析，
          <br />
          3分钟生成一份真正能填的志愿方案
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold bg-white text-primary hover:bg-white/90">
            <Link href="/intake">开始生成我的志愿方案</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold bg-blue-700 text-white hover:bg-blue-800">
            <Link href="/intake">先测一下孩子适合哪些学校</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "硬约束优先",
            desc: "明确不去的城市/省份/专业直接剔除候选池，再谈排序与匹配。"
          },
          {
            title: "顾问式解释",
            desc: "每条推荐展示分数拆解与风险，支持即时排除后重算。"
          },
          {
            title: "多策略与导出",
            desc: "冲学校 / 稳就业 / 离家近 / 综合平衡；志愿表支持 Excel / PDF。"
          }
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">为什么这不是普通免费版志愿推荐</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                普通工具
              </Badge>
              <CardDescription>
                - 只看分数
                <br />- 推荐学校列表
                <br />- 没有解释
                <br />- 不考虑城市与就业
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit bg-blue-600 text-white">本系统（更适合真实填报）</Badge>
              <CardDescription className="text-slate-700">
                <ul className="space-y-1">
                  <li>✅ <span className="font-semibold text-blue-700">更精准</span>：不只看分数，还会结合城市、专业、就业、成本一起判断。</li>
                  <li>✅ <span className="font-semibold text-emerald-700">匹配度更高</span>：支持家庭偏好和硬约束，推荐更贴近真实可选方向。</li>
                  <li>✅ <span className="font-semibold text-indigo-700">更有前瞻性</span>：不仅看当前热门，也看未来几年行业趋势和专业持续价值。</li>
                  <li>✅ <span className="font-semibold text-violet-700">避免盲目追热度</span>：尽量减少“今天热门、明天被行业变化削弱”的风险。</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">很多人不是没考好，而是志愿没填对</CardTitle>
            <CardDescription>
              - 只看学校名气
              <br />- 忽略专业就业
              <br />- 不考虑城市发展
              <br />- 不了解调剂风险
            </CardDescription>
            <div className="pt-2">
              <Button asChild className="h-12 px-6 text-base font-semibold">
                <Link href="/intake">立即查看适合我的填报方向</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">你将得到这样的结果预览</h2>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">冲/稳/保方案</Badge>
              <Badge variant="outline">匹配度 86</Badge>
            </div>
            <CardTitle className="text-lg">示例：南京邮电大学 · 人工智能（稳）</CardTitle>
            <CardDescription>
              推荐理由：专业与目标行业匹配度高，城市产业资源强，通勤与异地适应成本可控。
              <br />
              风险提示：热门专业竞争强，建议搭配 1-2 个保底志愿，防止计划数波动。
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">学生看兴趣，家长更关心结果</CardTitle>
            <CardDescription>
              我们会把就业方向、成本控制、录取风险、是否适合考公/考研放在同一页清晰展示，帮助家庭在同一套依据上做决定。
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
