// Máscaras e validação de data/hora digitadas (formato brasileiro).
// Dígitos inválidos são ignorados na digitação (ex.: 30:89 não é aceito).

function formatDateFromDigits(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTimeFromDigits(digits: string): string {
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Aceita só dígitos que formam dia válido (01–31) enquanto digita. */
function sanitizeDateDigits(raw: string): string {
  let valid = "";

  for (const d of raw.replace(/\D/g, "")) {
    const len = valid.length;

    if (len === 0) {
      if (d <= "3") valid += d;
    } else if (len === 1) {
      const d1 = valid[0];
      if (d1 === "0" && d >= "1") valid += d;
      else if (d1 >= "1" && d1 <= "2") valid += d;
      else if (d1 === "3" && d <= "1") valid += d;
    } else if (len === 2) {
      if (d <= "1") valid += d;
    } else if (len === 3) {
      const m1 = valid[2];
      if (m1 === "0" && d >= "1") valid += d;
      else if (m1 === "1" && d <= "2") valid += d;
    } else if (len >= 4 && len <= 7) {
      valid += d;
    }

    if (valid.length >= 8) break;
  }

  return valid;
}

/** Aceita só dígitos que formam hora 00–23 e minuto 00–59. */
function sanitizeTimeDigits(raw: string): string {
  let valid = "";

  for (const d of raw.replace(/\D/g, "")) {
    const len = valid.length;

    if (len === 0) {
      if (d <= "2") valid += d;
    } else if (len === 1) {
      const h1 = valid[0];
      if (h1 === "2" && d <= "3") valid += d;
      else if (h1 !== "2") valid += d;
    } else if (len === 2) {
      if (d <= "5") valid += d;
    } else if (len === 3) {
      valid += d;
    }

    if (valid.length >= 4) break;
  }

  return valid;
}

/** Mantém só dígitos válidos e aplica máscara DD/MM/AAAA. */
export function maskDateBR(value: string): string {
  return formatDateFromDigits(sanitizeDateDigits(value));
}

/** Mantém só dígitos válidos e aplica máscara HH:MM. */
export function maskTimeBR(value: string): string {
  return formatTimeFromDigits(sanitizeTimeDigits(value));
}

export function isCompleteDateBR(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

export function isCompleteTimeBR(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

export type DateTimeValidation =
  | { ok: true; date: Date }
  | { ok: false; message: string };

/** Valida data e hora completas e retorna um Date local. */
export function parseAppointmentDateTime(
  dateBR: string,
  timeBR: string
): DateTimeValidation {
  if (!isCompleteDateBR(dateBR)) {
    return { ok: false, message: "Informe a data completa (DD/MM/AAAA)." };
  }
  if (!isCompleteTimeBR(timeBR)) {
    return { ok: false, message: "Informe o horário completo (HH:MM)." };
  }

  const [dayStr, monthStr, yearStr] = dateBR.split("/");
  const [hourStr, minuteStr] = timeBR.split(":");

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);

  if (month < 1 || month > 12) {
    return { ok: false, message: "Mês inválido (use 01 a 12)." };
  }
  if (day < 1 || day > 31) {
    return { ok: false, message: "Dia inválido (use 01 a 31)." };
  }
  if (hours > 23) {
    return { ok: false, message: "Hora inválida (use 00 a 23)." };
  }
  if (minutes > 59) {
    return { ok: false, message: "Minutos inválidos (use 00 a 59)." };
  }

  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return { ok: false, message: "Data inexistente no calendário." };
  }

  if (parsed.getTime() <= Date.now()) {
    return { ok: false, message: "O horário deve ser no futuro." };
  }

  return { ok: true, date: parsed };
}

export function validateClientName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Informe o nome do cliente (mínimo 2 caracteres).";
  }
  if (trimmed.length > 80) {
    return "Nome do cliente muito longo (máximo 80 caracteres).";
  }
  return null;
}
