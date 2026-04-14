import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { checkLeadOwnership } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createContactSchema, updateContactSchema } from '../validators/contact.validator';
import { contactService } from '../services/contact.service';

const router = Router({ mergeParams: true });

// All routes require authentication + lead ownership check
router.use(authenticate);
router.use(checkLeadOwnership);

// POST / — Add Contact Person to Lead
router.post(
  '/',
  validate(createContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await contactService.create(req.params.leadId, req.body, req.user!.userId);
      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }
);

// GET / — List Contact Persons for a Lead
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contacts = await contactService.findByLead(req.params.leadId);
      res.status(200).json({ success: true, data: contacts });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /:id — Update Contact Person
router.put(
  '/:id',
  validate(updateContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await contactService.update(req.params.id, req.body, req.user!.userId);
      res.status(200).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
