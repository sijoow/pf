import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/notion";

export const revalidate = 600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

function fmt(d: string | null) {
  return d ? d.replace(/-/g, ".") : "";
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProject(id);
  if (!p) notFound();

  const period =
    p.startDate || p.endDate
      ? `${fmt(p.startDate)}${p.endDate ? " – " + fmt(p.endDate) : " –"}`
      : "";

  const star = [
    ["문제", p.problem],
    ["해결", p.solution],
    ["성과", p.result],
    ["배운 점", p.learned],
  ].filter(([, v]) => v);

  return (
    <div className="wrap">
      <Link href="/" className="back">← Back</Link>

      <header className="detail-head">
        <p className="eyebrow">{p.category.join(" · ")}</p>
        <h1 style={{ marginTop: 14 }}>{p.title}</h1>
        {p.summary && <p className="summary">{p.summary}</p>}

        <dl className="facts">
          <div>
            <dt>Status</dt>
            <dd>{p.status}</dd>
          </div>
          {p.role && (
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
          )}
          {p.company && (
            <div>
              <dt>Context</dt>
              <dd>{p.company}</dd>
            </div>
          )}
          {period && (
            <div>
              <dt>Period</dt>
              <dd>{period}</dd>
            </div>
          )}
          {p.stack.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <dt>Stack</dt>
              <dd className="tags">
                {p.stack.map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </dd>
            </div>
          )}
          {p.demo && (
            <div>
              <dt>Demo</dt>
              <dd>
                <a href={p.demo} target="_blank" rel="noreferrer" style={{ borderBottom: "1px solid var(--accent)", color: "var(--accent)" }}>
                  바로가기 ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {star.length > 0 && (
        <div className="star">
          {star.map(([k, v]) => (
            <div className="block" key={k}>
              <h4>{k}</h4>
              <p>{v}</p>
            </div>
          ))}
        </div>
      )}

      {p.sections.map((s) => (
        <section className="section" key={s.heading}>
          <div className="s-title">{s.heading}</div>
          <div className="s-body">
            {s.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      ))}

      {p.shots.length > 0 && (
        <div className="shots">
          <h3>UI / 스크린샷</h3>
          {p.shots.map((shot, i) => (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.url} alt={shot.caption || p.title} />
              {shot.caption && <figcaption>{shot.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <footer className="site-foot">
        <Link href="/">← 전체 프로젝트</Link>
        <a href="mailto:leshwann@naver.com">leshwann@naver.com</a>
      </footer>
    </div>
  );
}
