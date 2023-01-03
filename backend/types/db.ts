type Data = {
  users: User[],
  devices: Device[],
  invites: Invite[],
  sessions: Session[]
}

type User = {
  id: number,
  username: string,
  password: string,
  email: string,
  verified: boolean
}

type Device = {
  id: number,
  permissions: {
    userId: number,
    type: "admin" | "user"
  }[],
  settings: {
    unit: "metric" | "imperial",
    name: string
  }
}

type Invite = {
  id: number,
  code: string
}

type Session = {
  deviceId: number,
  sessionId: number,
  typeOfGraph: number,
  name: string,
  data: {
    x: number,
    y: number
  }[]
}

export default Data