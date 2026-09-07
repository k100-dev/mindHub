import { z } from "zod";
import { appointmentStatuses } from "@/lib/domain/appointments";

export const phone = z.string().transform((value) => { const digits = value.replace(/\D/g, ""); return digits.length === 10 || digits.length === 11 ? `+55${digits}` : `+${digits}`; }).pipe(z.string().regex(/^\+[1-9]\d{9,14}$/, "Informe um telefone válido com DDD."));

export const patientRegistrationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10, "A senha deve ter pelo menos 10 caracteres.").max(72),
  confirmation: z.string(),
  phone,
}).refine((value) => value.password === value.confirmation, { message: "As senhas não coincidem.", path: ["confirmation"] });

export const patientSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone,
  birthDate: z.iso.date().optional(),
});

export const holdSchema = z.object({
  psychologistSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  startsAt: z.iso.datetime({ offset: true }),
});

export const statusTransitionSchema = z.object({
  status: z.enum(appointmentStatuses),
  reason: z.string().trim().min(3).max(300),
});
