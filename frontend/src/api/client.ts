const API_URL = import.meta.env.VITE_API_URL || ''

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  initData?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, initData } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (initData) {
    headers['X-Telegram-Init-Data'] = initData
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}

// Types
export interface User {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
}

export interface Group {
  id: number
  name: string
  invite_code: string
  creator_id: number
  created_at: string
  members_count: number
  has_active_hatm: boolean
}

export interface GroupDetail extends Group {
  members: Member[]
  active_hatm: HatmResponse | null
}

export interface Member {
  id: number
  user_id: number
  username: string | null
  first_name: string | null
  joined_at: string
}

export interface HatmResponse {
  id: number
  group_id: number
  duration_days: number
  participants_count: number
  status: 'pending' | 'active' | 'completed'
  started_at: string | null
  ends_at: string | null
  created_at: string
}

export interface JuzAssignment {
  id: number
  juz_number: number
  status: 'pending' | 'completed' | 'debt'
  user_id: number
  username: string | null
  first_name: string | null
  completed_at: string | null
  is_debt: boolean
}

export interface HatmProgress {
  total_juzs: number
  completed_juzs: number
  pending_juzs: number
  debt_juzs: number
  progress_percent: number
  juz_assignments: JuzAssignment[]
}

export interface UserJuzStats {
  total_assigned: number
  completed: number
  pending: number
  debts: number
  juzs: JuzAssignment[]
}

// API functions
export const api = {
  // User
  getMe: (initData: string) =>
    apiRequest<User>('/api/users/me', { initData }),

  getMyJuzs: (initData: string) =>
    apiRequest<UserJuzStats>('/api/users/me/juzs', { initData }),

  getMyDebts: (initData: string) =>
    apiRequest<{ debts: JuzAssignment[]; total_debts: number }>('/api/users/me/debts', { initData }),

  // Groups
  getGroups: (initData: string) =>
    apiRequest<Group[]>('/api/groups', { initData }),

  getGroup: (id: number, initData: string) =>
    apiRequest<GroupDetail>(`/api/groups/${id}`, { initData }),

  createGroup: (name: string, initData: string) =>
    apiRequest<Group>('/api/groups', { method: 'POST', body: { name }, initData }),

  joinGroup: (invite_code: string, initData: string) =>
    apiRequest<Group>('/api/groups/join', { method: 'POST', body: { invite_code }, initData }),

  // Hatms
  getGroupHatms: (groupId: number, initData: string) =>
    apiRequest<HatmResponse[]>(`/api/groups/${groupId}/hatms`, { initData }),

  createHatm: (groupId: number, duration_days: number, participants_count: number, initData: string) =>
    apiRequest<HatmResponse>(`/api/groups/${groupId}/hatms`, {
      method: 'POST',
      body: { duration_days, participants_count },
      initData,
    }),

  getHatm: (id: number, initData: string) =>
    apiRequest<HatmResponse & { juz_assignments: JuzAssignment[] }>(`/api/hatms/${id}`, { initData }),

  startHatm: (id: number, initData: string) =>
    apiRequest<HatmResponse>(`/api/hatms/${id}/start`, { method: 'POST', initData }),

  getHatmProgress: (id: number, initData: string) =>
    apiRequest<HatmProgress>(`/api/hatms/${id}/progress`, { initData }),

  // Juz
  completeJuz: (juzId: number, initData: string) =>
    apiRequest<JuzAssignment>(`/api/juzs/${juzId}/complete`, { method: 'POST', initData }),

  // Complete hatm
  completeHatm: (id: number, initData: string) =>
    apiRequest<HatmResponse>(`/api/hatms/${id}/complete`, { method: 'POST', initData }),
}
