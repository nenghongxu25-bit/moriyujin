export interface PlayerProfile {
  nickName: string;
  avatarUrl: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
  language?: string;
  updatedAt: number;
}

export interface PlayerRecord {
  playerId: string;
  displayId: number;
  openId?: string;
  anonymousOpenId?: string;
  profile?: PlayerProfile | null;
  createdAt?: number;
  lastLoginAt?: number;
}
