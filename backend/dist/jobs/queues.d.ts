export declare const processScoreCalculation: (matchId: string) => Promise<{
    success: boolean;
    matchId: string;
}>;
export declare const processLeaderboardGeneration: (type: "top" | "daily" | "community") => Promise<{
    success: boolean;
    type: "community" | "top" | "daily";
}>;
export declare const scheduleScoreCalculation: (matchId: string, _delayMs?: number) => Promise<{
    success: boolean;
    matchId: string;
}>;
export declare const scheduleLeaderboardGeneration: (type: "top" | "daily" | "community") => Promise<{
    success: boolean;
    type: "community" | "top" | "daily";
}>;
//# sourceMappingURL=queues.d.ts.map