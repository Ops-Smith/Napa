# --- Stage 1: Build & Dependencies ---
# FIX: Upgraded to latest stable Node 24 alpine base
FROM node:24-alpine AS builder

# Work directory for the application
WORKDIR /napa/app

# Copy package files first to leverage Docker caching
COPY app/package*.json ./

# Install ALL dependencies
RUN npm install

# Copy the rest of the application files
COPY ./app ./

# Prune node_modules to remove development dependencies
RUN npm prune --production


# --- Stage 2: Final Production Image ---
# FIX: Upgraded runner stage to match builder engine version
FROM node:24-alpine AS runner

# Work directory for the application
WORKDIR /napa/app

# Set environment to production
ENV NODE_ENV=production

# Copy ONLY the necessary application files from the builder stage
COPY --from=builder /napa/app/package*.json ./
COPY --from=builder /napa/app/node_modules ./node_modules
COPY --from=builder /napa/app ./

# Secure Permissions
RUN chown -R node:node /napa/app && \
    chmod 755 /napa/app && \
    chmod 444 /napa/app/server.js /napa/app/package.json

# Switch to the built-in non-root 'node' user
USER node

# Expose port and start the application
EXPOSE 3000

# Apply strict mask execution setup
CMD ["sh", "-c", "umask 002 && npm run start"]