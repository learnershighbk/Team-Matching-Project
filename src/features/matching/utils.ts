/**
 * 매칭 알고리즘 유틸리티 함수
 */

/**
 * top_factors 배열 검증 및 정규화
 * 
 * DB 제약 조건: 최대 2개 요소
 * 
 * @param topFactors top factors 배열
 * @returns 최대 2개 요소로 제한된 배열
 */
export function normalizeTopFactors(topFactors: string[] | undefined | null): string[] {
  if (!topFactors || topFactors.length === 0) {
    return [];
  }

  // 최대 2개만 반환
  return topFactors.slice(0, 2);
}

/**
 * top_factors 배열 검증
 * 
 * @param topFactors top factors 배열
 * @throws Error if array length > 2
 */
export function validateTopFactors(topFactors: string[] | undefined | null): void {
  if (topFactors && topFactors.length > 2) {
    throw new Error(
      `top_factors는 최대 2개 요소만 허용됩니다. 현재: ${topFactors.length}개`
    );
  }
}

