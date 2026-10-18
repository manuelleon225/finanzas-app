export type SuggestionHistoryItem = {
  note: string | null;
  categoryId: string | null;
  type: string;
  occurredOn: string;
  amount: number;
  accountId?: string | null;
};

export type SuggestedCategory = {
  categoryId: string;
  score: number;
};

export type FrequentTransaction = {
  type: string;
  categoryId: string;
  amount: number;
  note: string;
  accountId: string | null;
  count: number;
};

const STOP_WORDS = new Set([
  'de',
  'del',
  'la',
  'las',
  'el',
  'los',
  'con',
  'por',
  'para',
  'una',
  'uno',
  'que',
  'mis',
  'mi',
  'y',
  'en',
  'al',
]);

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeText(text: string): string[] {
  if (typeof text !== 'string') {
    return [];
  }

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const words = normalized.length === 0 ? [] : normalized.split(/\s+/);

  return words.filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function shiftISODate(date: string, offsetDays: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day) + offsetDays * DAY_MS);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function uniqueWords(words: string[]): Set<string> {
  return new Set(words);
}

export function suggestCategories({
  note,
  history,
  categories,
  type,
  today,
}: {
  note: string;
  history: SuggestionHistoryItem[];
  categories: { id: string; is_archived?: boolean }[];
  type: string;
  today: string;
}): SuggestedCategory[] {
  const currentWords = normalizeText(note);
  if (currentWords.length === 0) {
    return [];
  }

  const currentSet = uniqueWords(currentWords);
  const cutoff = shiftISODate(today, -179);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const scores = new Map<string, number>();
  const latestByCategory = new Map<string, string>();

  for (const item of history) {
    if (item.type !== type) {
      continue;
    }
    if (item.occurredOn < cutoff || item.occurredOn > today) {
      continue;
    }
    if (!item.categoryId) {
      continue;
    }
    const category = categoryById.get(item.categoryId);
    if (!category || category.is_archived) {
      continue;
    }

    const itemWords = normalizeText(item.note ?? '');
    const itemSet = uniqueWords(itemWords);
    let matches = 0;
    for (const word of currentSet) {
      if (itemSet.has(word)) {
        matches += 1;
      }
    }
    if (matches === 0) {
      continue;
    }

    const previous = scores.get(item.categoryId) ?? 0;
    scores.set(item.categoryId, previous + matches * 3);

    const previousLatest = latestByCategory.get(item.categoryId);
    if (!previousLatest || item.occurredOn > previousLatest) {
      latestByCategory.set(item.categoryId, item.occurredOn);
    }
  }

  const total = Array.from(scores.values()).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return [];
  }

  const result = Array.from(scores.entries()).map(([categoryId, score]) => ({
    categoryId,
    score,
    latest: latestByCategory.get(categoryId) ?? '',
  }));

  result.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.latest.localeCompare(a.latest);
  });

  return result.slice(0, 3).map(({ categoryId, score }) => ({ categoryId, score }));
}

export function getFrequentTransactions({
  history,
  today,
  limit = 3,
}: {
  history: SuggestionHistoryItem[];
  today: string;
  limit?: number;
}): FrequentTransaction[] {
  const cutoff = shiftISODate(today, -59);

  const groups = new Map<
    string,
    {
      type: string;
      categoryId: string;
      amount: number;
      note: string;
      normalizedNote: string;
      accountId: string | null;
      count: number;
      latest: string;
    }
  >();

  for (const item of history) {
    if (item.type !== 'expense' && item.type !== 'income') {
      continue;
    }
    if (item.occurredOn < cutoff || item.occurredOn > today) {
      continue;
    }
    if (!item.categoryId) {
      continue;
    }

    const normalizedNote = normalizeText(item.note ?? '').join(' ');
    const key = `${item.type}|${item.categoryId}|${item.amount}|${normalizedNote}`;

    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      if (item.occurredOn > existing.latest) {
        existing.latest = item.occurredOn;
        existing.accountId = item.accountId ?? existing.accountId;
        existing.note = item.note ?? existing.note;
      }
    } else {
      groups.set(key, {
        type: item.type,
        categoryId: item.categoryId,
        amount: item.amount,
        note: item.note ?? '',
        normalizedNote,
        accountId: item.accountId ?? null,
        count: 1,
        latest: item.occurredOn,
      });
    }
  }

  const result = Array.from(groups.values())
    .filter((group) => group.count >= 2)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.latest.localeCompare(a.latest);
    })
    .slice(0, limit)
    .map(({ type, categoryId, amount, note, accountId, count }) => ({
      type,
      categoryId,
      amount,
      note,
      accountId,
      count,
    }));

  return result;
}
