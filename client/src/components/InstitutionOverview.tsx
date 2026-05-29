import { useEffect, useState } from "react";
import {
  getMyInstitutionProfile,
  getMyPrograms,
  getMyStaff,
  getMyFacilities,
  getMyAnnouncements,
  type InstitutionDto,
  type InstitutionProgramDto,
  type InstitutionStaffDto,
  type InstitutionFacilityDto,
  type InstitutionAnnouncementDto,
} from "../lib/api";

export default function InstitutionOverview() {
  const [institution, setInstitution] = useState<InstitutionDto | null>(null);
  const [programs, setPrograms] = useState<InstitutionProgramDto[]>([]);
  const [staff, setStaff] = useState<InstitutionStaffDto[]>([]);
  const [facilities, setFacilities] = useState<InstitutionFacilityDto[]>([]);
  const [announcements, setAnnouncements] = useState<InstitutionAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [profileData, programsData, staffData, facilitiesData, announcementsData] =
        await Promise.all([
          getMyInstitutionProfile(),
          getMyPrograms(),
          getMyStaff(),
          getMyFacilities(),
          getMyAnnouncements(),
        ]);

      setInstitution(profileData);
      setPrograms(programsData);
      setStaff(staffData);
      setFacilities(facilitiesData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error("Failed to load overview data", err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "";
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading overview...</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-red-500">No institution found</p>
      </div>
    );
  }

  const stats = [
    { label: "Programs", value: programs.length, color: "bg-blue-500" },
    { label: "Staff Members", value: staff.length, color: "bg-green-500" },
    { label: "Facilities", value: facilities.length, color: "bg-purple-500" },
    { label: "Announcements", value: announcements.length, color: "bg-orange-500" },
  ];

  const recentAnnouncements = [...announcements]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">{institution.name}</h1>
        <p className="text-blue-100 mt-1">
          {institution.city} • {institution.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
        </p>
        {institution.description && (
          <p className="mt-3 text-blue-50 text-sm">{institution.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">{stat.label}</span>
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {recentAnnouncements.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h2 className="font-bold text-lg mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {recentAnnouncements.map((ann) => (
              <div key={ann.announcementId} className="border-l-4 border-orange-400 pl-4 py-2">
                <h3 className="font-semibold">{ann.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{ann.content}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(ann.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {institution.email && (
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <a href={`mailto:${institution.email}`} className="text-blue-600">
                {institution.email}
              </a>
            </div>
          )}
          {institution.phone && (
            <div>
              <span className="text-gray-500">Phone:</span> {institution.phone}
            </div>
          )}
          {institution.website && (
            <div>
              <span className="text-gray-500">Website:</span>{" "}
              <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                {institution.website}
              </a>
            </div>
          )}
          {institution.address && (
            <div className="col-span-2">
              <span className="text-gray-500">Address:</span> {institution.address}, {institution.city}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}