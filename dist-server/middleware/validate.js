/**
 * İstek gövdesini zod şemasıyla doğrular ve ayrıştırılmış veriyi
 * `req.body`e yazar. Hata durumunda ZodError fırlar; `errorHandler`
 * bunu alan bazlı mesajlara çevirir.
 */
export function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success)
            return next(result.error);
        req.body = result.data;
        next();
    };
}
/** Sorgu parametrelerini doğrular. */
export function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success)
            return next(result.error);
        // Express 4'te req.query yazılabilir; ayrıştırılmış hâlini sakla.
        req.validatedQuery = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map