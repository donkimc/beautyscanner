// A tiny stand-in for the Naver Shopping search API, for trying the admin page without real keys:
//   npm run mock:naver                       (serves on http://localhost:4010)
//   NAVER_API_BASE=http://localhost:4010 NAVER_IMAGE_HOSTS=localhost NAVER_CLIENT_ID=x NAVER_CLIENT_SECRET=y ADMIN_EMAILS=you@example.com npm run dev
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PORT = Number(process.env.PORT ?? 4010);
const photo = (name: string) => readFileSync(new URL(`../public/products/${name}.jpg`, import.meta.url));
const IMAGES: Record<string, Buffer> = { beplain: photo("beplain"), snature: photo("snature"), tonymoly: photo("tonymoly") };

const item = (id: string, title: string, price: number, img: keyof typeof IMAGES, extra: Record<string, string> = {}) => ({
  title, link: `https://search.shopping.naver.com/catalog/${id}`, image: `http://localhost:${PORT}/img/${img}.jpg`, lprice: String(price), hprice: "",
  mallName: "네이버", productId: id, productType: "1", brand: "", maker: "", category1: "화장품/미용", category2: "스킨케어", category3: "", category4: "", ...extra,
});

const DATA = [
  item("101", "<b>비플레인</b> 녹두 약산성 클렌징폼 80ml", 12900, "beplain", { brand: "비플레인", maker: "비플레인", category3: "클렌징폼" }),
  item("102", "<b>비플레인</b> 녹두 약산성 클렌징폼 기획세트 1+1", 21000, "beplain", { brand: "비플레인", category3: "클렌징폼" }),
  item("201", "<b>에스네이처</b> 아쿠아 오아시스 토너 200ml", 19800, "snature", { brand: "에스네이처", maker: "에스네이처", category3: "스킨/토너" }),
  item("301", "<b>토니모리</b> 세라마이드 모찌 토너 500ml", 15900, "tonymoly", { brand: "토니모리", maker: "토니모리", category3: "스킨/토너" }),
  item("401", "<b>토리든</b> 다이브인 저분자 히알루론산 세럼 50ml", 16900, "snature", { brand: "토리든", maker: "토리든", category3: "에센스/앰플" }),
  item("501", "<b>아누아</b> PDRN 히알루론산 캡슐 100 세럼 30ml", 27500, "tonymoly", { brand: "아누아", maker: "아누아", category3: "에센스/앰플" }),
  item("601", "무기자차 선크림 SPF50+ PA++++ 50ml", 14500, "beplain", { brand: "테스트", category2: "선케어", category3: "선크림" }),
];

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const img = url.pathname.match(/^\/img\/(\w+)\.jpg$/);
  if (img && IMAGES[img[1]]) { res.writeHead(200, { "content-type": "image/jpeg" }); return void res.end(IMAGES[img[1]]); }
  if (url.pathname !== "/v1/search/shop.json") { res.writeHead(404); return void res.end(); }
  if (!req.headers["x-naver-client-id"] || !req.headers["x-naver-client-secret"]) { res.writeHead(401, { "content-type": "application/json" }); return void res.end(JSON.stringify({ errorCode: "024", errorMessage: "Authentication failed" })); }
  const q = (url.searchParams.get("query") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const hit = DATA.filter((d) => q.some((t) => d.title.toLowerCase().includes(t)));
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ lastBuildDate: new Date().toUTCString(), total: hit.length, start: 1, display: hit.length, items: hit }));
}).listen(PORT, () => console.log(`mock Naver API on http://localhost:${PORT}`));
