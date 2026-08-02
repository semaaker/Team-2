import { env } from '../config/env.js';
import { delay } from '../utils/helpers.js';
/**
 * Geliştirme ortamında her isteğe küçük bir gecikme ekler.
 *
 * Amaç, arayüzdeki yükleniyor/iskelet durumlarının gerçek koşullarda da
 * doğru göründüğünü doğrulamak. `API_LATENCY_MS=0` ile kapatılabilir;
 * üretimde varsayılan olarak devre dışıdır.
 */
export const simulateLatency = (_req, _res, next) => {
    if (env.API_LATENCY_MS <= 0)
        return next();
    void delay(env.API_LATENCY_MS).then(() => next());
};
//# sourceMappingURL=latency.js.map