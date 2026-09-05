import { z } from "zod";
import { appointmentStatuses } from "@/lib/domain/appointments";

const phone = z.string().regex(/^\+?[1-9]\d{9,14}$/, "Use telefone com DDI e DDD.");

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
  psychologistSlug: z.literal("dra-isadora-bezerra"),
  startsAt: z.iso.datetime({ offset: true }),
});

export const statusTransitionSchema = z.object({
  status: z.enum(appointmentStatuses),
  reason: z.string().trim().min(3).max(300),
});
