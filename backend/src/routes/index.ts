import { Express } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import tipeLeadRoutes from './tipe-lead.routes';
import leadRoutes from './lead.routes';
import contactRoutes from './contact.routes';
import assignmentRoutes from './assignment.routes';
import statusRoutes from './status.routes';
import activityRoutes from './activity.routes';
import auditTrailRoutes from './audit-trail.routes';
import evidenceRoutes from './evidence.routes';

export function registerRoutes(app: Express): void {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/lead-types', tipeLeadRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/leads/:leadId/contacts', contactRoutes);
  app.use('/api/leads/:leadId/assignments', assignmentRoutes);
  app.use('/api/leads/:leadId/status', statusRoutes);
  app.use('/api/leads/:leadId/activities', activityRoutes);
  app.use('/api/leads/:leadId/audit-trail', auditTrailRoutes);
  app.use('/api', evidenceRoutes);
}
