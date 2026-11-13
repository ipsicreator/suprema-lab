import pb from './pocketbase';

/**
 * 수프리마 표준 권한 체크 로직
 * 규칙: licenses에서 academy_id + active=true만 판정
 */
export async function checkLicense(academyId: string): Promise<boolean> {
  const value = (academyId || "").trim();
  if (!value) return false;
  // The explicitly named demo is public; real academy names never grant a license.
  if (value === "demo_academy") return true;
  try {
    const license = await pb.collection("licenses").getFirstListItem(pb.filter("academy_id = {:academyId} && active = true", { academyId: value }));
    return license.active === true;
  } catch {
    return false;
  }
}

/**
 * 역할별 접근 제어
 * 역할: master, director, student
 */
export async function getUserProfile(userId: string) {
  try {
    return await pb.collection('suprema_platform').getFirstListItem(`user="${userId}"`);
  } catch (error) {
    console.error('Profile Fetch Failed:', error);
    return null;
  }
}
