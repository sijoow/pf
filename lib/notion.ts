import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID!;

// ── 타입 ────────────────────────────────────────────────
export type Project = {
  id: string;
  title: string;
  summary: string;
  status: string;
  role: string;
  company: string;
  category: string[];
  stack: string[];
  startDate: string | null;
  endDate: string | null;
  demo: string | null;
  problem: string;
  solution: string;
  result: string;
  learned: string;
  cover: string | null;
};

export type Section = { heading: string; paragraphs: string[] };
export type Shot = { url: string; caption: string };
export type ProjectDetail = Project & { sections: Section[]; shots: Shot[] };

// ── 헬퍼 ────────────────────────────────────────────────
const rt = (p: any): string =>
  (p?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
const sel = (p: any): string => p?.select?.name ?? "";
const multi = (p: any): string[] => (p?.multi_select ?? []).map((s: any) => s.name);
const date = (p: any): string | null => p?.date?.start ?? null;
const url = (p: any): string | null => p?.url ?? null;
const fileUrl = (f: any): string | null =>
  f?.external?.url ?? f?.file?.url ?? null;

function mapProject(page: any): Project {
  const p = page.properties;
  return {
    id: page.id,
    title: (p["프로젝트명"]?.title ?? []).map((t: any) => t.plain_text).join("") || "(제목 없음)",
    summary: rt(p["한줄요약"]),
    status: sel(p["상태"]),
    role: sel(p["역할"]),
    company: sel(p["회사"]),
    category: multi(p["카테고리"]),
    stack: multi(p["기술스택"]),
    startDate: date(p["시작일"]),
    endDate: date(p["완료일"]),
    demo: url(p["Demo"]),
    problem: rt(p["문제정의"]),
    solution: rt(p["해결방법"]),
    result: rt(p["성과"]),
    learned: rt(p["배운점"]),
    cover: fileUrl(page.cover),
  };
}

// 상태 정렬 우선순위(진행중 먼저)
const STATUS_ORDER: Record<string, number> = {
  "진행중": 0, "유지보수": 1, "완료": 2, "기획중": 3, "보류": 4,
};

export async function getProjects(): Promise<Project[]> {
  const res = await notion.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    page_size: 100,
  });
  const list = res.results.map(mapProject);
  list.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
  return list;
}

async function listAllChildren(blockId: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const r: any = await notion.blocks.children.list({
      block_id: blockId, page_size: 100, start_cursor: cursor,
    });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

export async function getProject(id: string): Promise<ProjectDetail | null> {
  const page: any = await notion.pages.retrieve({ page_id: id });
  if (!page.properties) return null;
  const base = mapProject(page);

  const children = await listAllChildren(id);
  const childPages = children.filter((b) => b.type === "child_page");

  // 📄 기술서 → 섹션
  const sections: Section[] = [];
  const docPage = childPages.find((b) => b.child_page.title.includes("기술서"));
  if (docPage) {
    const blocks = await listAllChildren(docPage.id);
    let cur: Section | null = null;
    for (const b of blocks) {
      if (b.type === "heading_2") {
        cur = { heading: (b.heading_2.rich_text ?? []).map((t: any) => t.plain_text).join(""), paragraphs: [] };
        sections.push(cur);
      } else if (b.type === "paragraph" && cur) {
        const txt = (b.paragraph.rich_text ?? []).map((t: any) => t.plain_text).join("");
        if (txt.trim()) cur.paragraphs.push(txt);
      }
    }
  }

  // 🖼 UI 스크린샷 → 이미지
  const shots: Shot[] = [];
  const shotPage = childPages.find((b) => b.child_page.title.includes("스크린샷"));
  if (shotPage) {
    const blocks = await listAllChildren(shotPage.id);
    for (const b of blocks) {
      if (b.type === "image") {
        const u = fileUrl(b.image);
        if (u) shots.push({ url: u, caption: (b.image.caption ?? []).map((t: any) => t.plain_text).join("") });
      }
    }
  }

  return { ...base, sections, shots };
}
