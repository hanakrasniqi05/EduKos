namespace EduKos.Domain.Constants;

public static class RtcConversationTypes
{
    public const string StudentInstitution = "student_institution";
    public const string InstitutionAdmin = "institution_admin";
}

public static class RtcNotificationTypes
{
    public const string ConversationMessage = "conversation_message";
    public const string InstitutionMessage = "institution_message";
    public const string NewApplication = "new_application";
    public const string ApplicationStatus = "application_status";
    public const string InstitutionRegistration = "institution_registration";
    public const string InstitutionAnnouncement = "institution_announcement";
}

public static class RtcEventNames
{
    public const string ReceiveMessage = "rtc:receive_message";
    public const string ApplicationStatusUpdated = "rtc:application_status_updated";
    public const string AdminAlert = "rtc:admin_alert";
    public const string InstitutionAlert = "rtc:institution_alert";
    public const string NotificationCreated = "rtc:notification_created";
    public const string NotificationRead = "rtc:notification_read";
}
