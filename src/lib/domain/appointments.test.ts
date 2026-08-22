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
    const date = new Date("2026-08-24T12:00:00Z");
    const busy = [{
      start: new Date("2026-08-24T14:00:00Z"),
      end: new Date("2026-08-24T15:00:00Z"),
    }];
    const slots = generateSlots({
      date,
      startHour: 9,
      endHour: 12,
      durationMinutes: 60,
      busy,
      now: new Date("2026-08-23T00:00:00Z"),
    });
    expect(slots.length).toBe(2);
  });
});
