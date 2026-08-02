/**
 * Async route handler'larındaki reddedilen promise'leri Express hata
 * middleware'ine iletir. Express 4, async fonksiyonların hatalarını
 * kendiliğinden yakalamaz.
 */
export function asyncHandler(handler) {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
//# sourceMappingURL=asyncHandler.js.map