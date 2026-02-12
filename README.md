# Finance Hub 💰

Nowoczesna aplikacja do zarządzania finansami osobistymi i śledzenia inwestycji.

## 🚀 Technologie

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark Mode)
- **Recharts** (Wykresy finansowe)
- **Zustand** (Zarządzanie stanem)
- **Lucide React** (Ikony)

## ✨ Główne funkcjonalności

### 📊 Dashboard
- Przegląd Net Worth (całkowitego majątku)
- Statystyki: Total Income, Total Outcome, Profit/Loss
- Podział na portfele (Gotówka, Konto Bankowe, Krypto, Giełda)

### 📈 Wykresy i Analiza
- **Wykres wartości portfela** z przełącznikiem interwałów (1D, 1W, 1M)
- **Miesięczny cashflow** - porównanie przychodów i wydatków
- **Wykres skumulowanego zysku** - trend w czasie
- **Widget BTC/PLN** - kurs Bitcoina z API CoinGecko

### 💼 Aktywa
- Lista posiadanych aktywów (Bitcoin, Ethereum, akcje, złoto)
- Automatyczne przeliczanie wartości
- Zmiana 24h dla każdego aktywa

### 💸 Transakcje
- Lista ostatnich transakcji
- Kolorystyka: zielony (Income), czerwony (Outcome)
- Modal do dodawania nowych transakcji

## 🛠️ Instalacja i uruchomienie

### Wymagania
- Node.js 18+
- npm lub yarn

### Kroki

1. **Instalacja zależności**
```bash
npm install
# lub
yarn install
```

2. **Uruchomienie w trybie deweloperskim**
```bash
npm run dev
# lub
yarn dev
```

3. **Otwórz przeglądarkę**
```
http://localhost:3000
```

4. **Build produkcyjny**
```bash
npm run build
npm start
```

## 📁 Struktura projektu

```
finance-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Główny layout
│   │   ├── page.tsx            # Strona główna (Dashboard)
│   │   └── globals.css         # Style globalne
│   ├── components/
│   │   ├── DashboardLayout.tsx # Layout z sidebar
│   │   ├── WalletCard.tsx      # Karta portfela
│   │   ├── FinancialChart.tsx  # Główny wykres z interwałami
│   │   ├── MonthlyIncomeChart.tsx  # Wykres miesięczny
│   │   ├── ProfitChart.tsx     # Wykres zysków
│   │   ├── BTCWidget.tsx       # Widget BTC/PLN
│   │   ├── AssetList.tsx       # Lista aktywów
│   │   ├── TransactionList.tsx # Lista transakcji
│   │   └── TransactionModal.tsx # Modal dodawania transakcji
│   └── hooks/
│       └── useFinanceStore.ts  # Zustand store z danymi
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🎨 Funkcjonalności

### Zarządzanie stanem (Zustand)
- Dane zapisywane w localStorage
- Automatyczne przeliczanie totalów
- Dodawanie transakcji z automatyczną aktualizacją portfeli

### Wykresy (Recharts)
- **AreaChart** - wartość portfela w czasie
- **BarChart** - miesięczny cashflow
- **LineChart** - trend zysków i kurs BTC
- Custom tooltips z formatowaniem walut

### API Integration
- Widget BTC/PLN pobiera dane z CoinGecko API
- Automatyczna aktualizacja co minutę
- Fallback na dane mockowe przy błędzie

## 🎯 Mock Data

Aplikacja zawiera bogaty zestaw danych testowych:
- 4 portfele z różnymi balansami
- 15+ transakcji z różnych kategorii
- 6 aktywów (BTC, ETH, akcje, złoto)
- Dane do wykresów (dzienne, tygodniowe, miesięczne)

## 🔧 Konfiguracja

### Dark Mode
Aplikacja wykorzystuje ciemny motyw z akcentami:
- Fioletowy (główny akcent)
- Zielony (przychody)
- Czerwony (wydatki)
- Niebieski/Cyan (wykresy)
- Pomarańczowy (krypto)

### Responsywność
- Mobile-first design
- Sidebar ukryty na mobile (<lg)
- Grid layouts dostosowane do rozmiaru ekranu

## 📝 Dodatkowe notatki

- Wszystkie kwoty formatowane dla PLN
- Daty w formacie polskim
- Kompatybilność z latest Node.js
- TypeScript strict mode włączony

## 🚀 Następne kroki

Możliwe rozszerzenia:
- Backend API (Next.js API Routes)
- Autentykacja użytkowników
- Więcej źródeł danych (akcje, forex)
- Eksport raportów (PDF, CSV)
- Powiadomienia o zmianach cen
- Dark/Light mode toggle

---

**Finance Hub** - Zarządzaj swoimi finansami profesjonalnie! 💎
