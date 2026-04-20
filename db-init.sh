#!/bin/bash
# MongoDB initialization script for replica set and keyfile setup
#
# This script:
# 1. Generates keyfile for replica set authentication (if USE_KEYFILE=true)
# 2. Starts MongoDB with replica set configuration
# 3. Waits for MongoDB to be ready
# 4. Initializes the replica set (rs0)
#
# Environment variables:
# - USE_KEYFILE: Set to "true" to enable keyfile generation (production mode)
#
set -e

KEYFILE_PATH="/data/mongo-keyfile"
USE_KEYFILE=${USE_KEYFILE:-false}

# Reuse authenticated mongosh calls when root credentials are available.
MONGOSH_ARGS=(--quiet)
if [ -n "${MONGO_INITDB_ROOT_USERNAME:-}" ] && [ -n "${MONGO_INITDB_ROOT_PASSWORD:-}" ]; then
  MONGOSH_ARGS+=(--username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "admin")
fi

# Generate keyfile if required (production mode)
if [ "$USE_KEYFILE" = "true" ]; then
  if [ ! -f "$KEYFILE_PATH" ]; then
    echo "Generating MongoDB keyfile..."
    openssl rand -base64 756 > "$KEYFILE_PATH"
    chmod 400 "$KEYFILE_PATH"
    chown mongodb:mongodb "$KEYFILE_PATH"
    echo "Keyfile generated successfully"
  else
    echo "Keyfile already exists"
    chmod 400 "$KEYFILE_PATH"
    chown mongodb:mongodb "$KEYFILE_PATH"
  fi
fi

# Start MongoDB in background
echo "Starting MongoDB..."
if [ "$USE_KEYFILE" = "true" ]; then
  docker-entrypoint.sh mongod --replSet rs0 --keyFile "$KEYFILE_PATH" --bind_ip_all &
else
  docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all &
fi

MONGO_PID=$!

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
until mongosh "${MONGOSH_ARGS[@]}" --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done

echo "MongoDB is ready. Initializing replica set..."

# Initialize replica set
mongosh "${MONGOSH_ARGS[@]}" --eval "
  const maxAttempts = 30;
  let attempts = 0;
  
  function initReplicaSet() {
    if (attempts >= maxAttempts) {
      print('Failed to initialize replica set after ' + maxAttempts + ' attempts');
      quit(1);
    }
    
    try {
      var status = rs.status();
      print('Replica set already initialized');
      return;
    } catch (error) {
      // Not initialized, proceed
    }
    
    try {
      rs.initiate({
        _id: 'rs0',
        members: [
          {
            _id: 0,
            host: 'mongo:27017'
          }
        ]
      });
      print('Replica set initialized successfully');
    } catch (error) {
      attempts++;
      print('Attempt ' + attempts + ': ' + error.message);
      sleep(1000);
      initReplicaSet();
    }
  }
  
  initReplicaSet();
"

echo "Setup complete. MongoDB is running with replica set rs0"

# Keep MongoDB running in foreground
wait $MONGO_PID
