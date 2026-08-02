# n8n Akışları

Bu klasör, SponsorMatch AI'ın yapay zeka katmanını oluşturan n8n akışlarını içerir.
Akışlar Google Gemini (`gemini-2.5-flash`) modelini kullanır.

| Dosya                           | Akış                                | Tetikleyici                            | Ne yapar                                                                                         |
| ------------------------------- | ----------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `01-etkinlik-eslestirme.json`   | Etkinlik Eşleştirme Akışı           | `GET /webhook/etkinlikleri-getir`      | Airtable'daki etkinlikleri çeker, marka vizyonuna göre uyum oranı üretir.                        |
| `02-sponsor-degerlendirme.json` | Event Directory Paneli Akışları     | `POST /webhook/sponsor-match` + manuel | Sponsor profillerini analiz eder, sonucu Airtable'a geri yazar. Ayrıca PDF yükleme akışı içerir. |
| `03-sponsormatch-api.json`      | SponsorMatch API — Eşleştirme Skoru | `POST /webhook/sponsormatch-ai/score`  | **Uygulamanın doğrudan çağırdığı akış.** Airtable'a bağımlı değildir.                            |

## Uygulamayla entegrasyon

Backend yalnızca **`03-sponsormatch-api.json`** akışıyla konuşur. Diğer iki akış
Airtable tabanlı iç otomasyonlardır ve uygulamanın çalışması için gerekli değildir.

### Kurulum

1. n8n arayüzünde **Workflows → Import from File** ile `03-sponsormatch-api.json` dosyasını içe aktarın.
2. `Google Gemini Chat Model` düğümüne kendi Gemini API kimlik bilginizi bağlayın.
   (Dosyadaki `credentials.id` değeri yalnızca bir referanstır, sır içermez.)
3. Akışı **Active** duruma alın ve üretim webhook adresini kopyalayın.
4. Proje kökündeki `.env` dosyasına yazın:

   ```bash
   AI_WEBHOOK_URL=https://<n8n-alan-adiniz>/webhook/sponsormatch-ai/score
   AI_WEBHOOK_TOKEN=paylasilan-bir-sir   # isteğe bağlı
   AI_TIMEOUT_MS=8000
   ```

5. Sunucuyu yeniden başlatın. Doğrulama:

   ```bash
   curl http://localhost:4000/api/ai/status
   # {"provider":"n8n","configured":true,...}
   ```

### Sözleşme

Sunucunun gönderdiği gövde:

```json
{
  "sponsor": {
    "companyName": "Global Finans",
    "industry": "Finans & Fintech",
    "focusAreas": ["Fintech", "Dijital Ödemeler"],
    "esgGoals": ["2030 karbon nötr operasyon"],
    "brandVision": "…",
    "minBudget": 120000,
    "maxBudget": 3000000
  },
  "events": [
    {
      "id": "evt_fintech",
      "name": "FinTech Evrim Fuarı",
      "category": "Finans & Fintech",
      "description": "…",
      "attendees": 3000,
      "packages": [{ "tier": "Platin", "priceLabel": "$40k" }]
    }
  ]
}
```

Akıştan beklenen yanıt:

```json
{
  "results": [
    {
      "eventId": "evt_fintech",
      "uyum_orani": 87,
      "yapay_zeka_notu": "Etkinliğin katılımcı profili marka hedefleriyle örtüşüyor."
    }
  ]
}
```

`eventId` alanı istekteki `id` ile birebir aynı olmalıdır; tanınmayan kayıtlar yok sayılır.
Yanıt düz dizi (`[…]`) olarak da gelebilir, sunucu her iki biçimi kabul eder.

### Yedekleme davranışı

`AI_WEBHOOK_URL` tanımsızsa **ya da** akış hata verirse (zaman aşımı, 5xx, tanınmayan
gövde), sunucu `server/src/services/aiMatching.ts` içindeki deterministik kural
motoruna düşer. Aynı dört kriteri puanlar:

| Kriter                 | Ağırlık |
| ---------------------- | ------- |
| Sektör uyumu           | 40      |
| Vizyon & ESG örtüşmesi | 25      |
| Katılımcı ölçeği       | 20      |
| Bütçe uygunluğu        | 15      |

Bu sayede uygulama n8n olmadan da eksiksiz çalışır. Arayüzde hangi motorun
kullanıldığı "Yapay Zeka Eşleşmeleri" ekranındaki rozette gösterilir.

## Not

`01` ve `02` numaralı akışlar Airtable base kimlikleri içerir. Bunlar sır değildir
(erişim yine OAuth ile korunur) ancak kendi ortamınızda içe aktarırken kendi base ve
tablo kimliklerinizi seçmeniz gerekir.
