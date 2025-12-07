/**
 * 팀 슬롯 생성 로직 테스트
 * 
 * 낙오자 방지: 팀 간 인원 차이 최대 1명 보장
 */

import { describe, it, expect } from 'vitest';
import { createTeamSlots } from '@/features/matching/slots';

describe('createTeamSlots', () => {
  it('12명, 4인팀 → [4,4,4]', () => {
    const slots = createTeamSlots(12, 4);
    expect(slots).toHaveLength(3);
    expect(slots.map(s => s.capacity)).toEqual([4, 4, 4]);
    expect(slots.reduce((sum, s) => sum + s.capacity, 0)).toBe(12);
  });

  it('13명, 4인팀 → 1인팀 없음 (최소 2명 보장)', () => {
    const slots = createTeamSlots(13, 4);
    const capacities = slots.map(s => s.capacity);
    
    // 모든 팀이 최소 2명 이상
    expect(capacities.every(c => c >= 2)).toBe(true);
    
    // 총 인원 일치
    expect(capacities.reduce((a, b) => a + b, 0)).toBe(13);
    
    // 팀 간 인원 차이 최대 1명
    const min = Math.min(...capacities);
    const max = Math.max(...capacities);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('14명, 4인팀 → [4,4,3,3]', () => {
    const slots = createTeamSlots(14, 4);
    const capacities = slots.map(s => s.capacity);
    
    expect(capacities.reduce((a, b) => a + b, 0)).toBe(14);
    expect(capacities.every(c => c >= 2)).toBe(true);
    
    // 팀 간 인원 차이 최대 1명
    const min = Math.min(...capacities);
    const max = Math.max(...capacities);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('2명 → [2]', () => {
    const slots = createTeamSlots(2, 4);
    expect(slots).toHaveLength(1);
    expect(slots[0].capacity).toBe(2);
  });

  it('5명, 3인팀 → [3,2]', () => {
    const slots = createTeamSlots(5, 3);
    const capacities = slots.map(s => s.capacity);
    
    expect(capacities.reduce((a, b) => a + b, 0)).toBe(5);
    expect(capacities.every(c => c >= 2)).toBe(true);
  });

  it('10명, 3인팀 → [3,3,2,2]', () => {
    const slots = createTeamSlots(10, 3);
    const capacities = slots.map(s => s.capacity);
    
    expect(capacities.reduce((a, b) => a + b, 0)).toBe(10);
    expect(capacities.every(c => c >= 2)).toBe(true);
    
    // 팀 간 인원 차이 최대 1명
    const min = Math.min(...capacities);
    const max = Math.max(...capacities);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('최소 2명 미만이면 에러', () => {
    expect(() => createTeamSlots(1, 4)).toThrow('최소 2명의 학생이 필요합니다');
  });

  it('목표 팀 크기가 2 미만이면 에러', () => {
    expect(() => createTeamSlots(10, 1)).toThrow('목표 팀 크기는 최소 2명이어야 합니다');
  });

  it('팀 번호가 1부터 시작', () => {
    const slots = createTeamSlots(10, 3);
    expect(slots[0].teamNumber).toBe(1);
    expect(slots[slots.length - 1].teamNumber).toBe(slots.length);
  });
});


