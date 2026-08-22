import { z } from "zod";
import { appointmentStatuses } from "@/lib/domain/appointments";

const phone = z.string().regex(/^\+?[1-9]\d{9,14}$/, "Use telefone com DDI e DDD.");

export const psychologistRegistrationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(72),
  phone,
  crp: z.string().trim().toUpperCase().regex(/^\d{2}\/\d{4,6}$/),
});

export const patientRegistrationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(72),
  phone,
});

export const patientSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone,
  birthDate: z.iso.date().optional(),
});

export const holdSchema = z.object({
  psychologistId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }),
});

export const statusTransitionSchema = z.object({
  status: z.enum(appointmentStatuses),
  reason: z.string().trim().min(3).max(300),
});
