// Create exporter user for MongoDB monitoring
db = db.getSiblingDB('admin');

db.createUser({
  user: 'exporter',
  pwd: 'exporter123',
  roles: [
    { role: 'clusterMonitor', db: 'admin' },
    { role: 'read', db: 'local' }
  ]
});

print('MongoDB exporter user created successfully');