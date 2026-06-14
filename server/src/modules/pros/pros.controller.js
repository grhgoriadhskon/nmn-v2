import * as prosService from './pros.service.js';

export function list(req, res, next) {
  try {
    res.json({ pros: prosService.getAllPros() });
  } catch (err) { next(err); }
}

export function get(req, res, next) {
  try {
    const pro = prosService.getProById(req.params.id);
    if (!pro) return res.status(404).json({ error: 'Pro not found' });
    res.json({ pro });
  } catch (err) { next(err); }
}

export function getMyProfile(req, res, next) {
  try {
    const pro = prosService.getProByUserId(req.user.id);
    if (!pro) return res.status(404).json({ error: 'Pro profile not found' });
    res.json({ pro });
  } catch (err) { next(err); }
}

export function updateMyProfile(req, res, next) {
  try {
    const pro = prosService.getProByUserId(req.user.id);
    if (!pro) return res.status(404).json({ error: 'Pro profile not found' });
    res.json({ pro: prosService.updatePro(pro.id, req.body) });
  } catch (err) { next(err); }
}

export function getWorkingHours(req, res, next) {
  try {
    res.json({ working_hours: prosService.getWorkingHours(req.params.id) });
  } catch (err) { next(err); }
}

export function getMyWorkingHours(req, res, next) {
  try {
    const pro = prosService.getProByUserId(req.user.id);
    if (!pro) return res.status(404).json({ error: 'Pro profile not found' });
    res.json({ working_hours: prosService.getWorkingHours(pro.id) });
  } catch (err) { next(err); }
}

export function setWorkingHours(req, res, next) {
  try {
    const pro = prosService.getProByUserId(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });
    const hours = prosService.setWorkingHours(pro.id, req.body.hours);
    res.json({ working_hours: hours });
  } catch (err) { next(err); }
}
