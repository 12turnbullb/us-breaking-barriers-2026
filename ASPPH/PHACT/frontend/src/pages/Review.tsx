import { useState } from "react"
import type { ReviewStatus } from "../types"
import { EmptyState, Icon, PageHeader } from "../components/ui"
import { CourseBanner, RecTitleLine, RecommendationBody, RecommendationEditor, ReviewActions, ReviewHistory, useAnalysis, type AppCtx } from "../components/workspace"
import { JobGate } from "./Recommendations"

export function Review({ ctx }: { ctx: AppCtx }) {
  const analysis = useAnalysis(ctx.activeJobId)
  const [tab, setTab] = useState<ReviewStatus>("DRAFT")
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const recs = analysis.data?.recommendations || []
  const list = recs.filter((r) => r.status === tab)
  const rec = list.find((r) => r.id === selected) || list[0]
  const approved = recs.filter((r) => r.status === "APPROVED").length

  return (
    <>
      <PageHeader
        eyebrow="Step 4 of 6"
        title="Review and approval"
        description="You decide what is used. Approve, reject, or revise each draft. Approval records your name and time, and does not publish anything to the shared repository."
        action={
          <button className="primary" onClick={() => ctx.navigate("export")} disabled={!approved}>
            Export {approved || ""} approved <Icon name="arrow" size={15} />
          </button>
        }
      />
      <JobGate ctx={ctx} analysis={analysis}>
        {analysis.data && <CourseBanner ctx={ctx} syllabus={analysis.data.syllabus} recs={recs} />}
        <div className="tabs">
          {(["DRAFT", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              className={tab === s ? "active" : ""}
              onClick={() => {
                setTab(s)
                setSelected(null)
                setEditing(false)
              }}
            >
              {s === "DRAFT" ? "Needs review" : s === "APPROVED" ? "Approved" : "Rejected"}
              <span>{recs.filter((r) => r.status === s).length}</span>
            </button>
          ))}
        </div>
        <div className="review-layout">
          <div className="panel review-list">
            {!list.length && (
              <EmptyState icon="check" title={tab === "DRAFT" ? "Nothing left to review" : "Nothing here yet"}>
                {tab === "DRAFT" ? "Every recommendation for this course has a decision." : "Items appear here after you review them."}
              </EmptyState>
            )}
            {list.map((r) => (
              <button
                key={r.id}
                className={rec?.id === r.id ? "active" : ""}
                onClick={() => {
                  setSelected(r.id)
                  setEditing(false)
                }}
              >
                <div>
                  <RecTitleLine rec={r} />
                  <h3>{r.title}</h3>
                  <p>{r.citations.length} supporting source{r.citations.length === 1 ? "" : "s"} · {r.history.length} history event{r.history.length === 1 ? "" : "s"}</p>
                </div>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          {rec && (
            <section className="panel review-detail">
              <div className="review-detail-head">
                <div>
                  <RecTitleLine rec={rec} />
                  <h2>{rec.title}</h2>
                </div>
              </div>
              {editing ? (
                <RecommendationEditor
                  rec={rec}
                  user={ctx.user}
                  onCancel={() => setEditing(false)}
                  onSaved={(r) => {
                    analysis.replace(r)
                    setEditing(false)
                    ctx.toast("Draft revision saved")
                  }}
                />
              ) : (
                <>
                  <RecommendationBody rec={rec} />
                  <ReviewActions
                    rec={rec}
                    ctx={ctx}
                    onEdit={() => setEditing(true)}
                    onChange={(r) => {
                      analysis.replace(r)
                      setSelected(null)
                    }}
                  />
                </>
              )}
              <div className="rec-section history-section">
                <h3>Review history</h3>
                <ReviewHistory rec={rec} />
              </div>
            </section>
          )}
        </div>
      </JobGate>
    </>
  )
}
