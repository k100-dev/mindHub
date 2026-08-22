import { addMinutes, areIntervalsOverlapping, isAfter, isBefore } from "date-fns";

export const appointmentStatuses = [
  "RESERVADO_TEMPORARIAMENTE",
  "AGUARDANDO_SINAL",
  "CONFIRMADO",
  "REALIZADO",
  "CANCELADO",
  "REMARCADO",
  "EXPIRADO",
  "NO_SHOW",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const blockingStatuses: AppointmentStatus[] = [
  "RESERVADO_TEMPORARIAMENTE",
  "AGUARDANDO_SINAL",
  "CONFIRMADO",
];

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  RESERVADO_TEMPORARIAMENTE: ["AGUARDANDO_SINAL", "EXPIRADO", "CANCELADO"],
  AGUARDANDO_SINAL: ["CONFIRMADO", "EXPIRADO", "CANCELADO"],
  CONFIRMADO: ["REALIZADO", "CANCELADO", "REMARCADO", "NO_SHOW"],
  REALIZADO: [],
  CANCELADO: [],
  REMARCADO: [],
  EXPIRADO: [],
  NO_SHOW: [],
};

export function canTransition(from: AppointmentStatus, to: AppointmentStatus) {
  return transitions[from].includes(to);
}

export function createHoldExpiration(now = new Date(), minutes = 15) {
  return addMinutes(now, minutes);
}

export type TimeInterval = { start: Date; end: Date };

export function hasConflict(candidate: TimeInterval, existing: TimeInterval[]) {
  return existing.some((interval) =>
    areIntervalsOverlapping(candidate, interval, { inclusive: false }),
  );
}

export function generateSlots({
  date,
  startHour,
  endHour,
  durationMinutes,
  busy = [],
  now = new Date(),
}: {
  date: Date;
  startHour: number;
  endHour: number;
  durationMinutes: number;
  busy?: TimeInterval[];
  now?: Date;
}) {
  const slots: TimeInterval[] = [];
  const cursor = new Date(date);
  cursor.setHours(startHour, 0, 0, 0);
  const endOfWindow = new Date(date);
  endOfWindow.setHours(endHour, 0, 0, 0);

  while (isBefore(cursor, endOfWindow)) {
    const end = addMinutes(cursor, durationMinutes);
    if (isAfter(end, endOfWindow)) break;
    const candidate = { start: new Date(cursor), end };
    if (isAfter(candidate.start, now) && !hasConflict(candidate, busy)) {
      slots.push(candidate);
    }
    cursor.setTime(end.getTime());
  }

  return slots;
}
