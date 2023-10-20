import { Business } from "@prisma/client"

export enum AppState {
  ACTIVE = 'active',
  BACKGROUND = 'background',
}

export type WeeklyReport = {
  business: Business,
  // Todo: report data should be change for typesafe as well
  reportData: any
}