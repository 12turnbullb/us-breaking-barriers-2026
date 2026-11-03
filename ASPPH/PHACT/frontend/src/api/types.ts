/** Provisional frontend contracts. Replace or explicitly map these to generated shared types when the team adds the analysis schema. */
export type * from "../types"
import type { AnalysisJob, CompetencyMapping, DashboardData, FacultySettings, FacultyUser, HistoryRow, KnowledgeSource, Recommendation, ReviewStatus, Role, SharedContribution, Syllabus, SyncStatus } from "../types"

export interface UploadInput { file?: File; text?: string; courseName: string; subject: string; description: string }
export interface ContributionInput { recommendationId: string; title: string; description: string; courseSubject: string; consent: boolean }

/** Independent service contract. Adapters must implement this interface; it is not inferred from fixtures or mock code. */
export interface PhactApi {
  currentUser(): FacultyUser | null
  signIn(email: string): Promise<FacultyUser>
  switchRole(role: Role): Promise<FacultyUser>
  signOut(): void
  getDashboard(user: FacultyUser): Promise<DashboardData>
  listHistory(user: FacultyUser): Promise<HistoryRow[]>
  uploadSyllabus(user: FacultyUser, input: UploadInput, onProgress?: (percent: number) => void): Promise<Syllabus>
  createAnalysisJob(user: FacultyUser, syllabusId: string, options?: { simulateFailure?: boolean }): Promise<AnalysisJob>
  getAnalysis(jobId: string): Promise<{ job: AnalysisJob; syllabus: Syllabus; recommendations: Recommendation[] } | null>
  retryJob(jobId: string): Promise<AnalysisJob>
  saveRecommendation(rec: Recommendation, actor: string): Promise<Recommendation>
  reviewRecommendation(id: string, status: Exclude<ReviewStatus, "DRAFT">, actor: string, note?: string): Promise<Recommendation>
  reopenRecommendation(id: string, actor: string): Promise<Recommendation>
  getCompetencyMappings(jobId: string): Promise<CompetencyMapping[]>
  submitContribution(user: FacultyUser, input: ContributionInput): Promise<SharedContribution>
  listContributions(submittedById?: string): Promise<SharedContribution[]>
  getRecommendation(id: string): Promise<Recommendation | null>
  moderateContribution(id: string, decision: "approve" | "reject", actor: string, reason?: string): Promise<SharedContribution>
  queueIndexing(id: string): Promise<SharedContribution>
  listKnowledgeSources(scope: "faculty" | "admin"): Promise<KnowledgeSource[]>
  updateSourceStatus(id: string, approvalStatus: KnowledgeSource["approvalStatus"]): Promise<KnowledgeSource>
  retrySourceIngestion(id: string): Promise<KnowledgeSource>
  requestSync(): Promise<SyncStatus>
  getSyncStatus(): Promise<SyncStatus>
  getSettings(user: FacultyUser): Promise<FacultySettings>
  saveSettings(user: FacultyUser, settings: FacultySettings): Promise<FacultyUser>
  resetDemo(): void
}

export interface ApiConfig {
  mode: "mock" | "live"
  baseUrl: string
}
