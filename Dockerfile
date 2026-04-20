# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj first — restores packages in a cached layer (faster rebuilds)
COPY JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj ./JapaneseFlashcardAPI/
RUN dotnet restore ./JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj

# Copy all source and publish Release build
COPY JapaneseFlashcardAPI/ ./JapaneseFlashcardAPI/
RUN dotnet publish ./JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: Runtime (smaller image, no SDK) ───────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published API
COPY --from=build /app/publish .

# Copy the frontend static files into the image
COPY frontend/ ./frontend/

# ── Environment ────────────────────────────────────────────────────────────────
ENV ASPNETCORE_URLS=http://+:8080
ENV FRONTEND_PATH=/app/frontend
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "JapaneseFlashcardAPI.dll"]
