type LoginRes = {
  correct: boolean,
  id: number,
  wrong: 0|1|2
}

type GetDevicesRes = {
  correct: boolean,
  devices: {
    id: number,
    name: string
  }[]
}

type GetSettingsRes = {
  correct: boolean,
  permissions: "admin" | "user",
  settingsData: {
    unit: "metric" | "imperial",
    name: string
  }
}

type SetSettingsRes = {
  correct: boolean
}

type InviteRes = {
  correct: boolean,
  deviceId: number
}

type VerifRes = {
  correct: boolean,
  wrong: 0|1|2|3
}

type GenerateInviteUserRes = {
  correct: boolean,
  code: string
}

type GenerateInviteAdminRes = {
  correct: boolean,
  code: string,
  deviceId: number
}

type CreateSessionRes = {
  correct: boolean,
  wrong: 0|1|2|3,
  sessionId: number
}

type EndSessionRes = {
  correct: boolean
}

type GetSessionsRes = {
  correct: boolean,
  sessions: {
    sessionId: number,
    typeOfGraph: number,
    name: string
  }[]
}

type GetSessionRes = {
  correct: boolean,
  sessionId: number,
  typeOfGraph: number,
  name: string,
  data: {
    x: number,
    y: number
  }[]
}

type CreateAccRes = {
  correct: boolean,
  wrong: 0|1|2|3,
  userId: number
}

export { LoginRes, GetDevicesRes, GetSettingsRes, SetSettingsRes, InviteRes, VerifRes, GenerateInviteUserRes, GenerateInviteAdminRes, CreateSessionRes, EndSessionRes, GetSessionsRes, GetSessionRes, CreateAccRes }