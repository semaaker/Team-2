import { formatTRY } from '../utils/helpers.js';
/**
 * Başlangıç verisi.
 *
 * İçerik, tasarım ekranlarındaki örnek verilerle birebir eşleşir; böylece
 * uygulama ilk açılışta tasarımdaki görünümü aynen üretir. Görsel URL'leri
 * tasarımdaki kaynaklardan gelir ve erişilemediğinde istemci tarafında
 * degrade + ikon yedeğine düşer.
 */
const IMG = {
    techSummit: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnnFjFN-8ZQTH9k1gARkDo_OqOdch-lp1z2AqN0CKceQ_ZZkhodcBmcZmA5zJhEjrRwkyhfFOwz6s1FCa_M3Te5lZi8FqP2Y0-UYQdffF1_i8rX5EDHXvatdUkFLS9RTiRWpE4gzVH_LFRUskpe5AhRSty4JxA1mraL8PmShRzCcO9hkdYy8z5AtuIKezI9ij13nMKUVGLHIYFd5wqYLJbKOJaTWoJAiRI5PRd-k4l0JnSfg22wurPfgy4kApCCzHiNWofsCavvKo',
    health: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYmjdvT08g0Ve9sh9Tyo1vUHREsRfDQDwAMzpijvIMDA2pO6cbxnJITkrlDc8xVbFjMaLwhnmI8_ZYXw88-RSxrXJ_67I4yLXIFfa8M1W4EgJZ5adtqS5xauHe96kjLzuHijdWNDy4wueDbqHAoH9b_VQ6VYFiOUDj9StYqLTLnh15zvZlVob6I-TwJg4HctQLQrp68R4h5qIYJvae4PsaYErysGn-5_oXAiD3zif2nwz_rCh9aR_D6-djzdYdLGsUJz6YZt5xOaA',
    fintech: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwwxg-9VrHP_wpcI7bZRfG0Pm_X4ovLg0C_ppoBw8m3ZxVgQkECGsyJtbk9cLchOuOKT_xJt1z7KmrvoLM4fIZpI0Mt9qX7il_E50fjZLY_wZF0p_XZFC6ComlW-xGcqMXRaONpAEhXuiDPnH-V3BS75foetnjU72u9fyOzG0WJFYkBjMHetEd6rf9Nyr35hpuca_KfwfdDu10mSJPAoT7z-TVu1pvKL4ylRZrcSVOmgOPU83CgyHN2pcprNQGOXMT8lzKHaIyj8E',
    sustainability: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX37JtAJkCmNpLIkRL8juAjstsqrnrJUlLfNizgwcItCFwrxZ5i4Uv3RC4SO4aTCDELmWa9jK4b4xwE0NfC14V9U7K73U48w3Tho_o9CbfWFJcwIdrs4GuTb_Vt3kUjv6uHyuBILEScUkAuOJ0Lyl1_mG82Aj83Aoy3AX6CfofSGi_UYo0PjGeZFq5NA2jiFjipqkgzHrOTk0hgDCjEXFo3Gd9A305fKvrTyBDCnCG1IQ47giZGo81bybR24am-_eH6RT_pX2XCFo',
    creative: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2Taqs6s2Nn7TD3vRsMubs1OeRNZNTsarqFHC4SKfTjdGDYNAGHsOT8JeLWCt2xI8aneFTPXpSyhBVlqfiKImBWLIo0ulLYiQQYalBvOs5Rk8w0M3Fmj3QuQ9q-HVYgXVBKIjpJzEhkcmVYUjY6XQAAaIoJQNbLETXanfSFGEkutS2sl08kd-h0hMOrTT9fr-mJchqMKHwyOFiA5-cwGsAGjrK8d8p8wLTDS9OjYGvARKZubzs0K3u3f7TvN24hmVA5xze6yhugDU',
    medical: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFAVGbs-6WTKYcKevEMeLbCRlsOw6fCVFdpDJe4qn0etbmrVGCqzboaQhF9BlT4HZgmcErzhcwMrciHbv-95WtgNd38Eewix4GxggUL_T986o4WbOwJzk8iv2GKNKqofKm3IBzkrSxWCxGpSvpHjZ5KeJAYUzdTAB2pNPh7G-IhOV9LJiCc0kJW3PlUtzSOy_p8e0v5mhaV6f_tc_ylNAIr4pJ4gGDxYmPPEMZQTY0RfL4_4ZrsZK-guVIEALZE1OOS9M3qV-QXDA',
    avatarOrganizer: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYQMuR73srrdWyU_4PmgX1-rFbDY69ePFoVqWJg8tEy5dex0uJeGt3kOTivlOVAzy9fQggAafffrfw966bqZheZCQE_zO9pw9YPlFKHf_M8gl426MiXhQWQrAQdN1OLr_FFg9dmcgLRn2JeRxiudfJdLUVJlh3WUntsTOxvQofec2tmwcJEq-OICOd7prGPrIWn1NX7sqUbWfOypYDfX0MYEz9nM57sFKGyXkl-asn7WVgTNNv6rE_Io7Lma125UakKIEYS5UUgbo',
    avatarSponsor: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEnkHrsP0P0Gj9g6etps8ik1nMGftZQxNh4gd_FjvEDl56YGKucpphRFBEzGVviplQQSuPeu2RSoYEp_cTcqOR2BYU6RbnnOCXmJD7r7PpNS2xCPwaI-Pc8cmKBaxldWTUHIOu0JFx-Vs9J3msWiLwZ8znHzlNkpCriG5Z_uRQaAkuKaouTSYEN0UZYbjpaVUIQY_1nDn7CDR1SOg0UOJcQzT7hYx185YnQRoRvylWcMx7CZMR8Q7lkiAegBO8yeBcE4RW9HDOWCY',
};
/* -------------------------------------------------------------------------- */
/* Kullanıcılar                                                                */
/* -------------------------------------------------------------------------- */
export const seedUsers = [
    {
        id: 'usr_organizer',
        fullName: 'Ayşe Yılmaz',
        email: 'ayse@sponsormatch.ai',
        companyName: 'Anadolu Etkinlik A.Ş.',
        role: 'organizer',
        title: 'Organizatör Admin',
        avatarUrl: IMG.avatarOrganizer,
        phone: '+90 532 000 00 01',
        createdAt: '2025-09-01T09:00:00.000Z',
    },
    {
        id: 'usr_sponsor',
        fullName: 'Mehmet Demir',
        email: 'mehmet@globalfinans.com',
        companyName: 'Global Finans',
        role: 'sponsor',
        title: 'Marka Ortaklıkları Direktörü',
        avatarUrl: IMG.avatarSponsor,
        phone: '+90 532 000 00 02',
        createdAt: '2025-09-04T09:00:00.000Z',
    },
];
/* -------------------------------------------------------------------------- */
/* Etkinlikler                                                                 */
/* -------------------------------------------------------------------------- */
export const seedEvents = [
    {
        id: 'evt_web3',
        name: 'Web3 Zirvesi 2026',
        category: 'Teknoloji & Yazılım',
        dateLabel: '15-16 Kasım 2026',
        startDate: '2026-11-15T09:00:00.000Z',
        location: 'İstanbul',
        description: 'Blok zinciri mimarları, merkeziyetsiz uygulama geliştiricileri ve kurumsal yatırımcıları buluşturan bölgenin en kapsamlı Web3 buluşması.',
        attendeesLabel: '5.000+',
        attendees: 5000,
        coverImageUrl: IMG.techSummit,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 94,
        aiNote: 'Bu etkinlik, teknoloji liderliği vizyonunuzla %94 oranında örtüşmektedir.',
        packages: [
            { id: 'pkg_w1', name: 'Platin', priceLabel: '$50k', tier: 'Platin' },
            { id: 'pkg_w2', name: 'Altın', priceLabel: '$25k', tier: 'Altın' },
            { id: 'pkg_w3', name: 'Gümüş', priceLabel: '$10k', tier: 'Gümüş' },
        ],
        proposalCount: 12,
        bookmarked: false,
        createdAt: '2026-01-10T10:00:00.000Z',
    },
    {
        id: 'evt_tech',
        name: 'Küresel Teknoloji İnovasyon Zirvesi 2026',
        category: 'Teknoloji & Yazılım',
        dateLabel: '15-17 Ekim 2026',
        startDate: '2026-10-15T09:00:00.000Z',
        location: 'İstanbul',
        description: 'Yazılım geliştiriciler, BT liderleri ve teknoloji girişimcileri için yapay zeka odaklı en büyük buluşma.',
        attendeesLabel: '5.000+',
        attendees: 5000,
        coverImageUrl: IMG.techSummit,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 94,
        aiNote: 'Bu etkinlik, teknoloji liderliği vizyonunuzla %94 oranında örtüşmektedir.',
        packages: [
            { id: 'pkg_t1', name: 'Platin', priceLabel: '$50k', tier: 'Platin' },
            { id: 'pkg_t2', name: 'Altın', priceLabel: '$25k', tier: 'Altın' },
        ],
        proposalCount: 8,
        bookmarked: false,
        createdAt: '2026-01-08T10:00:00.000Z',
    },
    {
        id: 'evt_health',
        name: 'Dijital Sağlığın Geleceği Forumu',
        category: 'Sağlık & Biyoteknoloji',
        dateLabel: '02 Kasım 2026',
        startDate: '2026-11-02T09:00:00.000Z',
        location: 'Ankara',
        description: 'Tıp profesyonellerini ve teknoloji mucitlerini teletıp ve giyilebilir teşhis cihazlarını tartışmak üzere bir araya getiriyor.',
        attendeesLabel: '1.200+',
        attendees: 1200,
        coverImageUrl: IMG.health,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 88,
        aiNote: 'Bu etkinlik, sağlık teknolojileri yatırım stratejinizle yüksek oranda örtüşmektedir.',
        packages: [
            { id: 'pkg_h1', name: 'Ana Sponsor', priceLabel: '$100k', tier: 'Elmas' },
            { id: 'pkg_h2', name: 'Oturum', priceLabel: '$10k', tier: 'Gümüş' },
        ],
        proposalCount: 5,
        bookmarked: true,
        createdAt: '2026-01-05T10:00:00.000Z',
    },
    {
        id: 'evt_fintech',
        name: 'FinTech Evrim Fuarı',
        category: 'Finans & Fintech',
        dateLabel: '10-12 Aralık 2026',
        startDate: '2026-12-10T09:00:00.000Z',
        location: 'İstanbul',
        description: 'Finansal teknolojilerin yeni dalgasını, blok zinciri altyapısını ve dijital bankacılık çözümlerini keşfedin.',
        attendeesLabel: '8.500+',
        attendees: 8500,
        coverImageUrl: IMG.fintech,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 75,
        aiNote: 'Bu etkinlik, sürdürülebilirlik vizyonunuzla orta düzeyde örtüşmektedir.',
        packages: [
            { id: 'pkg_f1', name: 'Elmas', priceLabel: '$75k', tier: 'Elmas' },
            { id: 'pkg_f2', name: 'Stant', priceLabel: '$5k', tier: 'Bronz' },
        ],
        proposalCount: 9,
        bookmarked: false,
        createdAt: '2026-01-03T10:00:00.000Z',
    },
    {
        id: 'evt_green',
        name: 'Yeşil Enerji ve Akıllı Şehirler Kongresi',
        category: 'Sürdürülebilirlik & Çevre',
        dateLabel: '05 Kasım 2026',
        startDate: '2026-11-05T09:00:00.000Z',
        location: 'Ankara',
        description: 'Yenilenebilir enerji yatırımcıları, belediyeler ve akıllı şehir teknolojisi üreticilerinin ortak platformu.',
        attendeesLabel: '1.200+',
        attendees: 1200,
        coverImageUrl: IMG.sustainability,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 92,
        aiNote: 'ESG hedeflerinizle güçlü uyum gösteriyor; marka algısına olumlu katkı bekleniyor.',
        packages: [
            { id: 'pkg_g1', name: 'Ana Sponsor', priceLabel: '$60k', tier: 'Platin' },
            { id: 'pkg_g2', name: 'Panel Oturumu', priceLabel: '$15k', tier: 'Altın' },
        ],
        proposalCount: 6,
        bookmarked: false,
        createdAt: '2026-01-02T10:00:00.000Z',
    },
    {
        id: 'evt_urban',
        name: 'Urban Creative Festival',
        category: 'Sanat, Medya & Eğlence',
        dateLabel: '28 Eylül 2026',
        startDate: '2026-09-28T09:00:00.000Z',
        location: 'İzmir',
        description: 'Şehir merkezinde üç gün süren, deneyimsel pazarlama aktivasyonlarına açık yaratıcı endüstriler festivali.',
        attendeesLabel: '15.000+',
        attendees: 15000,
        coverImageUrl: IMG.creative,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 85,
        aiNote: 'Genç kitleye erişim hedefinizle uyumlu; deneyim alanı paketleri öneriliyor.',
        packages: [
            { id: 'pkg_u1', name: 'Deneyim Alanı', priceLabel: '$40k', tier: 'Platin' },
            { id: 'pkg_u2', name: 'Marka Elçisi', priceLabel: '$12k', tier: 'Altın' },
        ],
        proposalCount: 11,
        bookmarked: false,
        createdAt: '2025-12-28T10:00:00.000Z',
    },
    {
        id: 'evt_medtech',
        name: 'Tıp Teknolojileri Kongresi',
        category: 'Sağlık & Biyoteknoloji',
        dateLabel: '15-18 Aralık 2026',
        startDate: '2026-12-15T09:00:00.000Z',
        location: 'Antalya',
        description: 'Klinik araştırmacılar ve medikal cihaz üreticilerinin bir araya geldiği bilimsel kongre.',
        attendeesLabel: '800',
        attendees: 800,
        coverImageUrl: IMG.medical,
        status: 'seeking',
        organizerId: 'usr_organizer',
        organizerName: 'Anadolu Etkinlik A.Ş.',
        aiMatchScore: 94,
        aiNote: 'AR-GE yatırım odağınızla en yüksek uyumu gösteren etkinliklerden biri.',
        packages: [
            { id: 'pkg_m1', name: 'Bilimsel Destek', priceLabel: '$35k', tier: 'Platin' },
            { id: 'pkg_m2', name: 'Sergi Alanı', priceLabel: '$8k', tier: 'Gümüş' },
        ],
        proposalCount: 4,
        bookmarked: false,
        createdAt: '2025-12-20T10:00:00.000Z',
    },
];
/* -------------------------------------------------------------------------- */
/* Sponsorlar                                                                  */
/* -------------------------------------------------------------------------- */
export const seedSponsors = [
    {
        id: 'spn_global',
        name: 'Global Finans',
        industry: 'Finans & Fintech',
        logoIcon: 'corporate_fare',
        about: 'Global Finans, kurumsal bankacılık ve yatırım çözümleri sunan, 40 ülkede faaliyet gösteren bir finans grubudur. Etkinlik sponsorluklarını marka bilinirliği ve nitelikli müşteri kazanımı hedefleriyle yürütür.',
        website: 'globalfinans.com',
        location: 'İstanbul, Türkiye',
        employeeRange: '5.000-10.000 çalışan',
        annualBudgetLabel: formatTRY(12000000),
        focusAreas: ['Fintech', 'Kurumsal Bankacılık', 'Girişim Sermayesi', 'Dijital Ödemeler'],
        esgGoals: [
            '2030 yılına kadar karbon nötr operasyon',
            'Kadın girişimcilere yönelik finansman programları',
            'Finansal okuryazarlık eğitimlerinin yaygınlaştırılması',
        ],
        aiAnalysis: {
            score: 98,
            summary: 'Marka konumlandırması ve hedef kitle profili, etkinliğinizin katılımcı demografisiyle çok yüksek örtüşme gösteriyor.',
            strengths: [
                'Hedef kitle örtüşmesi %96 seviyesinde',
                'Geçmiş sponsorluklarda yüksek aktivasyon bütçesi',
                'Karar süreci hızlı; ortalama 11 günde sonuçlanıyor',
            ],
            risks: ['Sektör dışı etkinliklerde marka görünürlüğü beklentisi yüksek'],
        },
    },
    {
        id: 'spn_techcorp',
        name: 'TechCorp A.Ş.',
        industry: 'Teknoloji & Yazılım',
        logoIcon: 'business',
        about: 'Kurumsal bulut altyapısı ve yapay zeka çözümleri geliştiren teknoloji şirketi. Geliştirici topluluklarına yönelik etkinliklerde aktif sponsorluk yürütür.',
        website: 'techcorp.com.tr',
        location: 'İstanbul, Türkiye',
        employeeRange: '1.000-5.000 çalışan',
        annualBudgetLabel: formatTRY(8000000),
        focusAreas: ['Bulut Bilişim', 'Yapay Zeka', 'Geliştirici İlişkileri', 'SaaS'],
        esgGoals: [
            'Veri merkezlerinde %100 yenilenebilir enerji',
            'Açık kaynak projelerine yıllık destek fonu',
        ],
        aiAnalysis: {
            score: 92,
            summary: 'Teknoloji odaklı etkinliklerde güçlü geçmiş performans; geliştirici kitlesine erişimde etkili.',
            strengths: [
                'Teknik içerik üretiminde iş birliğine açık',
                'Stand ve atölye aktivasyonlarında deneyimli',
            ],
            risks: ['Bütçe onay süreci çeyrek dönem başlarına bağlı'],
        },
    },
    {
        id: 'spn_yesil',
        name: 'Yeşil Enerji Ltd.',
        industry: 'Sürdürülebilirlik & Çevre',
        logoIcon: 'storefront',
        about: 'Rüzgâr ve güneş enerjisi santralleri işleten, sürdürülebilirlik odaklı etkinliklerde ana sponsorluk arayan enerji şirketi.',
        website: 'yesilenerji.com.tr',
        location: 'İzmir, Türkiye',
        employeeRange: '500-1.000 çalışan',
        annualBudgetLabel: formatTRY(4500000),
        focusAreas: ['Yenilenebilir Enerji', 'Karbon Ayak İzi', 'Akıllı Şehirler'],
        esgGoals: [
            'Kurulu kapasitenin 2028 sonuna kadar iki katına çıkarılması',
            'Yerel istihdam oranının %80 üzerinde tutulması',
        ],
        aiAnalysis: {
            score: 85,
            summary: 'ESG temalı etkinliklerde güçlü uyum; teknoloji odaklı içerikte orta düzeyde eşleşme.',
            strengths: ['Sürdürülebilirlik temalı içeriklerde doğal marka uyumu'],
            risks: ['Teknoloji odaklı kitlede marka bilinirliği görece düşük'],
        },
    },
];
/* -------------------------------------------------------------------------- */
/* Teklifler                                                                   */
/* -------------------------------------------------------------------------- */
export const seedProposals = [
    {
        id: 'prp_1',
        eventId: 'evt_web3',
        eventName: 'Web3 Zirvesi 2026',
        sponsorId: 'spn_techcorp',
        sponsorName: 'TechCorp A.Ş.',
        sponsorIndustry: 'Teknoloji',
        sponsorIcon: 'business',
        budget: 150000,
        budgetLabel: formatTRY(150000),
        aiScore: 98,
        status: 'pending',
        createdAt: '2026-07-20T10:00:00.000Z',
    },
    {
        id: 'prp_2',
        eventId: 'evt_web3',
        eventName: 'Web3 Zirvesi 2026',
        sponsorId: 'spn_global',
        sponsorName: 'Global Finans',
        sponsorIndustry: 'Finans',
        sponsorIcon: 'corporate_fare',
        budget: 250000,
        budgetLabel: formatTRY(250000),
        aiScore: 94,
        status: 'approved',
        createdAt: '2026-07-18T10:00:00.000Z',
    },
    {
        id: 'prp_3',
        eventId: 'evt_green',
        eventName: 'Yeşil Enerji ve Akıllı Şehirler Kongresi',
        sponsorId: 'spn_yesil',
        sponsorName: 'Yeşil Enerji Ltd.',
        sponsorIndustry: 'Sürdürülebilirlik',
        sponsorIcon: 'storefront',
        budget: 75000,
        budgetLabel: formatTRY(75000),
        aiScore: 85,
        status: 'approved',
        createdAt: '2026-07-15T10:00:00.000Z',
    },
    {
        id: 'prp_4',
        eventId: 'evt_fintech',
        eventName: 'FinTech Evrim Fuarı',
        sponsorId: 'spn_global',
        sponsorName: 'Global Finans',
        sponsorIndustry: 'Finans',
        sponsorIcon: 'corporate_fare',
        budget: 250000,
        budgetLabel: formatTRY(250000),
        aiScore: 98,
        status: 'pending',
        createdAt: '2026-07-12T10:00:00.000Z',
    },
    {
        id: 'prp_5',
        eventId: 'evt_health',
        eventName: 'Dijital Sağlığın Geleceği Forumu',
        sponsorId: 'spn_techcorp',
        sponsorName: 'TechCorp A.Ş.',
        sponsorIndustry: 'Teknoloji',
        sponsorIcon: 'business',
        budget: 90000,
        budgetLabel: formatTRY(90000),
        aiScore: 88,
        status: 'pending',
        createdAt: '2026-07-10T10:00:00.000Z',
    },
];
/* -------------------------------------------------------------------------- */
/* Sponsorluklar, kilometre taşları, deal                                      */
/* -------------------------------------------------------------------------- */
export const seedSponsorships = [
    {
        id: 'sps_1',
        eventId: 'evt_tech',
        eventName: 'Küresel Teknoloji İnovasyon Zirvesi 2026',
        packageName: 'Platin Sponsor',
        amount: 250000,
        amountLabel: formatTRY(250000),
        status: 'active',
        dateLabel: '15-17 Ekim 2026',
        progress: 72,
        contactName: 'Ayşe Yılmaz',
    },
    {
        id: 'sps_2',
        eventId: 'evt_green',
        eventName: 'Yeşil Enerji ve Akıllı Şehirler Kongresi',
        packageName: 'Ana Sponsor',
        amount: 180000,
        amountLabel: formatTRY(180000),
        status: 'negotiating',
        dateLabel: '05 Kasım 2026',
        progress: 25,
        contactName: 'Ayşe Yılmaz',
    },
    {
        id: 'sps_3',
        eventId: 'evt_urban',
        eventName: 'Urban Creative Festival',
        packageName: 'Deneyim Alanı',
        amount: 120000,
        amountLabel: formatTRY(120000),
        status: 'completed',
        dateLabel: '28 Eylül 2026',
        progress: 100,
        contactName: 'Ayşe Yılmaz',
    },
    {
        id: 'sps_4',
        eventId: 'evt_fintech',
        eventName: 'FinTech Evrim Fuarı',
        packageName: 'Elmas',
        amount: 320000,
        amountLabel: formatTRY(320000),
        status: 'active',
        dateLabel: '10-12 Aralık 2026',
        progress: 40,
        contactName: 'Ayşe Yılmaz',
    },
];
export const seedMilestones = [
    {
        id: 'mls_1',
        dateLabel: '24 Ekim 2026',
        title: 'Marka Varlıkları Teslim Tarihi',
        eventName: 'Küresel Teknoloji İnovasyon Zirvesi 2026',
        isCurrent: true,
    },
    {
        id: 'mls_2',
        dateLabel: '02 Kasım 2026',
        title: 'Ödeme: Son Taksit',
        eventName: 'Dijital Sağlığın Geleceği Forumu',
        isCurrent: false,
    },
    {
        id: 'mls_3',
        dateLabel: '15 Kasım 2026',
        title: 'Etkinlik Açılışı',
        eventName: 'Web3 Zirvesi 2026',
        isCurrent: false,
    },
];
export const seedDeals = [
    {
        id: 'sps_1',
        eventName: 'Küresel Teknoloji İnovasyon Zirvesi 2026',
        sponsorName: 'Global Finans',
        packageName: 'Platin Sponsor',
        amountLabel: formatTRY(250000),
        paymentTerms: '%50 peşin, %50 etkinlik sonrası 30 gün',
        contractStatus: 'İmza bekliyor',
        deliverables: [
            { id: 'dlv_1', label: 'Ana sahne arka plan logosu', done: true },
            { id: 'dlv_2', label: 'Açılış konuşması (15 dk)', done: true },
            { id: 'dlv_3', label: '6 m² stant alanı', done: false },
            { id: 'dlv_4', label: 'Katılımcı listesi paylaşımı', done: false },
            { id: 'dlv_5', label: 'Sosyal medya duyuru paketi', done: false },
        ],
        notes: [
            {
                id: 'dnt_1',
                authorId: 'usr_organizer',
                authorName: 'Ayşe Yılmaz',
                authorAvatarUrl: IMG.avatarOrganizer,
                body: 'Merhaba Mehmet Bey, sahne görselleri için son teslim tarihini 24 Ekim olarak güncelledik.',
                createdAt: '2026-07-28T09:15:00.000Z',
            },
            {
                id: 'dnt_2',
                authorId: 'usr_sponsor',
                authorName: 'Mehmet Demir',
                authorAvatarUrl: IMG.avatarSponsor,
                body: 'Teşekkürler, tasarım ekibimiz hazırlıyor. Stant alanının kroki üzerindeki konumunu paylaşabilir misiniz?',
                createdAt: '2026-07-28T11:40:00.000Z',
            },
        ],
    },
    {
        id: 'sps_4',
        eventName: 'FinTech Evrim Fuarı',
        sponsorName: 'Global Finans',
        packageName: 'Elmas',
        amountLabel: formatTRY(320000),
        paymentTerms: 'Üç eşit taksit',
        contractStatus: 'İmzalandı',
        deliverables: [
            { id: 'dlv_6', label: 'Fuar girişi marka kapısı', done: true },
            { id: 'dlv_7', label: 'Panel moderatörlüğü', done: false },
            { id: 'dlv_8', label: 'Dijital katalog reklamı', done: false },
        ],
        notes: [],
    },
];
/* -------------------------------------------------------------------------- */
/* Mesajlaşma                                                                  */
/* -------------------------------------------------------------------------- */
export const seedConversations = [
    {
        id: 'cnv_1',
        participantName: 'TechCorp A.Ş.',
        participantAvatarUrl: '',
        lastMessage: 'Sponsorluk paketleri hakkında detaylı bilgi alabilir miyiz?',
        lastMessageAt: '2026-08-01T08:30:00.000Z',
        unreadCount: 2,
        online: true,
    },
    {
        id: 'cnv_2',
        participantName: 'Global Finans',
        participantAvatarUrl: IMG.avatarSponsor,
        lastMessage: 'Sözleşmeyi hukuk ekibimize ilettik, dönüş yapacağız.',
        lastMessageAt: '2026-07-31T16:05:00.000Z',
        unreadCount: 0,
        online: false,
    },
    {
        id: 'cnv_3',
        participantName: 'Yenilikçi Çözümler',
        participantAvatarUrl: '',
        lastMessage: 'Etkinlik tarihinde bir değişiklik olacak mı?',
        lastMessageAt: '2026-07-30T10:20:00.000Z',
        unreadCount: 1,
        online: false,
    },
];
export const seedMessages = [
    {
        id: 'msg_1',
        conversationId: 'cnv_1',
        body: 'Merhaba, Web3 Zirvesi için sponsorluk seçeneklerinizi inceledik.',
        createdAt: '2026-08-01T08:10:00.000Z',
        senderId: 'spn_techcorp',
        senderName: 'TechCorp A.Ş.',
    },
    {
        id: 'msg_2',
        conversationId: 'cnv_1',
        body: 'Merhaba, ilginiz için teşekkürler. Platin ve Altın paketlerimizde yer kalmış durumda.',
        createdAt: '2026-08-01T08:22:00.000Z',
        senderId: 'usr_organizer',
        senderName: 'Ayşe Yılmaz',
    },
    {
        id: 'msg_3',
        conversationId: 'cnv_1',
        body: 'Sponsorluk paketleri hakkında detaylı bilgi alabilir miyiz?',
        createdAt: '2026-08-01T08:30:00.000Z',
        senderId: 'spn_techcorp',
        senderName: 'TechCorp A.Ş.',
    },
    {
        id: 'msg_4',
        conversationId: 'cnv_2',
        body: 'Anlaşma taslağını paylaştım, incelemenizi rica ederim.',
        createdAt: '2026-07-31T15:40:00.000Z',
        senderId: 'usr_organizer',
        senderName: 'Ayşe Yılmaz',
    },
    {
        id: 'msg_5',
        conversationId: 'cnv_2',
        body: 'Sözleşmeyi hukuk ekibimize ilettik, dönüş yapacağız.',
        createdAt: '2026-07-31T16:05:00.000Z',
        senderId: 'spn_global',
        senderName: 'Global Finans',
    },
    {
        id: 'msg_6',
        conversationId: 'cnv_3',
        body: 'Etkinlik tarihinde bir değişiklik olacak mı?',
        createdAt: '2026-07-30T10:20:00.000Z',
        senderId: 'spn_yesil',
        senderName: 'Yenilikçi Çözümler',
    },
];
/* -------------------------------------------------------------------------- */
/* Faturalandırma                                                              */
/* -------------------------------------------------------------------------- */
export const seedSubscription = {
    planName: 'Premium Organizatör Planı',
    priceLabel: `${formatTRY(2490)}/ay`,
    billingCycle: 'Aylık faturalandırma',
    renewsAt: '01 Eylül 2026',
    features: [
        'Sınırsız etkinlik yayınlama',
        'Gelişmiş AI eşleştirme',
        'Öncelikli destek',
        'Detaylı ROI analitiği',
        'Deal Room ve sözleşme yönetimi',
        'Özel marka sayfası',
    ],
    limits: [
        { label: 'Aktif etkinlik', used: 7, total: 25 },
        { label: 'AI eşleştirme kredisi', used: 340, total: 1000 },
        { label: 'Ekip üyesi', used: 3, total: 10 },
    ],
};
export const seedPaymentMethod = {
    brand: 'Visa',
    last4: '4242',
    expiry: '08/28',
    holderName: 'Ayşe Yılmaz',
};
export const seedInvoices = [
    {
        id: 'inv_1',
        number: 'SM-2026-0007',
        dateLabel: '01 Ağustos 2026',
        description: 'Premium Organizatör Planı — Ağustos 2026',
        amountLabel: formatTRY(2490),
        status: 'paid',
        downloadUrl: '#',
    },
    {
        id: 'inv_2',
        number: 'SM-2026-0006',
        dateLabel: '01 Temmuz 2026',
        description: 'Premium Organizatör Planı — Temmuz 2026',
        amountLabel: formatTRY(2490),
        status: 'paid',
        downloadUrl: '#',
    },
    {
        id: 'inv_3',
        number: 'SM-2026-0005',
        dateLabel: '01 Haziran 2026',
        description: 'Premium Organizatör Planı — Haziran 2026',
        amountLabel: formatTRY(2490),
        status: 'paid',
        downloadUrl: '#',
    },
    {
        id: 'inv_4',
        number: 'SM-2026-0004',
        dateLabel: '01 Mayıs 2026',
        description: 'Ek AI eşleştirme kredisi paketi',
        amountLabel: formatTRY(890),
        status: 'pending',
        downloadUrl: '#',
    },
];
/* -------------------------------------------------------------------------- */
/* Ayarlar                                                                     */
/* -------------------------------------------------------------------------- */
export const seedNotificationSettings = {
    newProposal: true,
    aiScoreUpdate: true,
    newMessage: true,
    weeklyDigest: true,
    productUpdates: false,
    digestFrequency: 'weekly',
};
export const seedSecuritySettings = {
    twoFactorEnabled: true,
    sessions: [
        {
            id: 'ses_1',
            device: 'Chrome · Windows 11',
            location: 'İstanbul, Türkiye',
            lastActiveLabel: 'Şu anda aktif',
            isCurrent: true,
        },
        {
            id: 'ses_2',
            device: 'Safari · iPhone 15',
            location: 'İstanbul, Türkiye',
            lastActiveLabel: '2 saat önce',
            isCurrent: false,
        },
        {
            id: 'ses_3',
            device: 'Firefox · macOS',
            location: 'Ankara, Türkiye',
            lastActiveLabel: '3 gün önce',
            isCurrent: false,
        },
    ],
    log: [
        {
            id: 'log_1',
            action: 'Başarılı giriş',
            detail: 'Chrome · Windows 11 · İstanbul',
            dateLabel: '01 Ağustos 2026, 09:12',
        },
        {
            id: 'log_2',
            action: 'Şifre değiştirildi',
            detail: 'Ayarlar üzerinden güncellendi',
            dateLabel: '18 Temmuz 2026, 14:35',
        },
        {
            id: 'log_3',
            action: 'İki adımlı doğrulama etkinleştirildi',
            detail: 'E-posta tabanlı doğrulama',
            dateLabel: '02 Temmuz 2026, 11:08',
        },
    ],
};
/* -------------------------------------------------------------------------- */
/* Hukuki metinler                                                             */
/* -------------------------------------------------------------------------- */
export const seedLegalDocs = [
    {
        slug: 'gizlilik',
        title: 'Gizlilik Politikası',
        updatedAt: '01 Ocak 2026',
        sections: [
            {
                heading: '1. Giriş ve Amaç',
                paragraphs: [
                    'SponsorMatch AI olarak, verilerinizin güvenliği ve gizliliği bizim için en öncelikli konudur. Bu belge, platformumuzu kullandığınızda verilerinizin nasıl toplandığını ve işlendiğini açıklar.',
                    'Toplanan veriler, yalnızca size en uygun sponsorluk eşleşmelerini sunmak ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.',
                ],
                callout: {
                    title: 'Önemli Hatırlatma',
                    body: 'Yapay zeka modellerimiz yalnızca anonimleştirilmiş veriler üzerinden eğitilir; kurumsal stratejileriniz üçüncü taraflarla paylaşılmaz.',
                },
            },
            {
                heading: '2. İşlenen Kişisel Veriler',
                paragraphs: ['Platform üzerinde aşağıdaki veri kategorileri işlenmektedir:'],
                list: [
                    'Kimlik ve iletişim bilgileri (ad soyad, e-posta, telefon)',
                    'Kurumsal bilgiler (şirket adı, unvan, sektör)',
                    'Etkinlik ve sponsorluk tercihleri',
                    'Platform kullanım kayıtları ve teknik günlükler',
                ],
            },
            {
                heading: '3. Haklarınız ve Saklama Süresi',
                paragraphs: [
                    'GDPR ve yerel veri koruma mevzuatına tam uyum sağlamaktayız. Hesabınızı sildiğinizde, tüm verileriniz yasal saklama yükümlülükleri dışında sunucularımızdan kalıcı olarak temizlenir.',
                    'Verilerinize erişim, düzeltme, silme ve taşınabilirlik haklarınızı destek@sponsormatch.ai adresinden kullanabilirsiniz.',
                ],
            },
        ],
    },
    {
        slug: 'kosullar',
        title: 'Kullanım Şartları',
        updatedAt: '01 Ocak 2026',
        sections: [
            {
                heading: '1. Hizmet Kapsamı',
                paragraphs: [
                    'SponsorMatch AI platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.',
                    'Platform, etkinlik organizatörleri ve potansiyel sponsorlar arasında bir köprü görevi görür. Eşleşmeler yapay zeka tabanlıdır ve tek başına bağlayıcı bir taahhüt oluşturmaz.',
                ],
            },
            {
                heading: '2. Kullanıcı Sorumlulukları',
                paragraphs: [
                    'Kullanıcılar, sağladıkları bilgilerin doğruluğundan sorumludur. Yanıltıcı içerik girişi, hesabın askıya alınmasına neden olabilir.',
                ],
                list: [
                    'Hesap bilgilerinizin gizliliğini korumak',
                    'Platform üzerinden yanıltıcı veya hukuka aykırı içerik paylaşmamak',
                    'Diğer kullanıcıların verilerini izinsiz toplamamak',
                ],
            },
            {
                heading: '3. Ücretlendirme ve Fesih',
                paragraphs: [
                    'Abonelik ücretleri seçilen plana göre aylık veya yıllık olarak tahsil edilir. Aboneliğinizi dilediğiniz zaman iptal edebilirsiniz; iptal, dönem sonunda geçerli olur.',
                ],
            },
        ],
    },
    {
        slug: 'kvkk',
        title: 'KVKK Aydınlatma Metni',
        updatedAt: '01 Ocak 2026',
        sections: [
            {
                heading: '1. Veri Sorumlusu',
                paragraphs: [
                    '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca veri sorumlusu SponsorMatch AI’dır. Bu metin, kişisel verilerinizin işlenme amaçlarını ve haklarınızı açıklamaktadır.',
                ],
            },
            {
                heading: '2. İşleme Amaçları ve Hukuki Sebep',
                paragraphs: [
                    'Kişisel verileriniz; sözleşmenin kurulması ve ifası, meşru menfaat ve açık rıza hukuki sebeplerine dayanarak işlenmektedir.',
                ],
                list: [
                    'Üyelik kaydının oluşturulması ve yönetilmesi',
                    'Sponsorluk eşleştirme hizmetinin sunulması',
                    'Faturalandırma ve muhasebe yükümlülüklerinin yerine getirilmesi',
                    'Platform güvenliğinin sağlanması',
                ],
            },
            {
                heading: '3. Başvuru Yolu',
                paragraphs: [
                    'KVKK kapsamındaki taleplerinizi destek@sponsormatch.ai adresine iletebilirsiniz. Başvurular en geç 30 gün içinde sonuçlandırılır.',
                ],
            },
        ],
    },
];
//# sourceMappingURL=seed.js.map