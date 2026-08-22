import { describe, expect, it } from "vitest";
import {
  canTransition,
  createHoldExpiration,
  generateSlots,
  hasConflict,
} from "./appointments";

describe("regras de agendamento", () => {
  it("aceita somente transições previstas", () => {
    expect(canTransition("AGUARDANDO_SINAL", "CONFIRMADO")).toBe(true);
    expect(canTransition("REALIZADO", "CONFIRMADO")).toBe(false);
  });

  it("cria reserva temporária de 15 minutos", () => {
    const now = new Date("2026-08-22T12:00:00Z");
    expect(createHoldExpiration(now).toISOString()).toBe("2026-08-22T12:15:00.000Z");
  });

  it("detecta sobreposição sem bloquear intervalos adjacentes", () => {
    const existing = [{
      start: new Date("2026-08-24T12:00:00Z"),
      end: new Date("2026-08-24T13:00:00Z"),
    }];
    expect(hasConflict({
      start: new Date("2026-08-24T12:30:00Z"),
      end: new Date("2026-08-24T13:30:00Z"),
    }, existing)).toBe(true);
    expect(hasConflict({
      start: new Date("2026-08-24T13:00:00Z"),
      end: new Date("2026-08-24T14:00:00Z"),
    }, existing)).toBe(false);
  });

  it("remove horários ocupados ao gerar slots", () => {
    const date = new Date(2026, 7, 24);
    const busyStart = new Date(date);
    busyStart.setHours(10, 0, 0, 0);
    const busyEnd = new Date(date);
    busyEnd.setHours(11, 0, 0, 0);
    const now = new Date(date);
    now.setDate(now.getDate() - 1);
    const busy = [{
      start: busyStart,
      end: busyEnd,
    }];
    const slots = generateSlots({
      date,
      startHour: 9,
      endHour: 12,
      durationMinutes: 60,
      busy,
      now,
    });
    expect(slots.length).toBe(2);
  });
});
