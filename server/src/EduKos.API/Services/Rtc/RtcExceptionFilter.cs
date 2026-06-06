using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EduKos.API.Services.Rtc;

public sealed class RtcExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        context.Result = context.Exception switch
        {
            UnauthorizedAccessException => new ObjectResult(new { message = context.Exception.Message })
            {
                StatusCode = StatusCodes.Status403Forbidden
            },
            KeyNotFoundException => new NotFoundObjectResult(new { message = context.Exception.Message }),
            InvalidOperationException => new BadRequestObjectResult(new { message = context.Exception.Message }),
            _ => null
        };

        context.ExceptionHandled = context.Result != null;
    }
}
