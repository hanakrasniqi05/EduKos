export type AuthResponse = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  roles: string[];
  institutionIsApproved?: boolean | null;
  institutionIsDeleted: boolean;
};

export type UserDto = {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
};

export type InstitutionDto = {
  institutionId: number;
  institutionTypeId: number;
  ownerUserId?: number;
  name: string;
  description?: string;
  location?: string;
  city?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  isApproved: boolean;
  createdAt: string;
  institutionTypeName?: string;
  language?: string;
  institutionOwnership?: string;
  averageRating?: number | null;
  reviewCount?: number;
};

export type InstitutionWritePayload = Omit<
  InstitutionDto,
  "institutionId" | "createdAt" | "institutionTypeName"
>;

export type InstitutionTypeDto = {
  institutionTypeId: number;
  name: string;
};

export type ReviewDto = {
  reviewId: number;
  userId: number;
  institutionId: number;
  teachingQualityRating?: number;
  facilitiesRating?: number;
  difficultyRating?: number;
  staffRating?: number;
  comment?: string;
  createdAt: string;
};

export type HomeStatsDto = {
  institutions: number;
  programs: number;
  users: number;
};

export type UserCreatePayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
};

export type NotificationDto = {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type ApplicationDto = {
  applicationId: number;
  institutionId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  educationLevel: string;
  selectedProgram?: string;
  message?: string;
  documentFileId?: number;
  documentFileName?: string;
  documentFileUrl?: string;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  institutionName?: string;
};

export type FileDto = {
  fileId: number;
  uploadedByUserId?: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  createdAt: string;
};

export type DashboardData = {
  user: UserDto;
  savedInstitutions: InstitutionDto[];
  applications: ApplicationDto[];
  notifications: NotificationDto[];
  recommendations: InstitutionDto[];
};

export type InstitutionProgramDto = {
  programId: number;
  institutionId: number;
  name: string;
  level?: string;
  description?: string;
  duration?: string;
  tuitionFee?: number;
  ects?: number;
};

export type InstitutionStaffDto = {
  staffId: number;
  institutionId: number;
  fullName: string;
  position?: string;
  photoFileId?: number;
};

export type InstitutionFacilityDto = {
  facilityId: number;
  institutionId: number;
  name: string;
  description?: string;
};

export type InstitutionDetailDto = {
  institutionDetailId: number;
  institutionId: number;
  ageGroups?: string;
  dailySchedule?: string;
  outdoorSpaces?: boolean;
  securityInfo?: string;
  gradesOffered?: string;
  curriculum?: string;
  extracurricularActivities?: string;
  classSize?: number;
  directions?: string;
  admissionInfo?: string;
  departments?: string;
  ectsInfo?: string;
  exchangePrograms?: string;
};

export type InstitutionAnnouncementDto = {
  announcementId: number;
  institutionId: number;
  title: string;
  content?: string;
  createdAt: string;
};

export type DailyViewDto = {
  date: string;
  views: number;
};

export type InstitutionAnalyticsDto = {
  institutionId: number;
  from: string;
  totalViews: number;
  uniqueAuthenticatedUsers: number;
  dailyViews: DailyViewDto[];
};

export type InstitutionFullDetailsDto = {
  institution: InstitutionDto;
  details?: InstitutionDetailDto;
  programs: InstitutionProgramDto[];
  staff: InstitutionStaffDto[];
  facilities: InstitutionFacilityDto[];
  reviews: ReviewDto[];
  announcements: InstitutionAnnouncementDto[];
};

export type AdminDashboardData = {
  user: UserDto;
  users: UserDto[];
  institutions: InstitutionDto[];
  institutionTypes: InstitutionTypeDto[];
  reviews: ReviewDto[];
  applications: ApplicationDto[];
};
