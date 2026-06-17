import Link from "next/link";
import { getProjects } from "@/lib/notion";

export const revalidate = 600; // 10분마다 Notion 재검증(ISR)

function year(d: string | null) {
  return d ? d.slice(0, 4) : "";
}
function period(s: string | null, e: string | null) {
  const a = year(s), b = e ? year(e) : "";
  if (a && b && a !== b) return `${a}–${b}`;
  return a || b || "";
}

export default async function Home() {
  const projects = await getProjects();
  const inProgress = projects.filter((p) => p.status === "진행중").length;

  return (
    <div className="wrap">
      <header className="site-head">
        <span className="mark">이승환</span>
        <nav>
          <a href="#work">Work</a>
          <a href="mailto:leshwann@naver.com">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Frontend · Fullstack Developer</p>
        <h1>
          보기 좋은 화면과<br />
          잘 도는 시스템을<br />
          <span className="dim">함께 만듭니다.</span>
        </h1>
        <p className="lede">
          프론트엔드에서 출발해 백엔드·데이터·자동화까지 영역을 넓혀온 개발자입니다.
          커머스·광고·고객 운영의 실제 문제를 웹·앱·서버로 풀어냅니다.
        </p>
        <div className="hero-cta">
          <a className="btn-primary" href="mailto:leshwann@naver.com">이메일 보내기</a>
          <a className="btn-ghost" href="#work">프로젝트 보기</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><strong>{projects.length}</strong><span>프로젝트</span></div>
          <div className="stat"><strong>{inProgress}</strong><span>진행 중</span></div>
          <div className="stat stat--text"><strong>Web · App · Server</strong><span>작업 범위</span></div>
        </div>
      </section>

      <div id="work" className="sec-head">
        <h2>Selected Work</h2>
        <span className="count">{String(projects.length).padStart(2, "0")}</span>
      </div>

      <div className="index">
        {projects.map((p, i) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="row">
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <div className="body">
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <div className="tags">
                {p.stack.slice(0, 5).map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </div>
            <div className="aside">
              <span className={"status" + (p.status === "진행중" ? " on" : "")}>{p.status}</span>
              {period(p.startDate, p.endDate) && (
                <span className="yr">{period(p.startDate, p.endDate)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <footer className="site-foot">
        <span>© {new Date().getFullYear()} 이승환</span>
        <a href="mailto:leshwann@naver.com">leshwann@naver.com</a>
      </footer>
    </div>
  );
}
