export declare const config: {
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    google: {
        clientId: string | undefined;
        clientSecret: string | undefined;
    };
    instagram: {
        clientId: string | undefined;
        clientSecret: string | undefined;
    };
    server: {
        port: number;
        nodeEnv: string;
        frontendUrl: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
};
//# sourceMappingURL=index.d.ts.map