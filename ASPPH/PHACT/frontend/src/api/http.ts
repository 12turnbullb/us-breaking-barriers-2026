import type { ApiConfig, PhactApi } from "./types"
import type { FacultyUser } from "../types"

const unavailable = (method: string) => Promise.reject(new Error(`${method} is not available: the PHACT backend contract is not implemented yet.`))

/** Live adapter boundary. It never falls back to mock data. Unimplemented operations fail explicitly. */
export function createHttpApi(config: ApiConfig): PhactApi {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
    if (!response.ok) throw new Error(`PHACT API request failed (${response.status}).`)
    return response.json() as Promise<T>
  }

  const httpApi: PhactApi = {
    getDashboard: () => unavailable("getDashboard"),
    listHistory: () => unavailable("listHistory"),
    uploadSyllabus: () => unavailable("uploadSyllabus"),
    createAnalysisJob: () => unavailable("createAnalysisJob"),
    getAnalysis: () => unavailable("getAnalysis"),
    retryJob: () => unavailable("retryJob"),
    saveRecommendation: () => unavailable("saveRecommendation"),
    reviewRecommendation: () => unavailable("reviewRecommendation"),
    reopenRecommendation: () => unavailable("reopenRecommendation"),
    getCompetencyMappings: () => unavailable("getCompetencyMappings"),
    submitContribution: () => unavailable("submitContribution"),
    listContributions: () => unavailable("listContributions"),
    getRecommendation: () => unavailable("getRecommendation"),
    moderateContribution: () => unavailable("moderateContribution"),
    queueIndexing: () => unavailable("queueIndexing"),
    listKnowledgeSources: () => unavailable("listKnowledgeSources"),
    updateSourceStatus: () => unavailable("updateSourceStatus"),
    retrySourceIngestion: () => unavailable("retrySourceIngestion"),
    requestSync: () => unavailable("requestSync"),
    getSyncStatus: () => unavailable("getSyncStatus"),
    getSettings: () => unavailable("getSettings"),
    saveSettings: () => unavailable("saveSettings"),
    resetDemo: () => undefined,
    currentUser: () => null,
    signOut: () => undefined,
    signIn: (email: string) => request<FacultyUser>(`/auth/session`, { method: "POST", body: JSON.stringify({ email }) }),
    switchRole: () => unavailable("switchRole"),
  }
  return httpApi
}
