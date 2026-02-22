export type AppSettings = {
  enabled: boolean;
  host: string;
  modules: Record<string, { enabled: boolean }>;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};