export type BotServer = { id: string; name: string };

/** 100 servers, mirroring the backend's server pool. */
export const allServers: BotServer[] = Array.from({ length: 100 }, (_, index) => ({
  id: `server${index + 1}`,
  name: `Server ${index + 1}`,
}));
