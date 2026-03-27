"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }));
    await app.register(require('@fastify/helmet'));
    await app.register(require('@fastify/compress'));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL ?? 'http://localhost:3000',
            process.env.BACKOFFICE_URL ?? 'http://localhost:3001',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const port = parseInt(process.env.PORT ?? '4000');
    await app.listen(port, '0.0.0.0');
    console.log(`MiDefensaPeru API running on http://localhost:${port}/api/v1`);
}
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map