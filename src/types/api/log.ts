export interface LoginLogRecord {
  id: number;
  userId: string;
  username: string;
  tenantId: string;
  ip: string;
  location: string;
  device: string;
  os: string;
  browser: string;
  status: number;
  message: string;
  loginTime: number;
}

export interface LogQueryParams {
  current: number;
  pageSize: number;
  username?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface LogQueryResult {
  list: LoginLogRecord[];
  total: number;
}
