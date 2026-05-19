FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/EduKos.Domain/EduKos.Domain.csproj src/EduKos.Domain/
COPY src/EduKos.Application/EduKos.Application.csproj src/EduKos.Application/
COPY src/EduKos.Infrastructure/EduKos.Infrastructure.csproj src/EduKos.Infrastructure/
COPY src/EduKos.API/EduKos.API.csproj src/EduKos.API/
RUN dotnet restore src/EduKos.API/EduKos.API.csproj

COPY src/ src/
RUN dotnet publish src/EduKos.API/EduKos.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "EduKos.API.dll"]
