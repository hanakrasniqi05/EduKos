import type { AdminDashboardData, DashboardData } from "./apiTypes";
import { getCurrentUser } from "./authApi";
import { getAllApplications, getMyApplications } from "./applicationsApi";
import {
  getInstitutions,
  getInstitutionTypes,
  getMySavedInstitutions,
  getRecommendations,
  getReviews,
} from "./institutionsApi";
import { getAllUsers, getMyNotifications } from "./usersApi";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [user, users, institutions, institutionTypes, reviews, applications] =
    await Promise.all([
      getCurrentUser(),
      getAllUsers(),
      getInstitutions(),
      getInstitutionTypes(),
      getReviews(),
      getAllApplications(),
    ]);

  return { user, users, institutions, institutionTypes, reviews, applications };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [user, savedInstitutions, applications, notifications, recommendations] =
    await Promise.all([
      getCurrentUser(),
      getMySavedInstitutions(),
      getMyApplications(),
      getMyNotifications(),
      getRecommendations(),
    ]);

  return {
    user,
    savedInstitutions,
    applications,
    notifications,
    recommendations: recommendations.slice(0, 4),
  };
}
