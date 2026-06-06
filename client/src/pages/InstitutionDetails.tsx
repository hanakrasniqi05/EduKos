import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import Footer from "../sections/Footer";
import {
  getInstitutionFullDetails,
  type InstitutionAnnouncementDto,
  type InstitutionFacilityDto,
  type InstitutionFullDetailsDto,
  type InstitutionProgramDto,
  type InstitutionStaffDto,
  type ReviewDto,
} from "../lib/api";
import ContactButton from "../components/rtc/ContactButton";

const formatMoney = (value?: number) => {
  if (value === undefined || value === null) return "Pa tarife";

  return new Intl.NumberFormat("sq-XK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

const ratingValue = (review: ReviewDto) => {
  const values = [
    review.teachingQualityRating,
    review.facilitiesRating,
    review.difficultyRating,
    review.staffRating,
  ].filter((value): value is number => typeof value === "number");

  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const averageRating = (reviews: ReviewDto[]) => {
  if (!reviews.length) return 0;

  return reviews.reduce((sum, review) => sum + ratingValue(review), 0) / reviews.length;
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="rounded-lg border border-emerald-100 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-gray-900">{value || "Nuk eshte specifikuar"}</p>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-lg border border-dashed border-emerald-200 bg-white p-6 text-sm text-gray-500">
    {text}
  </div>
);

const InstitutionDetails: React.FC = () => {
  const { institutionId } = useParams();
  const [details, setDetails] = useState<InstitutionFullDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const parsedInstitutionId = Number(institutionId);
  const hasValidInstitutionId =
    Number.isFinite(parsedInstitutionId) && parsedInstitutionId > 0;

  useEffect(() => {
    let ignore = false;
    if (!hasValidInstitutionId) return;

    queueMicrotask(() => {
      if (ignore) return;
      setLoading(true);
      setError("");
    });

    getInstitutionFullDetails(parsedInstitutionId)
      .then((data) => {
        if (!ignore) setDetails(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Detajet nuk mund te ngarkohen.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [hasValidInstitutionId, parsedInstitutionId]);

  const average = useMemo(() => averageRating(details?.reviews ?? []), [details]);

  if (loading && hasValidInstitutionId) {
    return (
      <main className="min-h-screen bg-[#f7fbf3] px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-72 rounded-lg bg-emerald-100" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="h-40 rounded-lg bg-white" />
            <div className="h-40 rounded-lg bg-white" />
            <div className="h-40 rounded-lg bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!hasValidInstitutionId || error || !details) {
    return (
      <main className="min-h-screen bg-[#f7fbf3] px-5 py-16 md:px-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">Detajet nuk u gjeten</h1>
          <p className="mt-3 text-gray-600">
            {!hasValidInstitutionId
              ? "Institucioni nuk u gjet."
              : error || "Institucioni nuk ekziston."}
          </p>
          <Link className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white" to="/">
            Kthehu ne fillim
          </Link>
        </div>
      </main>
    );
  }

  const { institution } = details;
  const location = [institution.address, institution.city].filter(Boolean).join(", ");
  const website = institution.website?.startsWith("http")
    ? institution.website
    : institution.website
      ? `https://${institution.website}`
      : null;

  return (
    <main className="min-h-screen bg-[#f7fbf3]">
      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-10 lg:grid-cols-[1.4fr_0.8fr] lg:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              {institution.institutionTypeName ?? "Institucion"}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold text-gray-950 md:text-6xl">
              {institution.name}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 md:text-lg">
              {institution.description || "Ky institucion ende nuk ka shtuar pershkrim te detajuar."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/apply?institutionId=${institution.institutionId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                <GraduationCap size={18} />
                Apliko tani
              </Link>
              <ContactButton institutionId={institution.institutionId} />
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  <Building2 size={18} />
                  Website
                </a>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-emerald-100 bg-[#f7fbf3] p-5">
            <div className="grid gap-3">
              <ContactRow icon={<MapPin size={18} />} label="Lokacioni" value={location || institution.location} />
              <ContactRow icon={<Phone size={18} />} label="Telefoni" value={institution.phone} />
              <ContactRow icon={<Mail size={18} />} label="Email" value={institution.email} />
              <ContactRow
                icon={<Star size={18} />}
                label="Vleresimi"
                value={details.reviews.length ? `${average.toFixed(1)} nga 5 (${details.reviews.length})` : "Pa vleresime"}
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <Section title="Informata kryesore" icon={<BookOpen size={20} />}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Qyteti" value={institution.city} />
              <InfoItem label="Adresa" value={institution.address || institution.location} />
              <InfoItem label="Orari" value={details.details?.dailySchedule} />
              <InfoItem label="Grupmoshat / klasat" value={details.details?.ageGroups || details.details?.gradesOffered} />
              <InfoItem label="Kurrikula" value={details.details?.curriculum} />
              <InfoItem label="Madhesia e klases" value={details.details?.classSize} />
            </div>
          </Section>

          <Section title="Programet dhe tarifat" icon={<GraduationCap size={20} />}>
            {details.programs.length ? (
              <div className="grid gap-4">
                {details.programs.map((program) => (
                  <ProgramCard key={program.programId} program={program} />
                ))}
              </div>
            ) : (
              <EmptyState text="Ky institucion ende nuk ka publikuar programe." />
            )}
          </Section>

          <Section title="Stafi" icon={<UsersRound size={20} />}>
            {details.staff.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {details.staff.map((staff) => (
                  <StaffCard key={staff.staffId} staff={staff} />
                ))}
              </div>
            ) : (
              <EmptyState text="Stafi nuk eshte publikuar ende." />
            )}
          </Section>

          <Section title="Objektet dhe facilitetet" icon={<Building2 size={20} />}>
            {details.facilities.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {details.facilities.map((facility) => (
                  <FacilityCard key={facility.facilityId} facility={facility} />
                ))}
              </div>
            ) : (
              <EmptyState text="Nuk ka facilitet te publikuar per kete institucion." />
            )}
          </Section>

          <Section title="Vleresimet" icon={<Star size={20} />}>
            {details.reviews.length ? (
              <div className="grid gap-4">
                {details.reviews.map((review) => (
                  <ReviewCard key={review.reviewId} review={review} />
                ))}
              </div>
            ) : (
              <EmptyState text="Ende nuk ka vleresime nga perdoruesit." />
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950">
              <Bell size={20} className="text-emerald-700" />
              Njoftime
            </h2>
            <div className="mt-4 space-y-4">
              {details.announcements.length ? (
                details.announcements.map((announcement) => (
                  <AnnouncementItem key={announcement.announcementId} announcement={announcement} />
                ))
              ) : (
                <p className="text-sm text-gray-500">Nuk ka njoftime aktive.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Pranimi</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {details.details?.admissionInfo || "Informacionet e pranimit nuk jane publikuar ende."}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Siguria dhe hapesirat</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {details.details?.securityInfo || "Nuk ka informata te shtuara per sigurine."}
            </p>
            <p className="mt-4 text-sm font-semibold text-gray-800">
              Hapesira te jashtme: {details.details?.outdoorSpaces ? "Po" : "Nuk eshte specifikuar"}
            </p>
          </div>
        </aside>
      </section>

      <Footer />
    </main>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold text-gray-950">
      <span className="text-emerald-700">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const ContactRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex gap-3 rounded-lg bg-white p-4">
    <span className="mt-0.5 text-emerald-700">{icon}</span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value || "Nuk eshte specifikuar"}</p>
    </div>
  </div>
);

const ProgramCard = ({ program }: { program: InstitutionProgramDto }) => (
  <article className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{program.level || "Program"}</p>
        <h3 className="mt-1 text-xl font-bold text-gray-950">{program.name}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {program.description || "Pershkrimi i programit nuk eshte shtuar ende."}
        </p>
      </div>
      <div className="grid min-w-48 gap-2 text-sm">
        <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-800">
          <Banknote size={16} />
          {formatMoney(program.tuitionFee)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 font-semibold text-gray-700">
          <CalendarDays size={16} />
          {program.duration || "Kohezgjatja N/A"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 font-semibold text-gray-700">
          <BookOpen size={16} />
          {program.ects ? `${program.ects} ECTS` : "ECTS N/A"}
        </span>
      </div>
    </div>
  </article>
);

const StaffCard = ({ staff }: { staff: InstitutionStaffDto }) => (
  <article className="flex items-center gap-4 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
      <UserRound size={22} />
    </div>
    <div>
      <h3 className="font-bold text-gray-950">{staff.fullName}</h3>
      <p className="text-sm text-gray-600">{staff.position || "Pozita nuk eshte specifikuar"}</p>
    </div>
  </article>
);

const FacilityCard = ({ facility }: { facility: InstitutionFacilityDto }) => (
  <article className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
    <h3 className="font-bold text-gray-950">{facility.name}</h3>
    <p className="mt-2 text-sm leading-6 text-gray-600">
      {facility.description || "Nuk ka pershkrim per kete facilitet."}
    </p>
  </article>
);

const ReviewCard = ({ review }: { review: ReviewDto }) => {
  const rating = ratingValue(review);

  return (
    <article className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-amber-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={18} fill={star <= Math.round(rating) ? "currentColor" : "none"} />
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-600">{rating.toFixed(1)} / 5</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment || "Pa koment."}</p>
    </article>
  );
};

const AnnouncementItem = ({ announcement }: { announcement: InstitutionAnnouncementDto }) => (
  <article className="border-b border-emerald-100 pb-4 last:border-b-0 last:pb-0">
    <h3 className="font-bold text-gray-950">{announcement.title}</h3>
    <p className="mt-2 text-sm leading-6 text-gray-600">{announcement.content || "Pa permbajtje."}</p>
    <p className="mt-2 text-xs font-semibold text-gray-400">
      {new Date(announcement.createdAt).toLocaleDateString("sq-XK")}
    </p>
  </article>
);

export default InstitutionDetails;
