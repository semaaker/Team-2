import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { eventRoutes, proposalRoutes } from './eventRoutes.js';
import { dealRoutes, matchRoutes, milestoneRoutes, sponsorProfileRoutes, sponsorshipRoutes, } from './sponsorRoutes.js';
import { conversationRoutes } from './messageRoutes.js';
import { billingRoutes } from './billingRoutes.js';
import { settingsRoutes } from './settingsRoutes.js';
import { legalRoutes, statsRoutes, supportRoutes } from './contentRoutes.js';
import { aiRoutes } from './aiRoutes.js';
/** Tüm API uçlarının kökü — `/api` altına bağlanır. */
export const apiRoutes = Router();
apiRoutes.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/ai', aiRoutes);
apiRoutes.use('/events', eventRoutes);
apiRoutes.use('/proposals', proposalRoutes);
apiRoutes.use('/matches', matchRoutes);
apiRoutes.use('/sponsorships', sponsorshipRoutes);
apiRoutes.use('/milestones', milestoneRoutes);
apiRoutes.use('/deals', dealRoutes);
apiRoutes.use('/sponsors', sponsorProfileRoutes);
apiRoutes.use('/conversations', conversationRoutes);
apiRoutes.use('/billing', billingRoutes);
apiRoutes.use('/settings', settingsRoutes);
apiRoutes.use('/legal', legalRoutes);
apiRoutes.use('/support', supportRoutes);
apiRoutes.use('/stats', statsRoutes);
//# sourceMappingURL=index.js.map