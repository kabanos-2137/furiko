type LoginReq = {
  username: string,
  password: string
}

type GetDevicesReq = {
  userId: number,
  password: string
}

type GetSettingsReq = {
  userId: number,
  password: string,
  deviceId: number
}

type SetSettingsReq = {
  userId: number,
  password: string,
  deviceId: number,
  settingsData: {
    unit: "metric" | "imperial",
    name: string
  } 
}

type InviteReq = {
  userId: number,
  password: string,
  code: string
}

type VerifReq = {
  username: string,
  password: string,
  code: string
}

type GenerateInviteUserReq = {
  userId: number,
  password: string,
  deviceId: number
}

type GenerateInviteAdminReq = {}

type CreateSessionReq = {
  userId: number,
  password: string,
  deviceId: number,
  typeOfGraph: number,
  name: string
}

type EndSessionReq = {
  userId: number,
  password: string,
  deviceId: number,
  typeOfGraph: number,
  sessionId: number,
  data: {
    x: number,
    y: number
  }[]
}

type GetSessionsReq = {
  userId: number,
  password: string,
  deviceId: number,
  typeOfGraph: number
}

type GetSessionReq = {
  userId: number,
  password: string,
  deviceId: number,
  sessionId: number,
  typeOfGraph: number
}

type CreateAccReq = {
  username: string,
  password: string,
  confPassword: string,
  email: string
}

export { LoginReq, GetDevicesReq, GetSettingsReq, SetSettingsReq, InviteReq, VerifReq, GenerateInviteUserReq, GenerateInviteAdminReq, CreateSessionReq, EndSessionReq, GetSessionsReq, GetSessionReq, CreateAccReq}