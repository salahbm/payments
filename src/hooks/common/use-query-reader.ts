import { useSearchParams } from 'next/navigation';

type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';

interface ParamConfig<T = unknown> {
  type: ParamType;
  defaultValue?: T;
  transform?: (value: string) => T;
}

type Configs = Record<string, ParamConfig>;

export function useQueryReader<C extends Configs>(
  configs: C,
): {
  [K in keyof C]: C[K]['defaultValue'] extends undefined
    ? unknown
    : C[K]['defaultValue'];
} {
  const searchParams = useSearchParams();
  const result = {} as Record<string, unknown>;

  const parseValue = (raw: string, type: ParamType) => {
    switch (type) {
      case 'number':
        return Number(raw);
      case 'boolean':
        return raw === 'true';
      case 'array':
        return raw.split(',');
      case 'object':
        return JSON.parse(raw);
      case 'date':
        return new Date(raw);
      default:
        return raw;
    }
  };

  for (const key in configs) {
    const { type, defaultValue, transform } = configs[key];
    const raw = searchParams?.get(key);
    if (!raw) {
      result[key] = defaultValue;
      continue;
    }

    try {
      let parsed = parseValue(raw, type);
      if (transform) parsed = transform(raw);
      result[key] = parsed ?? defaultValue;
    } catch (err) {
      console.error(`Failed to parse "${key}":`, err);
      result[key] = defaultValue;
    }
  }

  return result as {
    [K in keyof C]: C[K]['defaultValue'] extends undefined
      ? unknown
      : C[K]['defaultValue'];
  };
}
