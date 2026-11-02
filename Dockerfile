# --- Stage 1: Build & Dependencies ---
FROM node:18-alpine AS builder

# Work directory for the application
WORKDIR /napa/app

# Copy package files first to leverage Docker caching
COPY app/package*.json ./

# Install ALL dependencies (including devDependencies if needed for building)
RUN npm ci

# Copy the rest of the application files
COPY ./app ./

# (Optional) If you have a build step (like TypeScript or Next.js), uncomment the line below:
# RUN npm run build

# Prune node_modules to remove development dependencies
RUN npm prune --production


# --- Stage 2: Final Production Image ---
# 1. Copy app files from builder stage
FROM node:18-alpine AS runner

# Work directory for the application
WORKDIR /napa/app

# Set environment to production
ENV NODE_ENV=production

# Copy ONLY the necessary application files from the builder stage
COPY --from=builder /napa/app/package*.json ./
COPY --from=builder /napa/app/node_modules ./node_modules
COPY --from=builder /napa/app ./

# 2. Secure Permissions:
# This ensures the 'node' user cannot delete or overwrite these files.
RUN chown -R node:node /napa/app && \
    chmod 755 /napa/app && \
    chmod 444 /napa/app/server.js /napa/app/package.json

# 3. Switch to the built-in non-root 'node' user
USER node

# Expose port and start the application
EXPOSE 3000


# 5. Apply a strict umask (0222) before launching the app
# This forces every uploaded image file to be created as strictly READ-ONLY (444).
# Because the file itself loses write permissions, it prevents accidental modifications.
CMD ["sh", "-c", "umask 002 && npm run start"]