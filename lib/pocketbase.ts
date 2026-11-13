import PocketBase from 'pocketbase';

// 수프리마 랩 공용 PocketBase 인스턴스
// 로컬: http://127.0.0.1:8090 | 클라우드(Fly.io): https://suprima-platform-pb.fly.dev
const pbUrl =
  process.env.PB_URL ||
  process.env.NEXT_PUBLIC_PB_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8090"
    : "https://suprima-platform-pb.fly.dev");

const pb = new PocketBase(pbUrl);

export default pb;

